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
const dotenv = __importStar(require("dotenv"));
dotenv.config();
async function testAuth() {
    console.log('\n🔍 Testing Google API Authentication\n');
    console.log('═'.repeat(50));
    // Check environment variables
    console.log('\n1. Checking Environment Variables:');
    const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY;
    if (!email) {
        console.log('   ❌ GOOGLE_SERVICE_ACCOUNT_EMAIL is missing');
        return;
    }
    console.log(`   ✓ GOOGLE_SERVICE_ACCOUNT_EMAIL: ${email}`);
    if (!privateKey) {
        console.log('   ❌ GOOGLE_PRIVATE_KEY is missing');
        return;
    }
    console.log(`   ✓ GOOGLE_PRIVATE_KEY: Present (${privateKey.length} characters)`);
    // Check private key format
    console.log('\n2. Checking Private Key Format:');
    if (!privateKey.includes('BEGIN PRIVATE KEY')) {
        console.log('   ⚠️  Private key might be missing the BEGIN header');
    }
    else {
        console.log('   ✓ Private key has BEGIN header');
    }
    if (!privateKey.includes('END PRIVATE KEY')) {
        console.log('   ⚠️  Private key might be missing the END header');
    }
    else {
        console.log('   ✓ Private key has END header');
    }
    const newlineCount = (privateKey.match(/\\n/g) || []).length;
    console.log(`   ℹ️  Private key has ${newlineCount} \\n sequences`);
    // Test authentication
    console.log('\n3. Testing Authentication:');
    try {
        const auth = new googleapis_1.google.auth.GoogleAuth({
            credentials: {
                client_email: email,
                private_key: privateKey.replace(/\\n/g, '\n'),
            },
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });
        const client = await auth.getClient();
        console.log('   ✓ Successfully created auth client');
        // Test if we can get access token
        const accessToken = await client.getAccessToken();
        console.log('   ✓ Successfully obtained access token');
        console.log(`   ℹ️  Token expires at: ${new Date(client.credentials.expiry_date).toLocaleString()}`);
    }
    catch (error) {
        console.log('   ❌ Authentication failed:', error.message);
        if (error.message.includes('invalid_grant')) {
            console.log('\n   Possible causes:');
            console.log('   - Private key format is incorrect (check \\n characters)');
            console.log('   - Service account credentials are invalid');
            console.log('   - Service account was deleted or recreated');
        }
        return;
    }
    // Test Google Sheets API access
    console.log('\n4. Testing Google Sheets API:');
    try {
        const auth = new googleapis_1.google.auth.GoogleAuth({
            credentials: {
                client_email: email,
                private_key: privateKey.replace(/\\n/g, '\n'),
            },
            scopes: [
                'https://www.googleapis.com/auth/spreadsheets',
                'https://www.googleapis.com/auth/drive',
            ],
        });
        const sheets = googleapis_1.google.sheets({ version: 'v4', auth });
        // Try to create a test spreadsheet
        const spreadsheet = await sheets.spreadsheets.create({
            requestBody: {
                properties: {
                    title: 'API Test - Can Delete',
                },
            },
        });
        const spreadsheetId = spreadsheet.data.spreadsheetId;
        console.log('   ✓ Successfully created test spreadsheet');
        console.log(`   ℹ️  Spreadsheet ID: ${spreadsheetId}`);
        console.log(`   🔗 URL: https://docs.google.com/spreadsheets/d/${spreadsheetId}`);
        console.log('\n   You can delete this test spreadsheet from your Google Drive.');
    }
    catch (error) {
        console.log('   ❌ Failed to create spreadsheet:', error.message);
        if (error.message.includes('permission')) {
            console.log('\n   Possible causes:');
            console.log('   - Google Sheets API is not enabled in Google Cloud Console');
            console.log('   - Service account lacks necessary permissions');
            console.log('\n   Please verify:');
            console.log('   1. Go to: https://console.cloud.google.com/apis/library/sheets.googleapis.com');
            console.log('   2. Make sure "Google Sheets API" is ENABLED for your project');
            console.log('   3. Go to: https://console.cloud.google.com/apis/library/drive.googleapis.com');
            console.log('   4. Make sure "Google Drive API" is ENABLED for your project');
        }
        return;
    }
    console.log('\n' + '═'.repeat(50));
    console.log('\n✅ All checks passed! Your setup is working correctly.\n');
}
testAuth().catch(console.error);
