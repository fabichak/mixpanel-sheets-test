import { google } from 'googleapis';
import * as dotenv from 'dotenv';

dotenv.config();

async function testAuthDetailed() {
  console.log('\n🔍 Detailed Google API Diagnostic\n');
  console.log('═'.repeat(60));

  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;

  if (!email || !privateKey) {
    console.log('Missing credentials in .env file');
    return;
  }

  console.log(`\nService Account: ${email}`);
  console.log(`Project: ${email.split('@')[1].split('.')[0]}`);

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: email,
        private_key: privateKey.replace(/\\n/g, '\n'),
      },
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/drive.file',
      ],
    });

    console.log('\n✓ Auth client created');

    const sheets = google.sheets({ version: 'v4', auth });
    const drive = google.drive({ version: 'v3', auth });

    // Test 1: Try to create a spreadsheet
    console.log('\n1️⃣  Testing spreadsheet creation...');
    try {
      const spreadsheet = await sheets.spreadsheets.create({
        requestBody: {
          properties: {
            title: 'Test Spreadsheet - Delete Me',
          },
        },
      });

      console.log(`   ✅ SUCCESS! Spreadsheet created: ${spreadsheet.data.spreadsheetId}`);
      console.log(`   🔗 https://docs.google.com/spreadsheets/d/${spreadsheet.data.spreadsheetId}`);

      // Try to delete it
      try {
        await drive.files.delete({
          fileId: spreadsheet.data.spreadsheetId!,
        });
        console.log('   ✓ Test spreadsheet deleted');
      } catch (e) {
        console.log('   ⚠️  Could not delete test spreadsheet (you may need to delete it manually)');
      }

    } catch (error: any) {
      console.log('   ❌ FAILED to create spreadsheet');
      console.log('\n   Error Details:');
      console.log('   --------------');
      console.log(`   Message: ${error.message}`);

      if (error.code) {
        console.log(`   Code: ${error.code}`);
      }

      if (error.errors && Array.isArray(error.errors)) {
        console.log('   Errors:');
        error.errors.forEach((e: any) => {
          console.log(`     - ${e.message}`);
          if (e.reason) console.log(`       Reason: ${e.reason}`);
          if (e.domain) console.log(`       Domain: ${e.domain}`);
        });
      }

      console.log('\n   🔧 Troubleshooting Steps:');
      console.log('   ========================');

      console.log('\n   A. Verify APIs are enabled in YOUR SPECIFIC PROJECT:');
      console.log(`      Project ID: ${email.split('@')[1].split('.')[0]}`);
      console.log('      1. Go to: https://console.cloud.google.com/');
      console.log(`      2. MAKE SURE you have selected project: ${email.split('@')[1].split('.')[0]}`);
      console.log('      3. Go to APIs & Services > Enabled APIs & Services');
      console.log('      4. You should see BOTH:');
      console.log('         - Google Sheets API');
      console.log('         - Google Drive API');
      console.log('      5. If NOT listed, enable them from Library');

      console.log('\n   B. Check Service Account exists:');
      console.log('      1. Go to: https://console.cloud.google.com/iam-admin/serviceaccounts');
      console.log(`      2. Look for: ${email}`);
      console.log('      3. If it doesn\'t exist, you need to recreate it and download a new key');

      console.log('\n   C. Verify you downloaded the key from the CORRECT service account:');
      console.log('      1. The email in your .env should match the service account in the console');
      console.log(`      2. Current email: ${email}`);

      console.log('\n   D. Check for Organization Policies (if using Google Workspace):');
      console.log('      1. Go to: https://console.cloud.google.com/iam-admin/orgpolicies');
      console.log('      2. Look for policies that might block service accounts');
      console.log('      3. Common blockers: constraints/iam.disableServiceAccountCreation');

      console.log('\n   E. Wait a few minutes:');
      console.log('      - Sometimes API enablement takes 5-10 minutes to propagate');
      console.log('      - Try running this script again after waiting');

      return;
    }

    console.log('\n' + '═'.repeat(60));
    console.log('\n✅ All tests passed! You can now run the main script.\n');

  } catch (error: any) {
    console.log('\n❌ Unexpected error:', error.message);
    console.log('\nFull error:', error);
  }
}

testAuthDetailed().catch(console.error);
