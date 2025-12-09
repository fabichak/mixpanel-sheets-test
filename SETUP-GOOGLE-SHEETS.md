# Google Sheets JSON Import Setup Guide

This guide will help you set up Google Service Account authentication to run the `json-to-sheets.ts` script.

## Prerequisites

- Node.js (v14 or higher)
- A Google account
- Access to Google Cloud Console

## Step 1: Install Dependencies

First, install the required npm packages:

```bash
npm install googleapis dotenv
npm install --save-dev typescript @types/node ts-node
```

## Step 2: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top
3. Click "New Project"
4. Enter a project name (e.g., "JSON to Sheets")
5. Click "Create"

## Step 3: Enable Google Sheets API

1. In your Google Cloud project, go to "APIs & Services" → "Library"
2. Search for "Google Sheets API"
3. Click on it and press "Enable"
4. Also enable "Google Drive API" (needed for sharing)

## Step 4: Create a Service Account

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "Service Account"
3. Enter a service account name (e.g., "sheets-import")
4. Click "Create and Continue"
5. Skip the optional steps and click "Done"

## Step 5: Create Service Account Key

1. In the Credentials page, find your newly created service account
2. Click on the service account email
3. Go to the "Keys" tab
4. Click "Add Key" → "Create new key"
5. Choose "JSON" format
6. Click "Create"
7. A JSON file will be downloaded to your computer

## Step 6: Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Open the downloaded JSON key file and find these values:
   - `client_email` - this is your GOOGLE_SERVICE_ACCOUNT_EMAIL
   - `private_key` - this is your GOOGLE_PRIVATE_KEY

3. Edit `.env` file and add:
   ```
   GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project-id.iam.gserviceaccount.com
   GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
   SHARE_WITH_EMAIL=your-email@example.com
   ```

   **Important Notes:**
   - Keep the quotes around the GOOGLE_PRIVATE_KEY
   - Make sure to include the `\n` characters in the private key
   - The SHARE_WITH_EMAIL is optional but recommended so you can access the created spreadsheet

## Step 7: Add TypeScript Configuration (if needed)

Create a `tsconfig.json` file if you don't have one:

```bash
npx tsc --init
```

Or create it manually with this content:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["*.ts"],
  "exclude": ["node_modules"]
}
```

## Step 8: Run the Script

There are two ways to run the script:

### Option A: Using ts-node (quick, no compilation)
```bash
npx ts-node json-to-sheets.ts
```

### Option B: Compile and run
```bash
npx tsc
node json-to-sheets.js
```

## Step 9: Access Your Google Sheet

After running the script, you'll see output like:

```
Found 2 JSON file(s)
Created spreadsheet: 1abc123...
Processing buy-event...
✓ Added data to sheet: buy-event
Processing random-choice-event...
✓ Added data to sheet: random-choice-event

✅ Successfully created Google Sheet with all JSON data!
🔗 Spreadsheet URL: https://docs.google.com/spreadsheets/d/1abc123...
📧 Shared with: your-email@example.com
```

Click on the URL to view your spreadsheet!

## Troubleshooting

### "Missing required environment variables" error
- Make sure your `.env` file exists and contains the correct values
- Check that there are no extra spaces in the .env file
- Verify the private key includes `\n` characters

### "Error parsing" errors
- Check if your JSON files are valid JSON
- The script will skip files with syntax errors

### Permission errors
- Make sure the Google Sheets API and Google Drive API are enabled
- Verify your service account credentials are correct

### Can't access the spreadsheet
- Add your email to the SHARE_WITH_EMAIL variable in .env
- Or manually share the spreadsheet using the service account email

## Security Notes

⚠️ **Important**: Never commit your `.env` file or service account JSON key to version control!

Add to `.gitignore`:
```
.env
*-key.json
```

## Optional: Add npm script

You can add a script to your `package.json` for easier execution:

```json
{
  "scripts": {
    "sheets:import": "ts-node json-to-sheets.ts",
    "sheets:import:build": "tsc && node json-to-sheets.js"
  }
}
```

Then run with:
```bash
npm run sheets:import
```
