// ============================================
// Lead Scoring Engine
// ============================================
// Calculates lead quality scores based on configurable factors

import { LeadCase, LeadQualification, QualificationTier, QualificationFactors } from './types';

// ============================================
// SCORING CONFIGURATION
// ============================================

export interface ScoringConfig {
  // Case type values (0-30 points)
  caseTypeValues: Record<string, number>;

  // Liability clarity multipliers
  liabilityValues: {
    clear: number;      // "Other driver ran red light"
    likely: number;     // "I think they were at fault"
    disputed: number;   // "They're saying it's my fault"
    unknown: number;    // "I'm not sure"
    self: number;       // "I might be at fault"
  };

  // Timeline/SOL scoring
  timelineValues: {
    recent: number;           // < 30 days
    within_6_months: number;  // < 6 months
    within_1_year: number;    // < 1 year
    within_2_years: number;   // < 2 years
    near_sol: number;         // < 6 months to SOL
    past_sol: number;         // Past SOL (disqualify)
  };

  // Injury severity
  injuryValues: {
    catastrophic: number;     // Death, paralysis, TBI, amputation
    severe: number;           // Surgery, hospitalization, permanent injury
    moderate: number;         // Fractures, significant treatment
    minor: number;            // Soft tissue, minimal treatment
    none: number;             // No injury
  };

  // Geographic match (is case in service area)
  geographicValues: {
    in_area: number;
    adjacent: number;
    out_of_area: number;
  };

  // Insurance status
  insuranceValues: {
    confirmed: number;        // Defendant has insurance
    likely: number;           // Commercial vehicle, business
    unknown: number;          // Not yet determined
    uninsured: number;        // Defendant uninsured
  };

  // Tier thresholds
  tierThresholds: {
    hot: number;              // >= this score = hot
    warm: number;             // >= this score = warm
    cold: number;             // >= this score = cold
    // Below cold = disqualified
  };

  // Automatic disqualification rules
  disqualificationRules: {
    pastSOL: boolean;
    currentlyRepresented: boolean;
    noInjury: boolean;
    outOfJurisdiction: boolean;
  };
}

// Default scoring configuration
export const DEFAULT_SCORING_CONFIG: ScoringConfig = {
  caseTypeValues: {
    // Personal Injury - High Value
    'personal_injury_catastrophic': 30,
    'personal_injury_surgery': 28,
    'personal_injury_hospitalization': 25,
    'personal_injury_soft_tissue': 18,
    'wrongful_death': 30,
    'medical_malpractice': 28,
    'product_liability': 25,
    'premises_liability': 22,
    'slip_and_fall': 18,
    'dog_bite': 15,

    // Auto Accidents
    'auto_accident_serious': 26,
    'auto_accident_moderate': 20,
    'auto_accident_minor': 12,
    'truck_accident': 28,
    'motorcycle_accident': 24,
    'pedestrian_accident': 26,
    'rideshare_accident': 22,

    // Workers Comp
    'workers_comp_serious': 20,
    'workers_comp_moderate': 15,
    'workers_comp_minor': 10,

    // Family Law
    'divorce_contested': 18,
    'divorce_uncontested': 12,
    'child_custody': 16,
    'child_support': 14,
    'domestic_violence': 20,
    'adoption': 15,

    // Criminal Defense
    'criminal_felony': 22,
    'criminal_misdemeanor': 15,
    'dui_dwi': 18,
    'drug_charges': 16,
    'traffic_violation': 8,

    // Other
    'estate_planning': 12,
    'bankruptcy': 14,
    'immigration': 16,
    'employment': 18,
    'real_estate': 12,
    'business_litigation': 20,
    'general_inquiry': 5,
    'unknown': 10,
  },

  liabilityValues: {
    clear: 20,
    likely: 15,
    disputed: 8,
    unknown: 5,
    self: 0,
  },

  timelineValues: {
    recent: 20,
    within_6_months: 18,
    within_1_year: 15,
    within_2_years: 10,
    near_sol: 5,
    past_sol: -100, // Automatic disqualification
  },

  injuryValues: {
    catastrophic: 15,
    severe: 12,
    moderate: 8,
    minor: 4,
    none: 0,
  },

  geographicValues: {
    in_area: 10,
    adjacent: 5,
    out_of_area: 0,
  },

  insuranceValues: {
    confirmed: 5,
    likely: 4,
    unknown: 2,
    uninsured: 0,
  },

  tierThresholds: {
    hot: 75,
    warm: 50,
    cold: 25,
  },

  disqualificationRules: {
    pastSOL: true,
    currentlyRepresented: true,
    noInjury: false, // Some case types don't require injury
    outOfJurisdiction: false, // Can still refer
  },
};

// ============================================
// SCORING FUNCTIONS
// ============================================

/**
 * Calculate case type score based on case type and subtype
 */
function calculateCaseTypeScore(
  caseType: string | null,
  subtype: string | null,
  config: ScoringConfig
): number {
  if (!caseType) return config.caseTypeValues['unknown'] || 10;

  // Try exact match with subtype first
  const fullType = subtype ? `${caseType}_${subtype}`.toLowerCase().replace(/\s+/g, '_') : null;
  if (fullType && config.caseTypeValues[fullType] !== undefined) {
    return config.caseTypeValues[fullType];
  }

  // Try case type only
  const normalizedType = caseType.toLowerCase().replace(/\s+/g, '_');
  if (config.caseTypeValues[normalizedType] !== undefined) {
    return config.caseTypeValues[normalizedType];
  }

  // Try partial matches
  for (const [key, value] of Object.entries(config.caseTypeValues)) {
    if (normalizedType.includes(key) || key.includes(normalizedType)) {
      return value;
    }
  }

  return config.caseTypeValues['unknown'] || 10;
}

/**
 * Calculate liability clarity score
 */
function calculateLiabilityScore(
  description: string | null,
  config: ScoringConfig
): number {
  if (!description) return config.liabilityValues.unknown;

  const desc = description.toLowerCase();

  // Clear liability indicators
  const clearIndicators = [
    'ran red light', 'ran stop sign', 'rear-ended', 'rear ended',
    'hit and run', 'drunk driver', 'texting', 'on their phone',
    'crossed center line', 'wrong way', 'speeding',
  ];
  if (clearIndicators.some(i => desc.includes(i))) {
    return config.liabilityValues.clear;
  }

  // Likely liability
  const likelyIndicators = [
    'their fault', 'they caused', 'they hit me', 'they ran into',
    'they were negligent', 'failed to',
  ];
  if (likelyIndicators.some(i => desc.includes(i))) {
    return config.liabilityValues.likely;
  }

  // Self-fault indicators
  const selfFaultIndicators = [
    'my fault', 'i caused', 'i hit', 'i ran', 'i was speeding',
    'i was drinking', 'i was texting',
  ];
  if (selfFaultIndicators.some(i => desc.includes(i))) {
    return config.liabilityValues.self;
  }

  // Disputed
  const disputedIndicators = [
    'they say', 'they claim', 'disputed', 'both of us', 'unclear',
  ];
  if (disputedIndicators.some(i => desc.includes(i))) {
    return config.liabilityValues.disputed;
  }

  return config.liabilityValues.unknown;
}

/**
 * Calculate timeline score based on incident date and SOL
 */
function calculateTimelineScore(
  incidentDate: string | null,
  solDate: string | null,
  config: ScoringConfig
): number {
  if (!incidentDate) return config.timelineValues.unknown || 5;

  const incident = new Date(incidentDate);
  const now = new Date();
  const daysSinceIncident = Math.floor((now.getTime() - incident.getTime()) / (1000 * 60 * 60 * 24));

  // Check if past SOL
  if (solDate) {
    const sol = new Date(solDate);
    if (now > sol) {
      return config.timelineValues.past_sol;
    }
    // Check if near SOL (within 6 months)
    const daysUntilSOL = Math.floor((sol.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntilSOL < 180) {
      return config.timelineValues.near_sol;
    }
  }

  // Score based on recency
  if (daysSinceIncident < 30) return config.timelineValues.recent;
  if (daysSinceIncident < 180) return config.timelineValues.within_6_months;
  if (daysSinceIncident < 365) return config.timelineValues.within_1_year;
  if (daysSinceIncident < 730) return config.timelineValues.within_2_years;

  return config.timelineValues.near_sol; // Old but possibly still within SOL
}

/**
 * Calculate injury severity score
 */
function calculateInjuryScore(
  description: string | null,
  config: ScoringConfig
): number {
  if (!description) return config.injuryValues.minor;

  const desc = description.toLowerCase();

  // Catastrophic
  const catastrophicIndicators = [
    'death', 'died', 'fatal', 'paralyz', 'quadripleg', 'parapleg',
    'brain injury', 'tbi', 'traumatic brain', 'amputation', 'lost my',
    'coma', 'vegetative',
  ];
  if (catastrophicIndicators.some(i => desc.includes(i))) {
    return config.injuryValues.catastrophic;
  }

  // Severe
  const severeIndicators = [
    'surgery', 'hospital', 'icu', 'intensive care', 'broken bone',
    'fracture', 'internal bleeding', 'organ', 'permanent', 'disabled',
    'can\'t work', 'cannot work',
  ];
  if (severeIndicators.some(i => desc.includes(i))) {
    return config.injuryValues.severe;
  }

  // Moderate
  const moderateIndicators = [
    'fracture', 'physical therapy', 'pt', 'chiropractor', 'mri',
    'ct scan', 'x-ray', 'sprain', 'torn', 'ligament', 'concussion',
  ];
  if (moderateIndicators.some(i => desc.includes(i))) {
    return config.injuryValues.moderate;
  }

  // Minor
  const minorIndicators = [
    'sore', 'pain', 'ache', 'bruise', 'cut', 'scrape', 'whiplash',
    'stiff', 'tender',
  ];
  if (minorIndicators.some(i => desc.includes(i))) {
    return config.injuryValues.minor;
  }

  // No injury mentioned
  const noInjuryIndicators = [
    'no injury', 'not injured', 'wasn\'t hurt', 'wasn\'t injured',
    'fine', 'okay', 'property damage only',
  ];
  if (noInjuryIndicators.some(i => desc.includes(i))) {
    return config.injuryValues.none;
  }

  return config.injuryValues.minor; // Default to minor if unclear
}

/**
 * Calculate geographic match score
 */
function calculateGeographicScore(
  state: string | null,
  serviceAreaStates: string[],
  adjacentStates: string[],
  config: ScoringConfig
): number {
  if (!state) return config.geographicValues.unknown || 2;

  const stateUpper = state.toUpperCase();

  if (serviceAreaStates.includes(stateUpper)) {
    return config.geographicValues.in_area;
  }

  if (adjacentStates.includes(stateUpper)) {
    return config.geographicValues.adjacent;
  }

  return config.geographicValues.out_of_area;
}

/**
 * Calculate insurance status score
 */
function calculateInsuranceScore(
  description: string | null,
  config: ScoringConfig
): number {
  if (!description) return config.insuranceValues.unknown;

  const desc = description.toLowerCase();

  // Confirmed insurance
  const confirmedIndicators = [
    'has insurance', 'insured', 'insurance company', 'adjuster',
    'claim number', 'policy',
  ];
  if (confirmedIndicators.some(i => desc.includes(i))) {
    return config.insuranceValues.confirmed;
  }

  // Likely insured (commercial, business)
  const likelyIndicators = [
    'commercial', 'truck', 'semi', 'business', 'company vehicle',
    'uber', 'lyft', 'delivery', 'amazon', 'fedex', 'ups',
  ];
  if (likelyIndicators.some(i => desc.includes(i))) {
    return config.insuranceValues.likely;
  }

  // Uninsured
  const uninsuredIndicators = [
    'no insurance', 'uninsured', 'no policy', 'doesn\'t have insurance',
  ];
  if (uninsuredIndicators.some(i => desc.includes(i))) {
    return config.insuranceValues.uninsured;
  }

  return config.insuranceValues.unknown;
}

/**
 * Determine qualification tier based on score
 */
function determineTier(
  score: number,
  config: ScoringConfig
): QualificationTier {
  if (score >= config.tierThresholds.hot) return 'hot';
  if (score >= config.tierThresholds.warm) return 'warm';
  if (score >= config.tierThresholds.cold) return 'cold';
  return 'disqualified';
}

/**
 * Check for automatic disqualification
 */
function checkDisqualification(
  caseInfo: LeadCase,
  factors: QualificationFactors,
  config: ScoringConfig
): { disqualified: boolean; reason: string | null } {
  // Past SOL
  if (config.disqualificationRules.pastSOL && factors.timeline < 0) {
    return { disqualified: true, reason: 'Statute of limitations has expired' };
  }

  // Currently represented
  if (config.disqualificationRules.currentlyRepresented && caseInfo.currently_represented) {
    return { disqualified: true, reason: 'Already represented by another attorney' };
  }

  // No injury (for injury-required cases)
  if (config.disqualificationRules.noInjury && factors.injury_severity === 0) {
    const injuryRequiredTypes = ['personal_injury', 'auto_accident', 'slip_and_fall', 'medical_malpractice'];
    const caseType = caseInfo.type?.toLowerCase().replace(/\s+/g, '_') || '';
    if (injuryRequiredTypes.some(t => caseType.includes(t))) {
      return { disqualified: true, reason: 'No compensable injury reported' };
    }
  }

  return { disqualified: false, reason: null };
}

// ============================================
// MAIN SCORING FUNCTION
// ============================================

export interface ScoreLeadOptions {
  caseInfo: LeadCase;
  config?: Partial<ScoringConfig>;
  serviceAreaStates?: string[];
  adjacentStates?: string[];
}

export interface ScoreLeadResult {
  qualification: LeadQualification;
  breakdown: {
    caseType: { score: number; maxScore: number; explanation: string };
    liability: { score: number; maxScore: number; explanation: string };
    timeline: { score: number; maxScore: number; explanation: string };
    injury: { score: number; maxScore: number; explanation: string };
    geographic: { score: number; maxScore: number; explanation: string };
    insurance: { score: number; maxScore: number; explanation: string };
  };
  recommendations: string[];
}

export function scoreLead(options: ScoreLeadOptions): ScoreLeadResult {
  const config = { ...DEFAULT_SCORING_CONFIG, ...options.config };
  const { caseInfo } = options;
  const serviceAreaStates = options.serviceAreaStates || ['NY', 'NJ', 'CT'];
  const adjacentStates = options.adjacentStates || ['PA', 'MA', 'VT'];

  // Calculate individual factor scores
  const caseTypeScore = calculateCaseTypeScore(caseInfo.type, caseInfo.subtype, config);
  const liabilityScore = calculateLiabilityScore(caseInfo.description, config);
  const timelineScore = calculateTimelineScore(caseInfo.incident_date, caseInfo.statute_of_limitations_date, config);
  const injuryScore = calculateInjuryScore(caseInfo.description, config);
  const geographicScore = calculateGeographicScore(caseInfo.jurisdiction_state, serviceAreaStates, adjacentStates, config);
  const insuranceScore = calculateInsuranceScore(caseInfo.description, config);

  const factors: QualificationFactors = {
    case_value: Math.min(caseTypeScore, 30),
    liability_clarity: Math.min(liabilityScore, 20),
    timeline: Math.min(timelineScore, 20),
    injury_severity: Math.min(injuryScore, 15),
    geographic_match: Math.min(geographicScore, 10),
    insurance_status: Math.min(insuranceScore, 5),
  };

  // Check for disqualification
  const disqualification = checkDisqualification(caseInfo, factors, config);

  // Calculate total score
  let totalScore = Object.values(factors).reduce((sum, val) => sum + Math.max(0, val), 0);
  totalScore = Math.min(100, Math.max(0, totalScore));

  // Determine tier
  let tier: QualificationTier;
  let disqualificationReason: string | null = null;

  if (disqualification.disqualified) {
    tier = 'disqualified';
    disqualificationReason = disqualification.reason;
    totalScore = Math.min(totalScore, 24); // Cap at below cold threshold
  } else {
    tier = determineTier(totalScore, config);
  }

  // Generate recommendations
  const recommendations: string[] = [];

  if (tier === 'hot') {
    recommendations.push('Immediate callback recommended - high-value case');
    recommendations.push('Consider expedited intake process');
  } else if (tier === 'warm') {
    recommendations.push('Follow up within 24 hours');
    recommendations.push('Gather additional documentation');
  } else if (tier === 'cold') {
    recommendations.push('Add to nurture sequence');
    recommendations.push('May benefit from additional qualification');
  } else {
    recommendations.push('Consider referral to appropriate counsel');
    if (disqualificationReason) {
      recommendations.push(`Reason: ${disqualificationReason}`);
    }
  }

  if (timelineScore < 10 && !disqualification.disqualified) {
    recommendations.push('⚠️ SOL concern - prioritize intake');
  }

  if (factors.liability_clarity < 10) {
    recommendations.push('Clarify liability details during follow-up');
  }

  return {
    qualification: {
      score: totalScore,
      tier,
      disqualification_reason: disqualificationReason,
      factors,
    },
    breakdown: {
      caseType: {
        score: factors.case_value,
        maxScore: 30,
        explanation: `Case type: ${caseInfo.type || 'Unknown'}`,
      },
      liability: {
        score: factors.liability_clarity,
        maxScore: 20,
        explanation: liabilityScore >= 15 ? 'Clear liability' : liabilityScore >= 8 ? 'Likely liability' : 'Unclear liability',
      },
      timeline: {
        score: factors.timeline,
        maxScore: 20,
        explanation: timelineScore >= 18 ? 'Recent incident' : timelineScore < 0 ? 'Past SOL' : 'Within SOL',
      },
      injury: {
        score: factors.injury_severity,
        maxScore: 15,
        explanation: injuryScore >= 12 ? 'Severe injury' : injuryScore >= 8 ? 'Moderate injury' : 'Minor or no injury',
      },
      geographic: {
        score: factors.geographic_match,
        maxScore: 10,
        explanation: geographicScore >= 10 ? 'In service area' : geographicScore >= 5 ? 'Adjacent area' : 'Out of area',
      },
      insurance: {
        score: factors.insurance_status,
        maxScore: 5,
        explanation: insuranceScore >= 4 ? 'Insurance confirmed' : 'Insurance unknown',
      },
    },
    recommendations,
  };
}

/**
 * Quick score for real-time display (simplified)
 */
export function quickScore(caseType: string | null, description: string | null): {
  score: number;
  tier: QualificationTier;
  color: string;
} {
  const result = scoreLead({
    caseInfo: {
      type: caseType,
      subtype: null,
      jurisdiction_state: null,
      incident_date: new Date().toISOString(),
      incident_location: null,
      description,
      opposing_party: null,
      statute_of_limitations_date: null,
      sol_warning: false,
      police_report_filed: null,
      currently_represented: false,
      prior_claims: false,
    },
  });

  const colors = {
    hot: '#10B981',      // Green
    warm: '#F59E0B',     // Yellow
    cold: '#3B82F6',     // Blue
    disqualified: '#EF4444', // Red
  };

  return {
    score: result.qualification.score || 0,
    tier: result.qualification.tier || 'cold',
    color: colors[result.qualification.tier || 'cold'],
  };
}
