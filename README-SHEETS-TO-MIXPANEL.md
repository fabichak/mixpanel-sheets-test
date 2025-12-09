# Google Sheets to Mixpanel

This script reads event data from a Google Spreadsheet and sends it to Mixpanel.

## Overview

The `sheets-to-mixpanel-oauth.ts` script is the reverse operation of `json-to-sheets-oauth.ts`:

1. **json-to-sheets-oauth.ts**: Reads JSON files → Exports to Google Sheets (flattened format)
2. **sheets-to-mixpanel-oauth.ts**: Reads Google Sheets (flattened format) → Sends to Mixpanel

## Prerequisites

1. **Google Cloud OAuth2 Setup**: Same as `json-to-sheets-oauth.ts`
   - `credentials.json` must be present in the project directory
   - `token.json` will be created on first run (or reused if exists)

2. **Mixpanel Configuration**:
   - Mixpanel token is configured in the script (same as `mixpanel-client.js`)

3. **Dependencies**: Already installed via `package.json`
   ```bash
   npm install
   ```

## Usage

### Method 1: Using npm script (Recommended - Easiest!)

```bash
npm run sheets-to-mixpanel "<spreadsheet_url_or_id>"
```

### Method 2: Direct Node.js execution

```bash
node dist/sheets-to-mixpanel-oauth.js "<spreadsheet_url_or_id>"
```

### Method 3: TypeScript execution (requires ts-node)

```bash
ts-node sheets-to-mixpanel-oauth.ts "<spreadsheet_url_or_id>"
```

### Examples

**Using npm script (recommended):**
```bash
npm run sheets-to-mixpanel "https://docs.google.com/spreadsheets/d/1a2b3c4d5e6f7g8h9i0j/edit"
```

**Using just the spreadsheet ID:**
```bash
npm run sheets-to-mixpanel "1a2b3c4d5e6f7g8h9i0j"
```

**Using compiled JavaScript directly:**
```bash
node dist/sheets-to-mixpanel-oauth.js "1a2b3c4d5e6f7g8h9i0j"
```

## How It Works

### 1. Data Structure

The spreadsheet should have the same structure as created by `json-to-sheets-oauth.ts`:

**Flattened Format (in spreadsheet):**
| eventType | timestamp | playerId | runSeed | currentFloorIndex | shopState.rerolls | playerState.playerCurrency | ... |
|-----------|-----------|----------|---------|-------------------|-------------------|----------------------------|-----|
| shop      | 0         | Player   | 0       | 0                 | 2                 | 100                        | ... |

**Nested Format (sent to Mixpanel):**
```json
{
  "eventType": "shop",
  "timestamp": "0",
  "playerId": "Player",
  "runSeed": 0,
  "currentFloorIndex": 0,
  "shopState": {
    "rerolls": 2
  },
  "playerState": {
    "playerCurrency": 100
  }
}
```

### 2. Processing Steps

1. **Authentication**: Uses OAuth2 to authenticate with Google Sheets API
2. **Reading Data**:
   - Reads all sheets/tabs in the spreadsheet
   - First row = column headers (flattened property names)
   - Subsequent rows = data
3. **Un-flattening**:
   - Converts dot notation back to nested objects
   - Handles arrays with `[index]` notation
   - Preserves data types (numbers, strings)
4. **Sending to Mixpanel**:
   - Each row becomes a Mixpanel event
   - Event type is taken from `eventType` field or sheet name
   - `playerId` is used as `distinct_id`
   - Small delay between events to avoid rate limiting

### 3. Un-flattening Logic

The script reverses the flattening done by `json-to-sheets-oauth.ts`:

**Flattened → Nested:**
```javascript
// Input (flattened)
{
  "shopState.heroes[0].heroId": "hero_01",
  "shopState.heroes[0].rank": 1,
  "shopState.rerolls": 2
}

// Output (nested)
{
  "shopState": {
    "heroes": [
      {
        "heroId": "hero_01",
        "rank": 1
      }
    ],
    "rerolls": 2
  }
}
```

## Complete Workflow Example

### From JSON to Mixpanel via Sheets

```bash
# Step 1: Compile TypeScript (first time only)
npm run build

# Step 2: Export JSON files to Google Sheets
npm run json-to-sheets
# Output: Creates spreadsheet with URL

# Step 3: (Optional) Edit data in Google Sheets
# - Add more rows
# - Modify values
# - Add new columns

# Step 4: Import from Google Sheets to Mixpanel
npm run sheets-to-mixpanel "https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit"
# Output: Sends all rows as events to Mixpanel
```

### Alternative: Direct commands

```bash
# Using compiled JavaScript files
node dist/json-to-sheets-oauth.js
node dist/sheets-to-mixpanel-oauth.js "SPREADSHEET_ID"

# Or using ts-node (requires arg dependency)
ts-node json-to-sheets-oauth.ts
ts-node sheets-to-mixpanel-oauth.ts "SPREADSHEET_ID"
```

## Output Example

```
📊 Google Sheets to Mixpanel Sender

══════════════════════════════════════════════════

1. Authenticating...
✓ Authenticated successfully

2. Reading spreadsheet metadata...
✓ Found 2 sheet(s): buy-event, random-choice-event

3. Processing sheet: buy-event
   ✓ Found 1 data row(s)
   📤 Sending event 1/1 (shop)...
   ✅ Event 1 sent successfully
   ✓ Completed processing sheet: buy-event

3. Processing sheet: random-choice-event
   ✓ Found 1 data row(s)
   📤 Sending event 1/1 (shop)...
   ✅ Event 1 sent successfully
   ✓ Completed processing sheet: random-choice-event

══════════════════════════════════════════════════

✅ SUCCESS! Sent 2 events to Mixpanel
```

## Error Handling

The script includes comprehensive error handling for:

- **Missing credentials**: Clear error message with setup instructions
- **Invalid spreadsheet URL/ID**: Validates format before processing
- **Empty sheets**: Skips sheets with no data
- **Mixpanel API errors**: Logs errors but continues processing
- **Rate limiting**: Includes 100ms delay between events

## Notes

1. **OAuth Scopes**: Only requests read-only access to spreadsheets (`spreadsheets.readonly`)
2. **Token Reuse**: The same `token.json` from `json-to-sheets-oauth.ts` can be used (if scopes are compatible)
3. **Data Types**: Automatically converts numeric strings to numbers
4. **Event Types**: Uses `eventType` field from data, falls back to sheet name
5. **Rate Limiting**: Adds 100ms delay between events to avoid hitting Mixpanel rate limits

## Troubleshooting

### "Credentials file not found"
- Ensure `credentials.json` exists in the project directory
- Follow `SETUP-OAUTH2.md` to download OAuth2 credentials

### "Invalid spreadsheet URL or ID"
- Check that the URL is correct
- Try using just the spreadsheet ID instead of full URL
- Format: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`

### "Sheet is empty or has no data rows"
- Ensure the sheet has at least 2 rows (headers + data)
- Check that the first row contains column headers

### Mixpanel events not appearing
- Verify the Mixpanel token is correct
- Check the Mixpanel console for incoming events
- Look for error messages in the script output
- Ensure `distinct_id` or `playerId` is present in the data

## Comparison with Other Scripts

| Script | Input | Output | Use Case |
|--------|-------|--------|----------|
| `json-to-sheets-oauth.ts` | JSON files | Google Sheets | Export game events for viewing/editing |
| `sheets-to-mixpanel-oauth.ts` | Google Sheets | Mixpanel events | Import edited data to analytics |
| `send-events.js` | JSON file | Mixpanel events | Direct JSON to Mixpanel (single file) |

## Data Structure Reference

See the `json/` folder for example event structures:
- `buy-event.txt` - Shop purchase event
- `random-choice-event.txt` - Random choice event

Both scripts maintain the same nested structure for compatibility.
