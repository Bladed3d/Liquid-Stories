/**
 * Team Error Logging System
 * Captures all console errors and logs to unified team log file
 */

class TeamErrorLogger {
    constructor() {
        this.logFile = 'team-error-log.log';
        this.sessionStart = new Date().toISOString();
        this.originalConsole = {};
        this.errorCount = 0;
        this.warningCount = 0;
        this.successCount = 0;

        this.initialize();
    }

    /**
     * Initialize error logging system
     */
    initialize() {
        // Override console methods to capture all output
        this.originalConsole = {
            error: console.error,
            warn: console.warn,
            log: console.log,
            info: console.info
        };

        // Intercept console errors
        console.error = (...args) => {
            this.logToTeamFile('ERROR', 'console', args.join(' '));
            this.originalConsole.error.apply(console, args);
        };

        console.warn = (...args) => {
            this.logToTeamFile('WARNING', 'console', args.join(' '));
            this.originalConsole.warn.apply(console, args);
        };

        console.log = (...args) => {
            this.logToTeamFile('SUCCESS', 'console', args.join(' '));
            this.originalConsole.log.apply(console, args);
        };

        // Capture unhandled errors
        window.addEventListener('error', (event) => {
            this.logToTeamFile('ERROR', 'runtime',
                `Uncaught Error: ${event.message} at ${event.filename}:${event.lineno}:${event.colno}`);
        });

        window.addEventListener('unhandledrejection', (event) => {
            this.logToTeamFile('ERROR', 'promise',
                `Unhandled Promise Rejection: ${event.reason}`);
        });

        this.logToTeamFile('SUCCESS', 'system', 'Team error logging system initialized');
    }

    /**
     * Log entry to team error log file
     */
    logToTeamFile(type, source, message, metadata = {}) {
        const timestamp = new Date().toISOString();
        const agent = metadata.agent || 'unknown';
        const file = metadata.file || 'unknown';
        const line = metadata.line || 'unknown';

        const logEntry = `[${timestamp}] [${type}] [source:${source}] [message:${message}] [agent:${agent}] [file:${file}] [line:${line}]\n`;

        // Update counters
        switch(type) {
            case 'ERROR': this.errorCount++; break;
            case 'WARNING': this.warningCount++; break;
            case 'SUCCESS': this.successCount++; break;
        }

        // Write to log file (using localStorage as fallback for browser environment)
        this.writeToLogFile(logEntry);

        // Also display for immediate visibility
        if (type === 'ERROR') {
            console.error(`🚨 TEAM ERROR LOG: ${message}`);
        }
    }

    /**
     * Write to log file
     */
    writeToLogFile(entry) {
        try {
            // In browser environment, use localStorage and send to server if available
            const existingLog = localStorage.getItem('team-error-log') || '';
            const updatedLog = existingLog + entry;

            // Keep log size manageable (last 1000 entries)
            const lines = updatedLog.split('\n');
            if (lines.length > 1000) {
                const trimmedLog = lines.slice(-1000).join('\n');
                localStorage.setItem('team-error-log', trimmedLog);
            } else {
                localStorage.setItem('team-error-log', updatedLog);
            }

            // Create persistent log file that Claude can read
            this.createPersistentLogFile(updatedLog);

            // ALSO create downloadable log for team visibility
            this.createDownloadableLog();

            // Try to send to server for persistent logging
            this.sendToServer(entry);

            // Display that entry was logged
            console.log(`[TEAM-LOG] Entry logged: ${entry.trim()}`);

        } catch (error) {
            console.error('Failed to write to team error log:', error);
        }
    }

    /**
     * Create persistent log file that Claude can read
     */
    createPersistentLogFile(logContent) {
        try {
            // Create data URL for file download
            const blob = new Blob([logContent], { type: 'text/plain' });
            const dataUrl = URL.createObjectURL(blob);

            // Store for Claude to access via team-persistent-log command
            if (typeof window !== 'undefined') {
                window.teamPersistentLogUrl = dataUrl;
                window.teamPersistentLogContent = logContent;

                // Auto-trigger file save every 10 entries
                if (logContent.split('\n').filter(line => line.trim()).length % 10 === 0) {
                    this.triggerFileSave();
                }
            }

        } catch (error) {
            console.error('Failed to create persistent log file:', error);
        }
    }

    /**
     * Trigger automatic file save for Claude access
     */
    triggerFileSave() {
        try {
            const content = window.teamPersistentLogContent || '';

            // Create auto-save trigger element
            let autoSave = document.getElementById('team-auto-save');
            if (!autoSave) {
                autoSave = document.createElement('div');
                autoSave.id = 'team-auto-save';
                autoSave.style.cssText = `
                    position: fixed;
                    bottom: 10px;
                    right: 10px;
                    background: #ff6b6b;
                    color: white;
                    padding: 5px 10px;
                    border-radius: 3px;
                    font-size: 10px;
                    z-index: 10000;
                `;
                autoSave.innerHTML = 'TEAM LOG UPDATED - CHECK FOR FILES';
                document.body.appendChild(autoSave);

                // Auto-hide after 3 seconds
                setTimeout(() => {
                    if (autoSave.parentNode) {
                        autoSave.parentNode.removeChild(autoSave);
                    }
                }, 3000);
            }

        } catch (error) {
            console.error('Failed to trigger file save:', error);
        }
    }

    /**
     * Create downloadable log file for team access
     */
    createDownloadableLog() {
        try {
            const logContent = localStorage.getItem('team-error-log') || '';

            // Create a downloadable link if not exists
            let downloadLink = document.getElementById('team-log-download');
            if (!downloadLink) {
                downloadLink = document.createElement('a');
                downloadLink.id = 'team-log-download';
                downloadLink.style.display = 'none';
                downloadLink.download = 'team-error-log.txt';
                document.body.appendChild(downloadLink);
            }

            // Update the downloadable content
            const blob = new Blob([logContent], { type: 'text/plain' });
            downloadLink.href = URL.createObjectURL(blob);

            // Also make visible for team access
            this.displayLogContent(logContent);

        } catch (error) {
            console.error('Failed to create downloadable log:', error);
        }
    }

    /**
     * Display log content on page for team visibility
     */
    displayLogContent(logContent) {
        try {
            // Create or update log display area
            let logDisplay = document.getElementById('team-log-display');
            if (!logDisplay) {
                logDisplay = document.createElement('div');
                logDisplay.id = 'team-log-display';
                logDisplay.style.cssText = `
                    position: fixed;
                    top: 10px;
                    right: 10px;
                    width: 400px;
                    max-height: 300px;
                    overflow-y: auto;
                    background: #000;
                    color: #fff;
                    border: 1px solid #ff6b6b;
                    padding: 10px;
                    font-family: monospace;
                    font-size: 11px;
                    z-index: 9999;
                `;
                document.body.appendChild(logDisplay);
            }

            // Update display
            const lines = logContent.split('\n').filter(line => line.trim());
            const recentLines = lines.slice(-20); // Show last 20 entries
            logDisplay.innerHTML = `
                <div style="font-weight: bold; color: #ff6b6b; margin-bottom: 5px;">
                    TEAM ERROR LOG (Last 20 entries):
                </div>
                ${recentLines.join('<br>')}
            `;

        } catch (error) {
            console.error('Failed to display log content:', error);
        }
    }

    /**
     * Send log entry to server for persistent storage
     */
    async sendToServer(entry) {
        try {
            // Try to send to logging endpoint if server is available
            const response = await fetch('/api/log-error', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ entry })
            });

            if (!response.ok) {
                // Server logging failed, but that's okay for browser environment
            }
        } catch (error) {
            // No server available, continue with localStorage
        }
    }

    /**
     * Get error count since session start
     */
    getErrorCount() {
        return this.errorCount;
    }

    /**
     * Get warning count since session start
     */
    getWarningCount() {
        return this.warningCount;
    }

    /**
     * Check if there are any errors
     */
    hasErrors() {
        return this.errorCount > 0;
    }

    /**
     * Get recent error entries
     */
    getRecentErrors(count = 10) {
        const logContent = localStorage.getItem('team-error-log') || '';
        const lines = logContent.split('\n').filter(line => line.trim());
        const errorLines = lines.filter(line => line.includes('[ERROR]'));
        return errorLines.slice(-count);
    }

    /**
     * Clear error log (for new development session)
     */
    clearErrorLog() {
        this.errorCount = 0;
        this.warningCount = 0;
        this.successCount = 0;
        localStorage.setItem('team-error-log', '');
        this.logToTeamFile('SUCCESS', 'system', 'Error log cleared for new session');
    }

    /**
     * Generate quality report
     */
    generateQualityReport() {
        const recentErrors = this.getRecentErrors(5);

        return {
            sessionStart: this.sessionStart,
            errorCount: this.errorCount,
            warningCount: this.warningCount,
            successCount: this.successCount,
            hasErrors: this.hasErrors(),
            recentErrors: recentErrors,
            qualityScore: this.errorCount === 0 ? 'PASS' : 'FAIL'
        };
    }

    /**
     * Restore original console (for cleanup)
     */
    destroy() {
        console.error = this.originalConsole.error;
        console.warn = this.originalConsole.warn;
        console.log = this.originalConsole.log;
        console.info = this.originalConsole.info;

        this.logToTeamFile('SUCCESS', 'system', 'Team error logging system destroyed');
    }
}

// Initialize logging system immediately
let teamLogger;

// Auto-initialize when DOM loads
if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        teamLogger = new TeamErrorLogger();

        // Make logger globally accessible for team debugging
        window.teamLogger = teamLogger;

        // Create quick quality check function
        window.checkQuality = () => {
            const report = teamLogger.generateQualityReport();
            console.log('🔍 Team Quality Report:', report);
            return report;
        };
    });
}

// Method for Claude to extract and save logs
if (typeof window !== 'undefined') {
    window.extractTeamLog = function() {
        try {
            const logContent = localStorage.getItem('team-error-log') || 'No log content found';
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = `team-error-log-${timestamp}.txt`;

            // Create file for Claude to read
            const blob = new Blob([logContent], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);

            console.log(`[CLAUDE] Team log ready: ${filename}`);
            console.log(`[CLAUDE] Log length: ${logContent.length} characters`);
            console.log(`[CLAUDE] Content preview: ${logContent.substring(0, 200)}...`);

            return {
                filename: filename,
                content: logContent,
                url: url,
                lines: logContent.split('\n').filter(line => line.trim()).length,
                errors: logContent.split('\n').filter(line => line.includes('[ERROR]')).length,
                warnings: logContent.split('\n').filter(line => line.includes('[WARNING]')).length
            };

        } catch (error) {
            console.error('[CLAUDE] Failed to extract team log:', error);
            return null;
        }
    };

    // Auto-extract logs when page loads
    window.addEventListener('load', function() {
        setTimeout(function() {
            const logData = window.extractTeamLog();
            if (logData && logData.content.length > 0) {
                console.log('[CLAUDE] Team error log is available for analysis');
                console.log(`[CLAUDE] Found ${logData.errors} errors and ${logData.warnings} warnings`);
            }
        }, 2000);
    });
}

// For Node.js environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TeamErrorLogger;
}