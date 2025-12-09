"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var googleapis_1 = require("googleapis");
var fs = __importStar(require("fs"));
var path = __importStar(require("path"));
var readline = __importStar(require("readline"));
// OAuth2 credentials file (same as json-to-sheets-oauth.ts)
var CREDENTIALS_PATH = path.join(__dirname, 'credentials.json');
var TOKEN_PATH = path.join(__dirname, 'token.json');
// Mixpanel client (we'll use require since it's a CommonJS module)
var Mixpanel = require('mixpanel');
var mixpanel = Mixpanel.init('f75ba30b6a506e568567f4d22713e91c', {
    verbose: true,
    debug: true,
    host: 'api-eu.mixpanel.com'
});
/**
 * Un-flattens a flat object with dot notation keys back to nested structure
 * Reverse operation of the flattenObject function in json-to-sheets-oauth.ts
 */
function unflattenObject(flattened) {
    var result = {};
    for (var key in flattened) {
        if (flattened.hasOwnProperty(key)) {
            var value = flattened[key];
            // Skip .length properties as they were metadata
            if (key.endsWith('.length')) {
                continue;
            }
            var parts = key.split('.');
            var current = result;
            for (var i = 0; i < parts.length; i++) {
                var part = parts[i];
                var isLast = i === parts.length - 1;
                // Check if this part represents an array index like "items[0]"
                var arrayMatch = part.match(/^(.+)\[(\d+)\]$/);
                if (arrayMatch) {
                    var arrayName = arrayMatch[1];
                    var index = parseInt(arrayMatch[2], 10);
                    // Initialize array if it doesn't exist
                    if (!current[arrayName]) {
                        current[arrayName] = [];
                    }
                    // If this is the last part, set the value
                    if (isLast) {
                        current[arrayName][index] = value;
                    }
                    else {
                        // Initialize the array element as an object if needed
                        if (!current[arrayName][index]) {
                            current[arrayName][index] = {};
                        }
                        current = current[arrayName][index];
                    }
                }
                else {
                    // Regular property
                    if (isLast) {
                        current[part] = value;
                    }
                    else {
                        // Initialize nested object if needed
                        if (!current[part]) {
                            current[part] = {};
                        }
                        current = current[part];
                    }
                }
            }
        }
    }
    return result;
}
/**
 * Get OAuth2 client with stored token or prompt for authorization
 */
function authorize() {
    return __awaiter(this, void 0, void 0, function () {
        var credentials, _a, client_secret, client_id, redirect_uris, oAuth2Client, token;
        return __generator(this, function (_b) {
            // Load client credentials
            if (!fs.existsSync(CREDENTIALS_PATH)) {
                throw new Error("Credentials file not found at ".concat(CREDENTIALS_PATH, "\n") +
                    'Please download OAuth2 credentials from Google Cloud Console.\n' +
                    'See SETUP-OAUTH2.md for instructions.');
            }
            credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf-8'));
            _a = credentials.installed || credentials.web, client_secret = _a.client_secret, client_id = _a.client_id, redirect_uris = _a.redirect_uris;
            oAuth2Client = new googleapis_1.google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
            // Check if we have a saved token
            if (fs.existsSync(TOKEN_PATH)) {
                token = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf-8'));
                oAuth2Client.setCredentials(token);
                return [2 /*return*/, oAuth2Client];
            }
            // Get new token
            return [2 /*return*/, getNewToken(oAuth2Client)];
        });
    });
}
/**
 * Get authorization token from user
 */
function getNewToken(oAuth2Client) {
    var authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: [
            'https://www.googleapis.com/auth/spreadsheets.readonly',
        ],
    });
    console.log('\n🔐 Authorization Required\n');
    console.log('Please authorize this app by visiting this URL:\n');
    console.log(authUrl);
    console.log('\nAfter authorization, you will get a code. Paste it here:');
    var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    return new Promise(function (resolve, reject) {
        rl.question('Enter the code: ', function (code) {
            rl.close();
            oAuth2Client.getToken(code, function (err, token) {
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
 * Extract spreadsheet ID from URL
 */
function extractSpreadsheetId(urlOrId) {
    // If it's already just an ID, return it
    if (!urlOrId.includes('/') && !urlOrId.includes('http')) {
        return urlOrId;
    }
    // Extract from URL: https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit...
    var match = urlOrId.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (match) {
        return match[1];
    }
    throw new Error('Invalid spreadsheet URL or ID');
}
/**
 * Reads data from a Google Spreadsheet and sends it to Mixpanel
 */
function sheetsToMixpanel(spreadsheetUrl) {
    return __awaiter(this, void 0, void 0, function () {
        var auth, sheets, spreadsheetId, spreadsheet, sheetTitles, totalEventsSent_1, totalErrors_1, _i, sheetTitles_1, sheetTitle, response, rows, headers, dataRows, _loop_1, i, error_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 11, , 12]);
                    console.log('\n📊 Google Sheets to Mixpanel Sender\n');
                    console.log('═'.repeat(50));
                    // Authorize
                    console.log('\n1. Authenticating...');
                    return [4 /*yield*/, authorize()];
                case 1:
                    auth = _b.sent();
                    console.log('✓ Authenticated successfully');
                    sheets = googleapis_1.google.sheets({ version: 'v4', auth: auth });
                    spreadsheetId = extractSpreadsheetId(spreadsheetUrl);
                    // Get spreadsheet metadata to find all sheets
                    console.log('\n2. Reading spreadsheet metadata...');
                    return [4 /*yield*/, sheets.spreadsheets.get({
                            spreadsheetId: spreadsheetId,
                        })];
                case 2:
                    spreadsheet = _b.sent();
                    sheetTitles = (_a = spreadsheet.data.sheets) === null || _a === void 0 ? void 0 : _a.map(function (sheet) { var _a; return (_a = sheet.properties) === null || _a === void 0 ? void 0 : _a.title; }).filter(Boolean);
                    if (!sheetTitles || sheetTitles.length === 0) {
                        console.log('No sheets found in the spreadsheet');
                        return [2 /*return*/];
                    }
                    console.log("\u2713 Found ".concat(sheetTitles.length, " sheet(s): ").concat(sheetTitles.join(', ')));
                    totalEventsSent_1 = 0;
                    totalErrors_1 = 0;
                    _i = 0, sheetTitles_1 = sheetTitles;
                    _b.label = 3;
                case 3:
                    if (!(_i < sheetTitles_1.length)) return [3 /*break*/, 10];
                    sheetTitle = sheetTitles_1[_i];
                    console.log("\n3. Processing sheet: ".concat(sheetTitle));
                    return [4 /*yield*/, sheets.spreadsheets.values.get({
                            spreadsheetId: spreadsheetId,
                            range: "".concat(sheetTitle, "!A:ZZ"), // Read all columns
                        })];
                case 4:
                    response = _b.sent();
                    rows = response.data.values;
                    if (!rows || rows.length < 2) {
                        console.log("   \u26A0\uFE0F  Sheet \"".concat(sheetTitle, "\" is empty or has no data rows"));
                        return [3 /*break*/, 9];
                    }
                    headers = rows[0];
                    dataRows = rows.slice(1);
                    console.log("   \u2713 Found ".concat(dataRows.length, " data row(s)"));
                    _loop_1 = function (i) {
                        var row, flattenedData, j, value, eventData, eventType, playerId, eventProperties;
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0:
                                    row = dataRows[i];
                                    flattenedData = {};
                                    for (j = 0; j < headers.length; j++) {
                                        if (row[j] !== undefined && row[j] !== '') {
                                            value = row[j];
                                            if (!isNaN(Number(value)) && value !== '') {
                                                flattenedData[headers[j]] = Number(value);
                                            }
                                            else {
                                                flattenedData[headers[j]] = value;
                                            }
                                        }
                                    }
                                    eventData = unflattenObject(flattenedData);
                                    eventType = eventData.eventType || sheetTitle;
                                    playerId = eventData.playerId || 'unknown_player';
                                    eventProperties = __assign({ distinct_id: playerId }, eventData);
                                    // Send to Mixpanel
                                    console.log("   \uD83D\uDCE4 Sending event ".concat(i + 1, "/").concat(dataRows.length, " (").concat(eventType, ")..."));
                                    return [4 /*yield*/, new Promise(function (resolve, reject) {
                                            mixpanel.track(eventType, eventProperties, function (err) {
                                                if (err) {
                                                    console.error("   \u274C Error sending event ".concat(i + 1, ":"), err);
                                                    totalErrors_1++;
                                                    reject(err);
                                                }
                                                else {
                                                    console.log("   \u2705 Event ".concat(i + 1, " sent successfully"));
                                                    totalEventsSent_1++;
                                                    resolve();
                                                }
                                            });
                                        })];
                                case 1:
                                    _c.sent();
                                    // Small delay to avoid rate limiting
                                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 100); })];
                                case 2:
                                    // Small delay to avoid rate limiting
                                    _c.sent();
                                    return [2 /*return*/];
                            }
                        });
                    };
                    i = 0;
                    _b.label = 5;
                case 5:
                    if (!(i < dataRows.length)) return [3 /*break*/, 8];
                    return [5 /*yield**/, _loop_1(i)];
                case 6:
                    _b.sent();
                    _b.label = 7;
                case 7:
                    i++;
                    return [3 /*break*/, 5];
                case 8:
                    console.log("   \u2713 Completed processing sheet: ".concat(sheetTitle));
                    _b.label = 9;
                case 9:
                    _i++;
                    return [3 /*break*/, 3];
                case 10:
                    console.log('\n' + '═'.repeat(50));
                    console.log("\n\u2705 SUCCESS! Sent ".concat(totalEventsSent_1, " events to Mixpanel"));
                    if (totalErrors_1 > 0) {
                        console.log("\u26A0\uFE0F  ".concat(totalErrors_1, " errors occurred"));
                    }
                    console.log();
                    return [3 /*break*/, 12];
                case 11:
                    error_1 = _b.sent();
                    console.error('\n❌ Error:', error_1.message);
                    if (error_1.stack) {
                        console.error('\nStack trace:', error_1.stack);
                    }
                    process.exit(1);
                    return [3 /*break*/, 12];
                case 12: return [2 /*return*/];
            }
        });
    });
}
// Get spreadsheet URL from command line arguments
var spreadsheetUrl = process.argv[2];
if (!spreadsheetUrl) {
    console.error('\n❌ Error: Spreadsheet URL or ID required\n');
    console.log('Usage: ts-node sheets-to-mixpanel-oauth.ts <spreadsheet_url_or_id>\n');
    console.log('Example:');
    console.log('  ts-node sheets-to-mixpanel-oauth.ts "https://docs.google.com/spreadsheets/d/1a2b3c4d5e6f7g8h9i0j/edit"');
    console.log('  ts-node sheets-to-mixpanel-oauth.ts "1a2b3c4d5e6f7g8h9i0j"');
    console.log();
    process.exit(1);
}
// Run the script
sheetsToMixpanel(spreadsheetUrl);
