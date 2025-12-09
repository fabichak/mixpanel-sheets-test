import { google } from 'googleapis';
import * as dotenv from 'dotenv';

dotenv.config();

async function checkPermissions() {
  console.log('\n🔑 Service Account Permission Checker\n');
  console.log('═'.repeat(60));

  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;

  if (!email || !privateKey) {
    console.log('Missing credentials');
    return;
  }

  const projectId = email.split('@')[1].split('.')[0];
  console.log(`\nService Account: ${email}`);
  console.log(`Project: ${projectId}\n`);

  console.log('⚠️  ISSUE IDENTIFIED:');
  console.log('Your service account exists and can authenticate, but it lacks');
  console.log('the IAM permissions needed to create Google Sheets.\n');

  console.log('═'.repeat(60));
  console.log('\n📋 SOLUTION: Grant IAM Roles to Service Account\n');

  console.log('Option 1: Using Google Cloud Console (Easiest)');
  console.log('━'.repeat(60));
  console.log('\n1. Go to IAM & Admin:');
  console.log(`   https://console.cloud.google.com/iam-admin/iam?project=${projectId}`);
  console.log('\n2. Click "+ GRANT ACCESS" button at the top');
  console.log('\n3. In "New principals", paste your service account email:');
  console.log(`   ${email}`);
  console.log('\n4. In "Select a role", choose ONE of these options:');
  console.log('   • Editor (recommended for testing) - full read/write access');
  console.log('   • Owner (most permissive) - full access including IAM');
  console.log('   OR for production, use these specific roles:');
  console.log('     - Service Account User');
  console.log('     - Drive File Writer (or Editor)');
  console.log('\n5. Click "SAVE"');
  console.log('\n6. Wait 1-2 minutes for permissions to propagate');
  console.log('\n7. Run this test again: npx ts-node test-auth-detailed.ts');

  console.log('\n\nOption 2: Using gcloud CLI (For Advanced Users)');
  console.log('━'.repeat(60));
  console.log('\nRun these commands in your terminal:\n');
  console.log(`# Grant Editor role (recommended for development)`);
  console.log(`gcloud projects add-iam-policy-binding ${projectId} \\`);
  console.log(`  --member="serviceAccount:${email}" \\`);
  console.log(`  --role="roles/editor"`);
  console.log('\n# OR grant Owner role (maximum permissions)');
  console.log(`gcloud projects add-iam-policy-binding ${projectId} \\`);
  console.log(`  --member="serviceAccount:${email}" \\`);
  console.log(`  --role="roles/owner"`);

  console.log('\n\n' + '═'.repeat(60));
  console.log('\n💡 Why is this needed?');
  console.log('━'.repeat(60));
  console.log('Service accounts are like robot users. Just like human users,');
  console.log('they need permissions to access Google Cloud resources.');
  console.log('Creating spreadsheets requires write permissions to Google Drive,');
  console.log('which the service account currently lacks.\n');

  console.log('After granting permissions, run:');
  console.log('  npx ts-node test-auth-detailed.ts');
  console.log('\nIf successful, then run the main script:');
  console.log('  npx ts-node json-to-sheets.ts\n');
}

checkPermissions().catch(console.error);
