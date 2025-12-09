import { google } from 'googleapis';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Type definitions
interface FlattenedData {
  [key: string]: string | number | boolean | null;
}

/**
 * Flattens a nested JSON object into a single-level object with dot notation keys
 * @param obj - The object to flatten
 * @param prefix - The prefix for nested keys
 * @returns Flattened object
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
        // Also store array length for reference
        flattened[`${newKey}.length`] = value.length;
      } else if (typeof value === 'object') {
        // Recursively flatten nested objects
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
 * @param dirPath - Path to the directory containing JSON files
 * @returns Array of objects containing filename and parsed data
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
 * @param data - Flattened data object
 * @returns 2D array with headers and values
 */
function convertToSheetData(data: FlattenedData): any[][] {
  const headers = Object.keys(data);
  const values = Object.values(data);
  return [headers, values];
}

/**
 * Creates a Google Sheet with multiple tabs from JSON files
 */
async function createGoogleSheet() {
  try {
    // Validate environment variables
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
      throw new Error(
        'Missing required environment variables: GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_PRIVATE_KEY'
      );
    }

    // Initialize Google Sheets API with Service Account
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Read all JSON files
    const jsonDir = path.join(__dirname, 'json');
    console.log(`Reading JSON files from: ${jsonDir}`);
    const jsonFiles = readJsonFiles(jsonDir);

    if (jsonFiles.length === 0) {
      console.log('No JSON files found in the json directory');
      return;
    }

    console.log(`Found ${jsonFiles.length} JSON file(s)`);

    // Create a new spreadsheet
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

    console.log(`Created spreadsheet: ${spreadsheetId}`);
    console.log(`View at: https://docs.google.com/spreadsheets/d/${spreadsheetId}`);

    // Populate each sheet with data
    for (const file of jsonFiles) {
      console.log(`Processing ${file.filename}...`);

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

      console.log(`✓ Added data to sheet: ${file.filename}`);
    }

    // Format headers (make them bold)
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

    console.log('\n✅ Successfully created Google Sheet with all JSON data!');
    console.log(`🔗 Spreadsheet URL: https://docs.google.com/spreadsheets/d/${spreadsheetId}`);

    // If SHARE_WITH_EMAIL is set, share the spreadsheet
    if (process.env.SHARE_WITH_EMAIL) {
      const drive = google.drive({ version: 'v3', auth });
      await drive.permissions.create({
        fileId: spreadsheetId,
        requestBody: {
          type: 'user',
          role: 'writer',
          emailAddress: process.env.SHARE_WITH_EMAIL,
        },
      });
      console.log(`📧 Shared with: ${process.env.SHARE_WITH_EMAIL}`);
    }

  } catch (error: any) {
    console.error('Error creating Google Sheet:', error.message);
    if (error.errors) {
      console.error('Details:', error.errors);
    }
    process.exit(1);
  }
}

// Run the script
createGoogleSheet();
