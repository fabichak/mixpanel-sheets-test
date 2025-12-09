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
async function verifySetup() {
    console.log('\n🔍 Comprehensive Setup Verification\n');
    console.log('═'.repeat(70));
    const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY;
    if (!email || !privateKey) {
        console.log('❌ Missing credentials in .env file');
        return;
    }
    const projectId = email.split('@')[1].split('.')[0];
    console.log(`\n📊 Configuration:`);
    console.log(`   Service Account: ${email}`);
    console.log(`   Project ID: ${projectId}`);
    console.log(`   Private Key Length: ${privateKey.length} chars`);
    // Try with different scope combinations
    const scopeSets = [
        {
            name: 'Full Drive + Sheets access',
            scopes: [
                'https://www.googleapis.com/auth/drive',
                'https://www.googleapis.com/auth/drive.file',
                'https://www.googleapis.com/auth/spreadsheets',
            ],
        },
        {
            name: 'Drive file + Sheets',
            scopes: [
                'https://www.googleapis.com/auth/drive.file',
                'https://www.googleapis.com/auth/spreadsheets',
            ],
        },
        {
            name: 'Sheets only',
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        },
    ];
    let success = false;
    for (const scopeSet of scopeSets) {
        console.log(`\n\n🔄 Testing with: ${scopeSet.name}`);
        console.log('─'.repeat(70));
        try {
            const auth = new googleapis_1.google.auth.GoogleAuth({
                credentials: {
                    client_email: email,
                    private_key: privateKey.replace(/\\n/g, '\n'),
                },
                scopes: scopeSet.scopes,
            });
            const sheets = googleapis_1.google.sheets({ version: 'v4', auth });
            const result = await sheets.spreadsheets.create({
                requestBody: {
                    properties: {
                        title: `Test - ${new Date().toISOString()}`,
                    },
                },
            });
            console.log(`\n✅ SUCCESS! Created spreadsheet with ${scopeSet.name}`);
            console.log(`   ID: ${result.data.spreadsheetId}`);
            console.log(`   URL: https://docs.google.com/spreadsheets/d/${result.data.spreadsheetId}`);
            success = true;
            break;
        }
        catch (error) {
            console.log(`❌ Failed: ${error.message}`);
        }
    }
    if (!success) {
        console.log('\n\n' + '═'.repeat(70));
        console.log('🚨 ALL SCOPE COMBINATIONS FAILED\n');
        console.log('This indicates a deeper permission issue. Let\'s check some things:\n');
        console.log('📋 CHECKLIST - Please verify each item:\n');
        console.log('1️⃣  Verify the service account has Editor role:');
        console.log(`   https://console.cloud.google.com/iam-admin/iam?project=${projectId}`);
        console.log(`   Look for: ${email}`);
        console.log('   Should have role: Editor (or Owner)\n');
        console.log('2️⃣  Check if the service account key is correct:');
        console.log(`   Go to: https://console.cloud.google.com/iam-admin/serviceaccounts?project=${projectId}`);
        console.log(`   Click on: ${email}`);
        console.log('   Go to "KEYS" tab');
        console.log('   You should see your key listed there');
        console.log('   If not, create a new key and update your .env file\n');
        console.log('3️⃣  Verify APIs are enabled:');
        console.log(`   https://console.cloud.google.com/apis/dashboard?project=${projectId}`);
        console.log('   Should show: Google Sheets API (enabled)');
        console.log('               Google Drive API (enabled)\n');
        console.log('4️⃣  Check project billing:');
        console.log(`   https://console.cloud.google.com/billing/linkedaccount?project=${projectId}`);
        console.log('   Project must have billing enabled (even for free tier)\n');
        console.log('5️⃣  Wait for propagation:');
        console.log('   IAM changes can take 5-10 minutes to take effect');
        console.log('   If you just granted permissions, wait a bit and try again\n');
        console.log('═'.repeat(70));
        console.log('\n🔄 ALTERNATIVE SOLUTION:\n');
        console.log('If service account continues to fail, we can switch to OAuth2');
        console.log('authentication, which uses your personal Google account instead.');
        console.log('\nWould you like me to create an OAuth2 version?\n');
    }
}
verifySetup().catch((error) => {
    console.error('\n💥 Unexpected error:', error.message);
});
