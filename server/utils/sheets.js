import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import dotenv from 'dotenv';
dotenv.config();
console.log('[v0] Sheets.js loading...');
console.log('[v0] GOOGLE_SHEETS_CLIENT_EMAIL:', process.env.GOOGLE_SHEETS_CLIENT_EMAIL ? 'SET' : 'MISSING');
console.log('[v0] GOOGLE_SHEETS_PRIVATE_KEY:', process.env.GOOGLE_SHEETS_PRIVATE_KEY ? 'SET' : 'MISSING');
console.log('[v0] GOOGLE_SHEETS_SPREADSHEET_ID:', process.env.GOOGLE_SHEETS_SPREADSHEET_ID ? 'SET' : 'MISSING');

const serviceAccountAuth = new JWT({
  email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
  key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  scopes: [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive.file',
  ],
});

export async function getSheets() {
  console.log('[v0] getSheets - Getting spreadsheet with ID:', process.env.GOOGLE_SHEETS_SPREADSHEET_ID);
  console.log('[v0] getSheets - Auth email:', process.env.GOOGLE_SHEETS_CLIENT_EMAIL);
  
  const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEETS_SPREADSHEET_ID, serviceAccountAuth);
  console.log('[v0] getSheets - Created GoogleSpreadsheet instance');
  
  await doc.loadInfo();
  console.log('[v0] getSheets - Spreadsheet info loaded successfully');
  return doc;
}

export async function getProductsSheet() {
  const doc = await getSheets();
  return doc.sheetsByTitle['Products'] || doc.sheetsByIndex[0];
}

export async function getCategoriesSheet() {
  const doc = await getSheets();
  return doc.sheetsByTitle['Categories'] || doc.sheetsByIndex[1];
}

export async function getAllRows(sheet) {
  try {
    const rows = await sheet.getRows();
    return rows.map(row => row.toObject());
  } catch (error) {
    console.error('Error fetching rows:', error);
    return [];
  }
}

export async function addRow(sheet, data) {
  try {
    const row = await sheet.addRow(data);
    return row.toObject();
  } catch (error) {
    console.error('Error adding row:', error);
    throw error;
  }
}

export async function updateRow(sheet, rowIndex, data) {
  try {
    const rows = await sheet.getRows();
    const row = rows[rowIndex];
    if (!row) throw new Error('Row not found');
    
    Object.keys(data).forEach(key => {
      row[key] = data[key];
    });
    
    await row.save();
    return row.toObject();
  } catch (error) {
    console.error('Error updating row:', error);
    throw error;
  }
}

export async function deleteRow(sheet, rowIndex) {
  try {
    const rows = await sheet.getRows();
    const row = rows[rowIndex];
    if (!row) throw new Error('Row not found');
    
    await row.delete();
    return true;
  } catch (error) {
    console.error('Error deleting row:', error);
    throw error;
  }
}
