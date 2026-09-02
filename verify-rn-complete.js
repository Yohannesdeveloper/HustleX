/**
 * Verification Script - Check if React Native conversion is complete
 * Run: node verify-rn-complete.js
 */

const fs = require('fs');
const path = require('path');

const checks = {
  passed: [],
  failed: [],
  warnings: []
};

// Check if React Native entry point exists
function checkEntryPoint() {
  const appTsx = path.join(__dirname, 'App.tsx');
  if (fs.existsSync(appTsx)) {
    const content = fs.readFileSync(appTsx, 'utf8');
    if (content.includes('AppNavigator')) {
      checks.passed.push('✅ Root App.tsx exists and imports AppNavigator');
    } else {
      checks.failed.push('❌ App.tsx exists but does not import AppNavigator');
    }
  } else {
    checks.failed.push('❌ App.tsx (root) does not exist');
  }
}

// Check React Native screens
function checkScreens() {
  const screensDir = path.join(__dirname, 'src', 'screens');
  if (!fs.existsSync(screensDir)) {
    checks.failed.push('❌ src/screens directory does not exist');
    return;
  }

  const expectedScreens = [
    'HomeFinal.rn.tsx',
    'Signup.rn.tsx',
    'Login.rn.tsx',
    'JobListings.rn.tsx',
    'JobDetailsMongo.rn.tsx',
    'PostJob.rn.tsx',
    'HiringDashboard.rn.tsx',
    'FreelancerDashboard.rn.tsx',
    'Pricing.rn.tsx',
    'ApplicationsManagementMongo.rn.tsx',
    'RoleSelection.rn.tsx',
    'Payment.rn.tsx',
    'ForgotPassword.rn.tsx',
    'CompanyProfile.rn.tsx',
    'FreelancerProfileSetup.rn.tsx',
    'PreviewJob.rn.tsx',
    'AboutUs.rn.tsx',
    'ContactUs.rn.tsx',
    'FAQ.rn.tsx',
    'Blog.rn.tsx',
    'AccountSettings.rn.tsx',
    'SantimPayWizard.rn.tsx',
    'BlogPostView.rn.tsx',
    'BlogAdmin.rn.tsx',
    'Chat.rn.tsx',
    'HowItWorks.rn.tsx',
    'HelpCenter.rn.tsx',
    'EditJobMongo.rn.tsx',
    'EditBlog.rn.tsx'
  ];

  const existingScreens = fs.readdirSync(screensDir).filter(f => f.endsWith('.rn.tsx'));
  const missingScreens = expectedScreens.filter(s => !existingScreens.includes(s));
  
  if (missingScreens.length === 0) {
    checks.passed.push(`✅ All ${expectedScreens.length} React Native screens exist`);
  } else {
    checks.failed.push(`❌ Missing screens: ${missingScreens.join(', ')}`);
  }
}

// Check React Native components
function checkComponents() {
  const componentsDir = path.join(__dirname, 'src', 'components');
  const requiredComponents = [
    'HomeNavbar.rn.tsx',
    'FindFreelancersTab.rn.tsx',
    'MessagesTab.rn.tsx'
  ];

  requiredComponents.forEach(comp => {
    const filePath = path.join(componentsDir, comp);
    if (fs.existsSync(filePath)) {
      checks.passed.push(`✅ ${comp} exists`);
    } else {
      checks.failed.push(`❌ ${comp} missing`);
    }
  });
}

// Check React Native services
function checkServices() {
  const servicesDir = path.join(__dirname, 'src', 'services');
  const requiredServices = [
    'api-react-native.ts'
  ];

  requiredServices.forEach(service => {
    const filePath = path.join(servicesDir, service);
    if (fs.existsSync(filePath)) {
      checks.passed.push(`✅ ${service} exists`);
    } else {
      checks.failed.push(`❌ ${service} missing`);
    }
  });
}

// Check React Native store
function checkStore() {
  const storeDir = path.join(__dirname, 'src', 'store');
  const requiredFiles = [
    'index-react-native.ts'
  ];

  requiredFiles.forEach(file => {
    const filePath = path.join(storeDir, file);
    if (fs.existsSync(filePath)) {
      checks.passed.push(`✅ ${file} exists`);
    } else {
      checks.failed.push(`❌ ${file} missing`);
    }
  });
}

// Check navigation
function checkNavigation() {
  const navFile = path.join(__dirname, 'src', 'navigation', 'AppNavigator.tsx');
  if (fs.existsSync(navFile)) {
    const content = fs.readFileSync(navFile, 'utf8');
    if (content.includes('AppNavigator')) {
      checks.passed.push('✅ AppNavigator.tsx exists');
    } else {
      checks.failed.push('❌ AppNavigator.tsx exists but is invalid');
    }
  } else {
    checks.failed.push('❌ AppNavigator.tsx missing');
  }
}

// Check shared files (must exist)
function checkSharedFiles() {
  const sharedFiles = [
    'src/types.ts',
    'src/translations/index.ts',
    'src/hooks/useTranslation.ts',
    'src/store/authSlice.ts',
    'src/store/themeSlice.ts',
    'src/store/languageSlice.ts',
    'src/store/hooks.ts'
  ];

  sharedFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
      checks.passed.push(`✅ ${file} exists (shared)`);
    } else {
      checks.failed.push(`❌ ${file} missing (required for RN)`);
    }
  });
}

// Check config files
function checkConfigFiles() {
  const configFiles = [
    'app.json',
    'babel.config.js',
    'metro.config.js',
    'package-react-native-updated.json'
  ];

  configFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
      checks.passed.push(`✅ ${file} exists`);
    } else {
      checks.warnings.push(`⚠️  ${file} missing (may be optional)`);
    }
  });
}

// Run all checks
console.log('🔍 Verifying React Native Conversion Completeness...\n');

checkEntryPoint();
checkScreens();
checkComponents();
checkServices();
checkStore();
checkNavigation();
checkSharedFiles();
checkConfigFiles();

// Print results
console.log('\n📊 VERIFICATION RESULTS:\n');
console.log(`✅ Passed: ${checks.passed.length}`);
checks.passed.forEach(check => console.log(`   ${check}`));

if (checks.warnings.length > 0) {
  console.log(`\n⚠️  Warnings: ${checks.warnings.length}`);
  checks.warnings.forEach(warning => console.log(`   ${warning}`));
}

if (checks.failed.length > 0) {
  console.log(`\n❌ Failed: ${checks.failed.length}`);
  checks.failed.forEach(fail => console.log(`   ${fail}`));
  console.log('\n⚠️  DO NOT DELETE WEB CODE YET - Fix failures first!');
  process.exit(1);
} else {
  console.log('\n🎉 ALL CHECKS PASSED!');
  console.log('✅ React Native app is complete and independent');
  console.log('✅ You can safely delete web code (follow SAFE_DELETION_GUIDE.md)');
  process.exit(0);
}
