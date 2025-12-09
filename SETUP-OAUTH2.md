# OAuth2 Setup Guide for JSON to Google Sheets

This guide will help you set up OAuth2 authentication (much simpler than Service Accounts!).

## Why OAuth2?

- ✅ Uses your personal Google account
- ✅ No IAM permission configuration needed
- ✅ Works immediately after setup
- ✅ One-time browser authorization

---

## Step 1: Create OAuth2 Credentials

### 1.1 Go to Google Cloud Console

Open: https://console.cloud.google.com/apis/credentials

Make sure your project **"forward-camera-466620-f8"** is selected at the top.

### 1.2 Configure OAuth Consent Screen (First Time Only)

1. Click **"OAuth consent screen"** in the left sidebar
2. Choose **"External"** (unless you have a Google Workspace account)
3. Click **"CREATE"**
4. Fill in the required fields:
   - **App name**: "JSON to Sheets" (or any name you want)
   - **User support email**: Your email
   - **Developer contact email**: Your email
5. Click **"SAVE AND CONTINUE"**
6. On "Scopes" page, click **"ADD OR REMOVE SCOPES"**
7. Find and select these scopes:
   - `.../auth/spreadsheets` (Google Sheets API)
   - `.../auth/drive.file` (Google Drive API - per-file access)
8. Click **"UPDATE"** then **"SAVE AND CONTINUE"**
9. On "Test users" page, click **"ADD USERS"**
10. Add your email address
11. Click **"SAVE AND CONTINUE"**
12. Review and click **"BACK TO DASHBOARD"**

### 1.3 Create OAuth2 Client ID

1. Click **"Credentials"** in the left sidebar
2. Click **"+ CREATE CREDENTIALS"** at the top
3. Select **"OAuth client ID"**
4. For "Application type", choose **"Desktop app"**
5. Give it a name: "JSON to Sheets Desktop"
6. Click **"CREATE"**
7. You'll see a popup with your credentials - click **"DOWNLOAD JSON"**
8. Save the downloaded file

---

## Step 2: Set Up Credentials File

1. Rename the downloaded file to **`credentials.json`**
2. Move it to your project directory:
   ```bash
   mv ~/Downloads/client_secret_*.json /home/martin/mixpanel/credentials.json
   ```

Your project directory should now have:
```
/home/martin/mixpanel/
├── credentials.json  ← Your OAuth2 credentials
├── json-to-sheets-oauth.ts
├── json/
│   ├── buy-event.txt
│   └── random-choice-event.txt
└── ...
```

---

## Step 3: Enable Required APIs

Make sure these APIs are enabled (you probably already did this):

1. **Google Sheets API**: https://console.cloud.google.com/apis/library/sheets.googleapis.com
   - Click **"ENABLE"**

2. **Google Drive API**: https://console.cloud.google.com/apis/library/drive.googleapis.com
   - Click **"ENABLE"**

---

## Step 4: Run the Script

```bash
npx ts-node json-to-sheets-oauth.ts
```

### What Happens:

1. The script will display a URL
2. Copy the URL and open it in your browser
3. Log in with your Google account
4. You'll see a warning: "Google hasn't verified this app"
   - Click **"Advanced"**
   - Click **"Go to JSON to Sheets (unsafe)"**
5. Click **"Allow"** to grant permissions
6. You'll get a code - copy it
7. Paste the code back into the terminal
8. The script will create your Google Sheet!

### First Run Example:

```
📊 JSON to Google Sheets Converter (OAuth2)

══════════════════════════════════════════════════

1. Authenticating...

🔐 Authorization Required

Please authorize this app by visiting this URL:

https://accounts.google.com/o/oauth2/v2/auth?access_type=offline&scope=...

After authorization, you will get a code. Paste it here:
Enter the code: 4/0AeanM...  ← Paste your code here

✓ Token saved to token.json
✓ Authenticated successfully
```

---

## Step 5: Future Runs

After the first run, the script will automatically use the saved token in `token.json`.

Just run:
```bash
npx ts-node json-to-sheets-oauth.ts
```

No browser authorization needed!

---

## Troubleshooting

### "Credentials file not found"
- Make sure `credentials.json` is in `/home/martin/mixpanel/`
- Check the filename is exactly `credentials.json` (not `credentials (1).json`)

### "Access blocked: This app's request is invalid"
- Make sure you added yourself as a test user in the OAuth consent screen
- Check that the scopes are configured correctly

### "The app is in testing mode"
- This is normal! Your app works fine in testing mode
- Only you (the test user) can use it
- To publish for others, you'd need Google verification (not needed for personal use)

### "Token has been expired or revoked"
- Delete `token.json`
- Run the script again - it will prompt for authorization

### Need to revoke access?
- Go to: https://myaccount.google.com/permissions
- Find "JSON to Sheets" and click "Remove access"

---

## Security Notes

⚠️ **Keep these files private:**
- `credentials.json` - Contains your OAuth2 client secret
- `token.json` - Contains your access/refresh tokens

Add to `.gitignore` (already done):
```
credentials.json
token.json
```

---

## Quick Reference

**First time setup:**
```bash
# 1. Download credentials.json from Google Cloud Console
# 2. Move it to project directory
mv ~/Downloads/client_secret_*.json ./credentials.json

# 3. Run the script
npx ts-node json-to-sheets-oauth.ts

# 4. Follow browser authorization flow
```

**Every time after:**
```bash
npx ts-node json-to-sheets-oauth.ts
```

Done! 🎉
