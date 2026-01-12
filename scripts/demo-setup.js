// Demo Configuration Setup
// Run this in browser console to configure demo settings
// Or copy-paste individual sections as needed

(function setupDemo() {
  console.log('🎬 Setting up demo configuration...');

  // Demo firm branding
  const demoSettings = {
    // Firm Identity
    aiName: 'Sarah',
    firmName: 'Sterling & Associates Law Firm',
    firmBio: 'Sterling & Associates is a premier full-service law firm established in 2010. We specialize in Personal Injury, Family Law, Criminal Defense, and Estate Planning. Our team of 15 experienced attorneys has successfully handled over 5,000 cases with a 94% success rate. Located in the heart of Manhattan, we pride ourselves on providing compassionate, results-driven legal representation.',

    // Branding Colors
    brandPrimaryColor: '#00FFC8',  // Teal accent
    brandSecondaryColor: '#1A1D24', // Dark background
    brandAccentColor: '#A78BFA',    // Purple accent

    // Voice Configuration
    voiceName: 'Kore',
    tone: 'Professional and Empathetic',
    languageStyle: 'calm, clear, and natural human voice',

    // Dialogue
    openingLine: 'Hi, thank you for calling Sterling & Associates Law Firm. My name is Sarah, how may I assist you today?',
    closingLine: 'Thank you for contacting Sterling & Associates. We look forward to helping you with your legal matter. Have a wonderful day!',

    // Urgency Detection
    urgencyKeywords: [
      'court date',
      'deadline',
      'statute of limitations',
      'served papers',
      'arrested',
      'police',
      'emergency',
      'custody',
      'restraining order',
      'eviction'
    ],

    // Features
    hipaaMode: false,
    legalDisclaimer: true,
    auditLogging: true,
    callRecording: false,
    emailNotifications: true,
    smsNotifications: false,

    // Regional
    language: 'en',
    timezone: 'America/New_York',

    // System
    apiKeyConfigured: true,
    responseDelay: 0,
    autoFollowUp: true
  };

  // Save to localStorage
  localStorage.setItem('receptionistSettings', JSON.stringify(demoSettings));

  // Demo team members
  const demoTeam = [
    {
      id: '1',
      name: 'Michael Sterling',
      role: 'attorney',
      title: 'Managing Partner',
      practiceArea: 'Personal Injury',
      email: 'msterling@sterlinglaw.com',
      phone: '(212) 555-0101',
      active: true
    },
    {
      id: '2',
      name: 'Jennifer Walsh',
      role: 'attorney',
      title: 'Senior Partner',
      practiceArea: 'Family Law',
      email: 'jwalsh@sterlinglaw.com',
      phone: '(212) 555-0102',
      active: true
    },
    {
      id: '3',
      name: 'Robert Chen',
      role: 'attorney',
      title: 'Associate',
      practiceArea: 'Criminal Defense',
      email: 'rchen@sterlinglaw.com',
      phone: '(212) 555-0103',
      active: true
    },
    {
      id: '4',
      name: 'Amanda Torres',
      role: 'paralegal',
      title: 'Senior Paralegal',
      practiceArea: 'Estate Planning',
      email: 'atorres@sterlinglaw.com',
      phone: '(212) 555-0104',
      active: true
    }
  ];

  localStorage.setItem('teamMembers', JSON.stringify(demoTeam));

  console.log('✅ Demo configuration applied!');
  console.log('📋 Firm: Sterling & Associates Law Firm');
  console.log('🎤 AI Voice: Sarah (Kore)');
  console.log('👥 Team: 4 members configured');
  console.log('');
  console.log('🔄 Refresh the page to see changes');

  return demoSettings;
})();
