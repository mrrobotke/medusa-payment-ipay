#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

// ANSI color codes for console output
const colors = {
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

const packageJsonPath = path.join(__dirname, 'package.json');

console.log(`${colors.bold}${colors.blue}📦 Package Updater Script${colors.reset}\n`);

// Check if package.json exists
if (!fs.existsSync(packageJsonPath)) {
  console.error(`${colors.red}❌ package.json not found in ${__dirname}${colors.reset}`);
  process.exit(1);
}

// Read and parse package.json
let packageJson;
try {
  packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
} catch (error) {
  console.error(`${colors.red}❌ Error reading package.json: ${error.message}${colors.reset}`);
  process.exit(1);
}

/**
 * Get the latest version of a package from npm
 * @param {string} packageName 
 * @returns {string|null} Latest version or null if error
 */
function getLatestVersion(packageName) {
  try {
    const result = execSync(`npm view ${packageName} version`, { 
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe']
    });
    return result.trim();
  } catch (error) {
    console.warn(`${colors.yellow}⚠️  Could not fetch version for ${packageName}: ${error.message}${colors.reset}`);
    return null;
  }
}

/**
 * Update packages in a dependencies object
 * @param {object} dependencies 
 * @param {string} sectionName 
 * @returns {object} Updated dependencies and statistics
 */
function updatePackageSection(dependencies, sectionName) {
  if (!dependencies || typeof dependencies !== 'object') {
    return { updated: dependencies || {}, stats: { total: 0, updated: 0, errors: 0 } };
  }

  const updated = { ...dependencies };
  const stats = { total: 0, updated: 0, errors: 0 };
  
  console.log(`${colors.cyan}🔍 Checking ${sectionName}...${colors.reset}`);
  
  Object.keys(dependencies).forEach(packageName => {
    stats.total++;
    const currentVersion = dependencies[packageName];
    
    // Skip relative paths and git URLs
    if (currentVersion.startsWith('.') || currentVersion.startsWith('git') || currentVersion.startsWith('file:')) {
      console.log(`  ${colors.blue}⏭️  Skipping ${packageName} (local/git dependency)${colors.reset}`);
      return;
    }
    
    // Remove version prefixes for comparison
    const cleanCurrentVersion = currentVersion.replace(/^[\^~>=<]/, '');
    
    console.log(`  📋 Checking ${colors.bold}${packageName}${colors.reset} (current: ${currentVersion})`);
    
    const latestVersion = getLatestVersion(packageName);
    
    if (!latestVersion) {
      stats.errors++;
      return;
    }
    
    if (cleanCurrentVersion !== latestVersion) {
      // Preserve version prefix if it exists
      const versionPrefix = currentVersion.match(/^[\^~>=<]/)?.[0] || '^';
      updated[packageName] = `${versionPrefix}${latestVersion}`;
      stats.updated++;
      console.log(`    ${colors.green}✅ Updated: ${cleanCurrentVersion} → ${latestVersion}${colors.reset}`);
    } else {
      console.log(`    ${colors.green}✓ Already latest: ${latestVersion}${colors.reset}`);
    }
  });
  
  return { updated, stats };
}

// Create backup
const backupPath = `${packageJsonPath}.backup.${Date.now()}`;
fs.copyFileSync(packageJsonPath, backupPath);
console.log(`${colors.yellow}💾 Backup created: ${path.basename(backupPath)}${colors.reset}\n`);

// Update dependencies
const updatedPackageJson = { ...packageJson };
let totalStats = { total: 0, updated: 0, errors: 0 };

// Update regular dependencies
if (packageJson.dependencies) {
  const { updated, stats } = updatePackageSection(packageJson.dependencies, 'dependencies');
  updatedPackageJson.dependencies = updated;
  totalStats.total += stats.total;
  totalStats.updated += stats.updated;
  totalStats.errors += stats.errors;
  console.log();
}

// Update devDependencies
if (packageJson.devDependencies) {
  const { updated, stats } = updatePackageSection(packageJson.devDependencies, 'devDependencies');
  updatedPackageJson.devDependencies = updated;
  totalStats.total += stats.total;
  totalStats.updated += stats.updated;
  totalStats.errors += stats.errors;
  console.log();
}

// Update peerDependencies
if (packageJson.peerDependencies) {
  const { updated, stats } = updatePackageSection(packageJson.peerDependencies, 'peerDependencies');
  updatedPackageJson.peerDependencies = updated;
  totalStats.total += stats.total;
  totalStats.updated += stats.updated;
  totalStats.errors += stats.errors;
  console.log();
}

// Write updated package.json
try {
  fs.writeFileSync(packageJsonPath, JSON.stringify(updatedPackageJson, null, 2) + '\n');
  console.log(`${colors.green}${colors.bold}✅ package.json updated successfully!${colors.reset}\n`);
} catch (error) {
  console.error(`${colors.red}❌ Error writing package.json: ${error.message}${colors.reset}`);
  process.exit(1);
}

// Print summary
console.log(`${colors.bold}📊 Summary:${colors.reset}`);
console.log(`  📦 Total packages checked: ${colors.bold}${totalStats.total}${colors.reset}`);
console.log(`  ✅ Packages updated: ${colors.bold}${colors.green}${totalStats.updated}${colors.reset}`);
console.log(`  ⚠️  Packages with errors: ${colors.bold}${colors.yellow}${totalStats.errors}${colors.reset}`);
console.log(`  💾 Backup file: ${colors.cyan}${path.basename(backupPath)}${colors.reset}`);

if (totalStats.updated > 0) {
  console.log(`\n${colors.yellow}⚠️  Don't forget to run:${colors.reset}`);
  console.log(`   ${colors.bold}yarn install${colors.reset} or ${colors.bold}npm install${colors.reset}`);
  console.log(`   ${colors.bold}yarn build${colors.reset} to test the build with updated packages`);
}

console.log(`\n${colors.green}${colors.bold}🎉 Package update complete!${colors.reset}`); 