"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const googleapis_1 = require("googleapis");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const readline = __importStar(require("readline"));
// OAuth2 credentials file (same as json-to-sheets-oauth.ts)
const CREDENTIALS_PATH = path.join(__dirname, 'credentials.json');
const TOKEN_PATH = path.join(__dirname, 'token-readonly.json');
// Mixpanel client (we'll use require since it's a CommonJS module)
const Mixpanel = require('mixpanel');
const mixpanel = Mixpanel.init('f75ba30b6a506e568567f4d22713e91c', {
    verbose: true,
    debug: true,
    host: 'api-eu.mixpanel.com'
});
/**
 * Un-flattens a flat object with dot notation keys back to nested structure
 * Reverse operation of the flattenObject function in json-to-sheets-oauth.ts
 */
function unflattenObject(flattened) {
    const result = {};
    for (const key in flattened) {
        if (flattened.hasOwnProperty(key)) {
            const value = flattened[key];
            // Skip .length properties as they were metadata
            if (key.endsWith('.length')) {
                continue;
            }
            const parts = key.split('.');
            let current = result;
            for (let i = 0; i < parts.length; i++) {
                const part = parts[i];
                const isLast = i === parts.length - 1;
                // Check if this part represents an array index like "items[0]"
                const arrayMatch = part.match(/^(.+)\[(\d+)\]$/);
                if (arrayMatch) {
                    const arrayName = arrayMatch[1];
                    const index = parseInt(arrayMatch[2], 10);
                    // Initialize array if it doesn't exist
                    if (!current[arrayName]) {
                        current[arrayName] = [];
                    }
                    // If this is the last part, set the value
                    if (isLast) {
                        current[arrayName][index] = value;
                    }
                    else {
                        // Initialize the array element as an object if needed
                        if (!current[arrayName][index]) {
                            current[arrayName][index] = {};
                        }
                        current = current[arrayName][index];
                    }
                }
                else {
                    // Regular property
                    if (isLast) {
                        current[part] = value;
                    }
                    else {
                        // Initialize nested object if needed
                        if (!current[part]) {
                            current[part] = {};
                        }
                        current = current[part];
                    }
                }
            }
        }
    }
    return result;
}
/**
 * Get OAuth2 client with stored token or prompt for authorization
 */
async function authorize() {
    // Load client credentials
    if (!fs.existsSync(CREDENTIALS_PATH)) {
        throw new Error(`Credentials file not found at ${CREDENTIALS_PATH}\n` +
            'Please download OAuth2 credentials from Google Cloud Console.\n' +
            'See SETUP-OAUTH2.md for instructions.');
    }
    const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf-8'));
    const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
    const oAuth2Client = new googleapis_1.google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
    // Check if we have a saved token
    if (fs.existsSync(TOKEN_PATH)) {
        const token = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf-8'));
        oAuth2Client.setCredentials(token);
        return oAuth2Client;
    }
    // Get new token
    return getNewToken(oAuth2Client);
}
/**
 * Get authorization token from user
 */
function getNewToken(oAuth2Client) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: [
            'https://www.googleapis.com/auth/spreadsheets.readonly',
        ],
    });
    console.log('\n🔐 Authorization Required\n');
    console.log('Please authorize this app by visiting this URL:\n');
    console.log(authUrl);
    console.log('\nAfter authorization, you will get a code. Paste it here:');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    return new Promise((resolve, reject) => {
        rl.question('Enter the code: ', (code) => {
            rl.close();
            oAuth2Client.getToken(code, (err, token) => {
                if (err) {
                    reject(new Error('Error retrieving access token: ' + err));
                    return;
                }
                oAuth2Client.setCredentials(token);
                // Save token for future use
                fs.writeFileSync(TOKEN_PATH, JSON.stringify(token));
                console.log('\n✓ Token saved to', TOKEN_PATH);
                resolve(oAuth2Client);
            });
        });
    });
}
/**
 * Extract spreadsheet ID from URL
 */
function extractSpreadsheetId(urlOrId) {
    // If it's already just an ID, return it
    if (!urlOrId.includes('/') && !urlOrId.includes('http')) {
        return urlOrId;
    }
    // Extract from URL: https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit...
    const match = urlOrId.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (match) {
        return match[1];
    }
    throw new Error('Invalid spreadsheet URL or ID');
}
/**
 * Reads data from a Google Spreadsheet and sends it to Mixpanel
 */
async function sheetsToMixpanel(spreadsheetUrl) {
    try {
        console.log('\n📊 Google Sheets to Mixpanel Sender\n');
        console.log('═'.repeat(50));
        // Authorize
        console.log('\n1. Authenticating...');
        const auth = await authorize();
        console.log('✓ Authenticated successfully');
        const sheets = googleapis_1.google.sheets({ version: 'v4', auth });
        const spreadsheetId = extractSpreadsheetId(spreadsheetUrl);
        // Get spreadsheet metadata to find all sheets
        console.log('\n2. Reading spreadsheet metadata...');
        const spreadsheet = await sheets.spreadsheets.get({
            spreadsheetId,
        });
        const sheetTitles = spreadsheet.data.sheets?.map(sheet => sheet.properties?.title).filter(Boolean);
        if (!sheetTitles || sheetTitles.length === 0) {
            console.log('No sheets found in the spreadsheet');
            return;
        }
        console.log(`✓ Found ${sheetTitles.length} sheet(s): ${sheetTitles.join(', ')}`);
        let totalEventsSent = 0;
        let totalErrors = 0;
        // Process each sheet
        for (const sheetTitle of sheetTitles) {
            console.log(`\n3. Processing sheet: ${sheetTitle}`);
            // Read data from the sheet
            const response = await sheets.spreadsheets.values.get({
                spreadsheetId,
                range: `${sheetTitle}!A:ZZ`, // Read all columns
            });
            const rows = response.data.values;
            if (!rows || rows.length < 2) {
                console.log(`   ⚠️  Sheet "${sheetTitle}" is empty or has no data rows`);
                continue;
            }
            // First row is headers, remaining rows are data
            const headers = rows[0];
            const dataRows = rows.slice(1);
            console.log(`   ✓ Found ${dataRows.length} data row(s)`);
            // Process each data row
            for (let i = 0; i < dataRows.length; i++) {
                const row = dataRows[i];
                // Create flattened object from headers and row values
                const flattenedData = {};
                for (let j = 0; j < headers.length; j++) {
                    if (row[j] !== undefined && row[j] !== '') {
                        // Try to parse as number if possible
                        const value = row[j];
                        if (!isNaN(Number(value)) && value !== '') {
                            flattenedData[headers[j]] = Number(value);
                        }
                        else {
                            flattenedData[headers[j]] = value;
                        }
                    }
                }
                // Un-flatten to get the original nested structure
                const eventData = unflattenObject(flattenedData);
                // Determine event type from the data
                const eventType = eventData.eventType || sheetTitle;
                // Extract required Mixpanel fields
                const playerId = eventData.playerId || 'unknown_player';
                // Create Mixpanel event properties
                const eventProperties = {
                    distinct_id: playerId,
                    ...eventData,
                };
                // Send to Mixpanel
                console.log(`   📤 Sending event ${i + 1}/${dataRows.length} (${eventType})...`);
                await new Promise((resolve, reject) => {
                    mixpanel.track(eventType, eventProperties, (err) => {
                        if (err) {
                            console.error(`   ❌ Error sending event ${i + 1}:`, err);
                            totalErrors++;
                            reject(err);
                        }
                        else {
                            console.log(`   ✅ Event ${i + 1} sent successfully`);
                            totalEventsSent++;
                            resolve();
                        }
                    });
                });
                // Small delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            console.log(`   ✓ Completed processing sheet: ${sheetTitle}`);
        }
        console.log('\n' + '═'.repeat(50));
        console.log(`\n✅ SUCCESS! Sent ${totalEventsSent} events to Mixpanel`);
        if (totalErrors > 0) {
            console.log(`⚠️  ${totalErrors} errors occurred`);
        }
        console.log();
    }
    catch (error) {
        console.error('\n❌ Error:', error.message);
        if (error.stack) {
            console.error('\nStack trace:', error.stack);
        }
        process.exit(1);
    }
}
// Get spreadsheet URL from command line arguments
const spreadsheetUrl = process.argv[2];
if (!spreadsheetUrl) {
    console.error('\n❌ Error: Spreadsheet URL or ID required\n');
    console.log('Usage: ts-node sheets-to-mixpanel-oauth.ts <spreadsheet_url_or_id>\n');
    console.log('Example:');
    console.log('  ts-node sheets-to-mixpanel-oauth.ts "https://docs.google.com/spreadsheets/d/1a2b3c4d5e6f7g8h9i0j/edit"');
    console.log('  ts-node sheets-to-mixpanel-oauth.ts "1a2b3c4d5e6f7g8h9i0j"');
    console.log();
    process.exit(1);
}
// Run the script
sheetsToMixpanel(spreadsheetUrl);
