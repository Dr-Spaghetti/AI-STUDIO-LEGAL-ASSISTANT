#!/usr/bin/env npx ts-node
/**
 * Pre-Launch Validation Script
 * ============================
 * Automated checks for production readiness
 *
 * Usage:
 *   npx ts-node scripts/validate-launch.ts
 *   npx ts-node scripts/validate-launch.ts --production https://your-domain.vercel.app
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

// ANSI colors
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  bold: '\x1b[1m',
};

interface ValidationResult {
  name: string;
  status: 'PASS' | 'FAIL' | 'WARN' | 'SKIP';
  message: string;
  critical: boolean;
}

const results: ValidationResult[] = [];

function log(message: string): void {
  console.log(message);
}

function logResult(result: ValidationResult): void {
  const statusColor = {
    PASS: colors.green,
    FAIL: colors.red,
    WARN: colors.yellow,
    SKIP: colors.blue,
  }[result.status];

  const icon = {
    PASS: '✅',
    FAIL: '❌',
    WARN: '⚠️',
    SKIP: '⏭️',
  }[result.status];

  console.log(
    `  ${icon} ${statusColor}${result.status}${colors.reset} - ${result.name}: ${result.message}`
  );
  results.push(result);
}

function section(title: string): void {
  console.log(`\n${colors.bold}${colors.blue}━━━ ${title} ━━━${colors.reset}\n`);
}

// ============================================
// Validation Functions
// ============================================

function validateRequiredFiles(): void {
  section('1. Required Files');

  const requiredFiles = [
    { path: 'package.json', critical: true },
    { path: 'tsconfig.json', critical: true },
    { path: 'vite.config.ts', critical: true },
    { path: 'App.tsx', critical: true },
    { path: 'lib/supabase.ts', critical: true },
    { path: 'lib/sentry.ts', critical: true },
    { path: 'lib/auth.ts', critical: true },
    { path: 'api/health.ts', critical: true },
    { path: 'api/chat.ts', critical: true },
    { path: 'api/middleware/rateLimit.ts', critical: true },
    { path: 'docs/USER_GUIDE.md', critical: false },
    { path: 'docs/DEPLOYMENT.md', critical: false },
    { path: 'docs/INCIDENT_RESPONSE.md', critical: false },
  ];

  for (const file of requiredFiles) {
    const exists = fs.existsSync(path.join(process.cwd(), file.path));
    logResult({
      name: file.path,
      status: exists ? 'PASS' : file.critical ? 'FAIL' : 'WARN',
      message: exists ? 'File exists' : 'File missing',
      critical: file.critical,
    });
  }
}

function validateEnvExample(): void {
  section('2. Environment Configuration');

  const envExamplePath = path.join(process.cwd(), '.env.example');

  if (!fs.existsSync(envExamplePath)) {
    logResult({
      name: '.env.example',
      status: 'FAIL',
      message: 'File not found',
      critical: true,
    });
    return;
  }

  const envContent = fs.readFileSync(envExamplePath, 'utf-8');
  const requiredVars = [
    'VITE_API_KEY',
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'VITE_SENTRY_DSN',
    'SENTRY_DSN',
  ];

  for (const varName of requiredVars) {
    const exists = envContent.includes(varName);
    logResult({
      name: varName,
      status: exists ? 'PASS' : 'FAIL',
      message: exists ? 'Documented in .env.example' : 'Missing from .env.example',
      critical: true,
    });
  }
}

function validatePackageJson(): void {
  section('3. Package Configuration');

  const packagePath = path.join(process.cwd(), 'package.json');
  const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));

  // Check required scripts
  const requiredScripts = ['dev', 'build'];
  for (const script of requiredScripts) {
    logResult({
      name: `npm run ${script}`,
      status: pkg.scripts?.[script] ? 'PASS' : 'FAIL',
      message: pkg.scripts?.[script] ? 'Script defined' : 'Script missing',
      critical: true,
    });
  }

  // Check required dependencies
  const requiredDeps = ['react', 'react-dom', '@supabase/supabase-js'];
  for (const dep of requiredDeps) {
    const hasDep = pkg.dependencies?.[dep] || pkg.devDependencies?.[dep];
    logResult({
      name: dep,
      status: hasDep ? 'PASS' : 'FAIL',
      message: hasDep ? `Version: ${hasDep}` : 'Dependency missing',
      critical: true,
    });
  }
}

function validateTypeScript(): void {
  section('4. TypeScript Validation');

  try {
    execSync('npx tsc --noEmit', { stdio: 'pipe' });
    logResult({
      name: 'TypeScript compilation',
      status: 'PASS',
      message: 'No type errors',
      critical: true,
    });
  } catch (error: any) {
    const output = error.stdout?.toString() || error.stderr?.toString() || '';
    const errorCount = (output.match(/error TS/g) || []).length;
    logResult({
      name: 'TypeScript compilation',
      status: 'FAIL',
      message: `${errorCount} type error(s) found`,
      critical: true,
    });
  }
}

function validateNoSecrets(): void {
  section('5. Security Check');

  const sensitivePatterns = [
    { pattern: /sk-[a-zA-Z0-9]{20,}/, name: 'OpenAI API Key' },
    { pattern: /AIza[a-zA-Z0-9_-]{35}/, name: 'Google API Key' },
    { pattern: /supabase.*key.*=.*["'][a-zA-Z0-9.]+["']/i, name: 'Hardcoded Supabase Key' },
    { pattern: /password\s*[:=]\s*["'][^"']+["']/i, name: 'Hardcoded Password' },
  ];

  const filesToCheck = [
    'App.tsx',
    'lib/supabase.ts',
    'lib/auth.ts',
    'api/chat.ts',
  ];

  let foundSecrets = false;

  for (const file of filesToCheck) {
    const filePath = path.join(process.cwd(), file);
    if (!fs.existsSync(filePath)) continue;

    const content = fs.readFileSync(filePath, 'utf-8');

    for (const { pattern, name } of sensitivePatterns) {
      if (pattern.test(content)) {
        logResult({
          name: `${file}: ${name}`,
          status: 'FAIL',
          message: 'Potential secret detected in source code',
          critical: true,
        });
        foundSecrets = true;
      }
    }
  }

  if (!foundSecrets) {
    logResult({
      name: 'Secret scan',
      status: 'PASS',
      message: 'No hardcoded secrets detected',
      critical: true,
    });
  }
}

function validateApiEndpoints(): void {
  section('6. API Endpoints');

  const apiFiles = [
    { path: 'api/health.ts', name: 'Health Check' },
    { path: 'api/chat.ts', name: 'Chat Endpoint' },
    { path: 'api/middleware/rateLimit.ts', name: 'Rate Limiting' },
  ];

  for (const api of apiFiles) {
    const filePath = path.join(process.cwd(), api.path);
    const exists = fs.existsSync(filePath);

    if (exists) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const hasHandler = content.includes('export default') || content.includes('export async function');

      logResult({
        name: api.name,
        status: hasHandler ? 'PASS' : 'WARN',
        message: hasHandler ? 'Handler exported' : 'No handler found',
        critical: true,
      });
    } else {
      logResult({
        name: api.name,
        status: 'FAIL',
        message: 'File not found',
        critical: true,
      });
    }
  }
}

function validateDocumentation(): void {
  section('7. Documentation');

  const docs = [
    { path: 'docs/USER_GUIDE.md', minLength: 5000 },
    { path: 'docs/DEPLOYMENT.md', minLength: 3000 },
    { path: 'docs/MONITORING.md', minLength: 2000 },
    { path: 'docs/INCIDENT_RESPONSE.md', minLength: 2000 },
    { path: 'docs/PRE_LAUNCH_CHECKLIST.md', minLength: 5000 },
    { path: 'docs/SIGN_OFF_FORM.md', minLength: 2000 },
  ];

  for (const doc of docs) {
    const filePath = path.join(process.cwd(), doc.path);

    if (!fs.existsSync(filePath)) {
      logResult({
        name: path.basename(doc.path),
        status: 'WARN',
        message: 'File not found',
        critical: false,
      });
      continue;
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const sufficient = content.length >= doc.minLength;

    logResult({
      name: path.basename(doc.path),
      status: sufficient ? 'PASS' : 'WARN',
      message: sufficient
        ? `${(content.length / 1000).toFixed(1)}KB content`
        : `Only ${(content.length / 1000).toFixed(1)}KB (expected ${doc.minLength / 1000}KB+)`,
      critical: false,
    });
  }
}

function validateComponents(): void {
  section('8. Core Components');

  const components = [
    'components/LoginPage.tsx',
    'components/Sidebar.tsx',
    'components/SettingsPanel.tsx',
    'components/AnalyticsPanel.tsx',
    'components/CaseHistoryPanel.tsx',
    'components/LiveIntakePanel.tsx',
    'components/ConsentModal.tsx',
  ];

  for (const comp of components) {
    const filePath = path.join(process.cwd(), comp);

    if (!fs.existsSync(filePath)) {
      logResult({
        name: path.basename(comp),
        status: 'FAIL',
        message: 'Component not found',
        critical: true,
      });
      continue;
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const hasExport = content.includes('export default');
    const hasReact = content.includes('React') || content.includes('react');

    logResult({
      name: path.basename(comp),
      status: hasExport && hasReact ? 'PASS' : 'WARN',
      message: hasExport && hasReact ? 'Valid React component' : 'May have issues',
      critical: true,
    });
  }
}

function validateServices(): void {
  section('9. Service Layer');

  const services = [
    { path: 'lib/analytics.ts', exports: ['getAnalyticsStats', 'getAllAnalytics'] },
    { path: 'lib/cases.ts', exports: ['getCases', 'createCase'] },
    { path: 'lib/auth.ts', exports: ['login', 'logout', 'getCurrentUser'] },
    { path: 'lib/sentry.ts', exports: ['initSentry', 'captureException'] },
  ];

  for (const service of services) {
    const filePath = path.join(process.cwd(), service.path);

    if (!fs.existsSync(filePath)) {
      logResult({
        name: path.basename(service.path),
        status: 'FAIL',
        message: 'Service not found',
        critical: true,
      });
      continue;
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const missingExports = service.exports.filter((exp) => !content.includes(`export function ${exp}`) && !content.includes(`export async function ${exp}`));

    logResult({
      name: path.basename(service.path),
      status: missingExports.length === 0 ? 'PASS' : 'WARN',
      message:
        missingExports.length === 0
          ? 'All exports present'
          : `Missing: ${missingExports.join(', ')}`,
      critical: true,
    });
  }
}

function printSummary(): void {
  section('VALIDATION SUMMARY');

  const passed = results.filter((r) => r.status === 'PASS').length;
  const failed = results.filter((r) => r.status === 'FAIL').length;
  const warned = results.filter((r) => r.status === 'WARN').length;
  const skipped = results.filter((r) => r.status === 'SKIP').length;
  const total = results.length;

  const criticalFails = results.filter((r) => r.status === 'FAIL' && r.critical);

  console.log(`  ${colors.green}Passed:${colors.reset}  ${passed}/${total}`);
  console.log(`  ${colors.red}Failed:${colors.reset}  ${failed}/${total}`);
  console.log(`  ${colors.yellow}Warnings:${colors.reset} ${warned}/${total}`);
  console.log(`  ${colors.blue}Skipped:${colors.reset} ${skipped}/${total}`);

  console.log('');

  if (criticalFails.length > 0) {
    console.log(`${colors.bold}${colors.red}❌ LAUNCH BLOCKED${colors.reset}`);
    console.log(`   ${criticalFails.length} critical failure(s) must be resolved:\n`);
    for (const fail of criticalFails) {
      console.log(`   • ${fail.name}: ${fail.message}`);
    }
    process.exit(1);
  } else if (failed > 0) {
    console.log(`${colors.bold}${colors.yellow}⚠️ CONDITIONAL LAUNCH${colors.reset}`);
    console.log('   Non-critical failures detected. Review before launch.');
    process.exit(0);
  } else if (warned > 0) {
    console.log(`${colors.bold}${colors.yellow}⚠️ LAUNCH READY (with warnings)${colors.reset}`);
    console.log('   Review warnings but launch can proceed.');
    process.exit(0);
  } else {
    console.log(`${colors.bold}${colors.green}✅ LAUNCH READY${colors.reset}`);
    console.log('   All validations passed!');
    process.exit(0);
  }
}

// ============================================
// Main Execution
// ============================================

console.log(`
${colors.bold}${colors.blue}╔════════════════════════════════════════════════════════╗
║       PRE-LAUNCH VALIDATION SCRIPT                     ║
║       AI-Powered Legal Intake Assistant                ║
╚════════════════════════════════════════════════════════╝${colors.reset}
`);

console.log(`${colors.blue}Date:${colors.reset} ${new Date().toISOString()}`);
console.log(`${colors.blue}Working Directory:${colors.reset} ${process.cwd()}`);

validateRequiredFiles();
validateEnvExample();
validatePackageJson();
validateTypeScript();
validateNoSecrets();
validateApiEndpoints();
validateDocumentation();
validateComponents();
validateServices();
printSummary();
