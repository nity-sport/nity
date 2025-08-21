const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Define patterns to exclude (keep debug files)
const excludePatterns = [
  '**/node_modules/**',
  '**/debug-*.js',
  '**/debug-*.tsx',
  '**/browser-debug.js',
  '**/test-*.js',
  '**/scripts/**',
  '**/__tests__/**'
];

// Define patterns for console methods to remove
const consolePatterns = [
  /console\.log\([^)]*\);?\s*\n?/g,
  /console\.warn\([^)]*\);?\s*\n?/g,
  /console\.info\([^)]*\);?\s*\n?/g,
];

// Keep console.error in most cases, just track them
const errorPattern = /console\.error\([^)]*\);?\s*\n?/g;

function shouldExcludeFile(filePath) {
  return excludePatterns.some(pattern => {
    const globPattern = pattern.replace(/\*\*/g, '**');
    return filePath.includes('node_modules') || 
           filePath.includes('debug-') ||
           filePath.includes('test-') ||
           filePath.includes('scripts/') ||
           filePath.includes('__tests__/');
  });
}

function cleanConsoleLogsFromFile(filePath) {
  if (shouldExcludeFile(filePath)) {
    return { cleaned: false, reason: 'excluded' };
  }

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let newContent = content;
    let changes = 0;

    // Remove console.log, console.warn, console.info
    consolePatterns.forEach(pattern => {
      const matches = newContent.match(pattern);
      if (matches) {
        changes += matches.length;
        newContent = newContent.replace(pattern, '');
      }
    });

    // Count console.error (but don't remove them for now)
    const errorMatches = content.match(errorPattern);
    const errorCount = errorMatches ? errorMatches.length : 0;

    if (changes > 0) {
      fs.writeFileSync(filePath, newContent);
      return { 
        cleaned: true, 
        changes, 
        errorCount,
        reason: `removed ${changes} console statements` 
      };
    }

    return { 
      cleaned: false, 
      changes: 0, 
      errorCount,
      reason: 'no console statements found' 
    };
  } catch (error) {
    return { 
      cleaned: false, 
      reason: `error: ${error.message}` 
    };
  }
}

// Find all TypeScript and JavaScript files
const patterns = [
  'pages/**/*.ts',
  'pages/**/*.tsx',
  'components/**/*.ts',
  'components/**/*.tsx',
  'src/**/*.ts',
  'src/**/*.tsx'
];

let totalFiles = 0;
let cleanedFiles = 0;
let totalChanges = 0;
let totalErrors = 0;

console.log('🧹 Cleaning console.log statements from production files...\n');

patterns.forEach(pattern => {
  const files = glob.sync(pattern, { cwd: process.cwd() });
  
  files.forEach(file => {
    totalFiles++;
    const result = cleanConsoleLogsFromFile(file);
    
    if (result.cleaned) {
      cleanedFiles++;
      totalChanges += result.changes;
      console.log(`✅ ${file}: ${result.reason}`);
    } else if (result.changes === 0 && result.errorCount > 0) {
      console.log(`ℹ️  ${file}: ${result.errorCount} console.error statements (kept)`);
    }
    
    if (result.errorCount) {
      totalErrors += result.errorCount;
    }
  });
});

console.log(`\n📊 Summary:`);
console.log(`   Files processed: ${totalFiles}`);
console.log(`   Files cleaned: ${cleanedFiles}`);
console.log(`   Console statements removed: ${totalChanges}`);
console.log(`   Console.error statements kept: ${totalErrors}`);
console.log(`\n✨ Console cleanup completed!`);