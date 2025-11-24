/**
 * Extract Team Error Logs from localStorage and save to files
 * This script simulates what would happen in a browser to access team logs
 */

const fs = require('fs');

// Simulate localStorage content (would normally come from browser)
// For now, create a test to show the process
function extractTeamLogs() {
    try {
        console.log('=== EXTRACTING V4 TEAM ERROR LOGS ===');

        // Check if team error log file exists from previous runs
        if (fs.existsSync('team-error-log.log')) {
            console.log('✅ Found existing team-error-log.log');
            const logContent = fs.readFileSync('team-error-log.log', 'utf8');

            const lines = logContent.split('\n').filter(line => line.trim());
            const errors = lines.filter(line => line.includes('[ERROR]'));
            const warnings = lines.filter(line => line.includes('[WARNING]'));
            const successes = lines.filter(line => line.includes('[SUCCESS]'));

            console.log('\n=== LOG ANALYSIS ===');
            console.log(`Total entries: ${lines.length}`);
            console.log(`Errors: ${errors.length}`);
            console.log(`Warnings: ${warnings.length}`);
            console.log(`Successes: ${successes.length}`);

            if (errors.length > 0) {
                console.log('\n=== V4 ERRORS FOUND ===');
                errors.forEach((error, index) => {
                    console.log(`${index + 1}. ${error}`);
                });
            }

            if (warnings.length > 0) {
                console.log('\n=== V4 WARNINGS FOUND ===');
                warnings.forEach((warning, index) => {
                    console.log(`${index + 1}. ${warning}`);
                });
            }

            // Show recent entries
            console.log('\n=== RECENT 10 ENTRIES ===');
            lines.slice(-10).forEach((line, index) => {
                console.log(`${index + 1}. ${line}`);
            });

            return {
                hasErrors: errors.length > 0,
                errorCount: errors.length,
                errors: errors,
                warnings: warnings,
                totalEntries: lines.length
            };

        } else {
            console.log('❌ No team-error-log.log found - V4 may not have run or team logging failed');
            return {
                hasErrors: false,
                errorCount: 0,
                errors: [],
                warnings: [],
                totalEntries: 0
            };
        }

    } catch (error) {
        console.error('❌ Failed to extract team logs:', error);
        return null;
    }
}

// Extract and analyze the logs
const analysis = extractTeamLogs();

if (analysis && analysis.hasErrors) {
    console.log('\n🚨 V4 HAS ERRORS - NEED DEVELOPER FIX');
    console.log(`Found ${analysis.errorCount} errors that must be fixed`);
} else if (analysis && analysis.totalEntries > 0) {
    console.log('\n✅ V4 LOGS FOUND - Need to check content');
} else {
    console.log('\n❓ NO V4 LOGS - V4 may not be generating logs or crashed before logging');
}