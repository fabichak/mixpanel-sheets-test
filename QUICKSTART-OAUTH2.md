# 🚀 Quick Start - OAuth2 Version

The OAuth2 version is **much simpler** than Service Accounts. Follow these 3 steps:

## Step 1: Create OAuth2 Credentials (5 minutes)

1. Go to: https://console.cloud.google.com/apis/credentials
2. Configure OAuth consent screen (if not done):
   - Click "OAuth consent screen"
   - Choose "External"
   - Fill in app name and your email
   - Add scopes: `spreadsheets` and `drive.file`
   - Add yourself as a test user
3. Create credentials:
   - Click "+ CREATE CREDENTIALS" → "OAuth client ID"
   - Choose "Desktop app"
   - Download the JSON file
4. Rename and move the file:
   ```bash
   mv ~/Downloads/client_secret_*.json ./credentials.json
   ```

## Step 2: Enable APIs (if not already done)

- Google Sheets API: https://console.cloud.google.com/apis/library/sheets.googleapis.com
- Google Drive API: https://console.cloud.google.com/apis/library/drive.googleapis.com

## Step 3: Run the Script

```bash
npx ts-node json-to-sheets-oauth.ts
```

### First Run:
1. Script shows a URL → Open it in browser
2. Log in with your Google account
3. Click "Advanced" → "Go to JSON to Sheets (unsafe)"
4. Click "Allow"
5. Copy the code and paste it in the terminal
6. Done! Your spreadsheet is created! 🎉

### Future Runs:
Just run the same command - no authorization needed!

---

## Full Instructions

See **SETUP-OAUTH2.md** for detailed step-by-step instructions with screenshots references.

## Troubleshooting

**"Credentials file not found"**
- Make sure `credentials.json` is in this directory
- Check the filename (not `credentials (1).json`)

**"Access blocked"**
- Add yourself as a test user in OAuth consent screen

**Token expired?**
- Delete `token.json` and run again

---

## What Gets Created?

The script:
- ✅ Reads all JSON files from `json/` folder
- ✅ Creates one Google Sheet with multiple tabs
- ✅ Each JSON file → one sheet tab
- ✅ Flattens nested structures (e.g., `shopState.heroes[0].heroId`)
- ✅ Automatically formats headers (bold)

That's it! Simple! 🎊
