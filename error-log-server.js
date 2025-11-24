/**
 * Simple Error Log Server
 * Captures team error logs for persistent storage
 */

const fs = require('fs');
const path = require('path');

// Simple Node.js server for error logging
const http = require('http');

const ERROR_LOG_FILE = 'team-error-log.log';

function logToFile(entry) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${entry}\n`;

    fs.appendFileSync(ERROR_LOG_FILE, logEntry, 'utf8');
    console.log('Error logged:', logEntry.trim());
}

// Create simple server
const server = http.createServer((req, res) => {
    if (req.method === 'POST' && req.url === '/api/log-error') {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                logToFile(data.entry);

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true }));
            } catch (error) {
                console.error('Error parsing log entry:', error);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'Invalid JSON' }));
            }
        });
    } else if (req.method === 'GET' && req.url === '/api/error-count') {
        try {
            const logContent = fs.readFileSync(ERROR_LOG_FILE, 'utf8');
            const lines = logContent.split('\n').filter(line => line.trim());
            const errorLines = lines.filter(line => line.includes('[ERROR]'));

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: true,
                errorCount: errorLines.length,
                totalLines: lines.length
            }));
        } catch (error) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: true,
                errorCount: 0,
                totalLines: 0
            }));
        }
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Not found' }));
    }
});

const PORT = 3001;
server.listen(PORT, () => {
    console.log(`Error log server running on port ${PORT}`);
    console.log(`Logging to: ${ERROR_LOG_FILE}`);
});