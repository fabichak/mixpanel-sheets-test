import { google } from 'googleapis';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

// OAuth2 credentials file (download from Google Cloud Console)
const CREDENTIALS_PATH = path.join(__dirname, 'credentials.json');
const TOKEN_PATH = path.join(__dirname, 'token-write.json');

// Type definitions
interface FlattenedData {
  [key: string]: string | number | boolean | null;
}

/**
 * Flattens a nested JSON object into a single-level object with dot notation keys
 */
function flattenObject(obj: any, prefix: string = ''): FlattenedData {
  const flattened: FlattenedData = {};

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const newKey = prefix ? `${prefix}.${key}` : key;
      const value = obj[key];

      if (value === null || value === undefined) {
        flattened[newKey] = null;
      } else if (Array.isArray(value)) {
        // Flatten arrays with indexed keys
        value.forEach((item, index) => {
          if (typeof item === 'object' && item !== null) {
            Object.assign(flattened, flattenObject(item, `${newKey}[${index}]`));
          } else {
            flattened[`${newKey}[${index}]`] = item;
          }
        });
        flattened[`${newKey}.length`] = value.length;
      } else if (typeof value === 'object') {
        Object.assign(flattened, flattenObject(value, newKey));
      } else {
        flattened[newKey] = value;
      }
    }
  }

  return flattened;
}

/**
 * Reads and parses all JSON files from a directory
 */
function readJsonFiles(dirPath: string): Array<{ filename: string; data: any }> {
  const files = fs.readdirSync(dirPath);
  const jsonData: Array<{ filename: string; data: any }> = [];

  for (const file of files) {
    if (file.endsWith('.json') || file.endsWith('.txt')) {
      const filePath = path.join(dirPath, file);
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const data = JSON.parse(content);
        const filename = path.basename(file, path.extname(file));
        jsonData.push({ filename, data });
      } catch (error) {
        console.error(`Error parsing ${file}:`, error);
        console.log(`Skipping ${file} due to parse error`);
      }
    }
  }

  return jsonData;
}

/**
 * Converts flattened data to a 2D array suitable for Google Sheets
 */
function convertToSheetData(data: FlattenedData): any[][] {
  const headers = Object.keys(data);
  const values = Object.values(data);
  return [headers, values];
}

/**
 * Get OAuth2 client with stored token or prompt for authorization
 */
async function authorize(): Promise<any> {
  // Load client credentials
  if (!fs.existsSync(CREDENTIALS_PATH)) {
    throw new Error(
      `Credentials file not found at ${CREDENTIALS_PATH}\n` +
      'Please download OAuth2 credentials from Google Cloud Console.\n' +
      'See SETUP-OAUTH2.md for instructions.'
    );
  }

  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf-8'));
  const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;

  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

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
function getNewToken(oAuth2Client: any): Promise<any> {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive.file',
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
      oAuth2Client.getToken(code, (err: any, token: any) => {
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
 * Creates a Google Sheet with multiple tabs from JSON files
 */
async function createGoogleSheet() {
  try {
    console.log('\n📊 JSON to Google Sheets Converter (OAuth2)\n');
    console.log('═'.repeat(50));

    // Authorize
    console.log('\n1. Authenticating...');
    const auth = await authorize();
    console.log('✓ Authenticated successfully');

    const sheets = google.sheets({ version: 'v4', auth });

    // Read all JSON files
    const jsonDir = path.join(__dirname, 'json');
    console.log(`\n2. Reading JSON files from: ${jsonDir}`);
    const jsonFiles = readJsonFiles(jsonDir);

    if (jsonFiles.length === 0) {
      console.log('No JSON files found in the json directory');
      return;
    }

    console.log(`✓ Found ${jsonFiles.length} JSON file(s)`);

    // Create a new spreadsheet
    console.log('\n3. Creating spreadsheet...');
    const spreadsheet = await sheets.spreadsheets.create({
      requestBody: {
        properties: {
          title: `JSON Data Export - ${new Date().toISOString().split('T')[0]}`,
        },
        sheets: jsonFiles.map((file, index) => ({
          properties: {
            sheetId: index,
            title: file.filename,
          },
        })),
      },
    });

    const spreadsheetId = spreadsheet.data.spreadsheetId;

    if (!spreadsheetId) {
      throw new Error('Failed to create spreadsheet: No spreadsheet ID returned');
    }

    console.log(`✓ Created spreadsheet: ${spreadsheetId}`);

    // Populate each sheet with data
    console.log('\n4. Populating sheets with data...');
    for (const file of jsonFiles) {
      console.log(`   Processing ${file.filename}...`);

      const flattened = flattenObject(file.data);
      const sheetData = convertToSheetData(flattened);

      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${file.filename}!A1`,
        valueInputOption: 'RAW',
        requestBody: {
          values: sheetData,
        },
      });

      console.log(`   ✓ Added data to sheet: ${file.filename}`);
    }

    // Format headers (make them bold)
    console.log('\n5. Formatting...');
    const requests = jsonFiles.map((file, index) => ({
      repeatCell: {
        range: {
          sheetId: index,
          startRowIndex: 0,
          endRowIndex: 1,
        },
        cell: {
          userEnteredFormat: {
            textFormat: {
              bold: true,
            },
          },
        },
        fields: 'userEnteredFormat.textFormat.bold',
      },
    }));

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests,
      },
    });

    console.log('✓ Formatting applied');

    console.log('\n' + '═'.repeat(50));
    console.log('\n✅ SUCCESS! Google Sheet created with all JSON data!\n');
    console.log(`🔗 Open your spreadsheet:`);
    console.log(`   https://docs.google.com/spreadsheets/d/${spreadsheetId}\n`);

  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    if (error.stack) {
      console.error('\nStack trace:', error.stack);
    }
    process.exit(1);
  }
}

// Run the script
createGoogleSheet();
