# Admin Portal - Complete Setup Guide

This guide will walk you through setting up the Admin Portal application with all required services and dependencies.

## System Architecture

The application consists of:
- **Frontend**: Next.js (Next 16) with TypeScript and Tailwind CSS
- **Backend**: Express.js REST API with Google Sheets integration
- **Database**: Google Sheets (product data storage)
- **Image Storage**: Cloudinary (product images)
- **Authentication**: Session-based with httpOnly cookies

## Prerequisites

Before starting, ensure you have:
- Node.js 18+ and npm/pnpm installed
- Git installed
- A Google Cloud account
- A Cloudinary account
- Basic knowledge of environment variables

---

## Part 1: Google Sheets API Setup

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a Project" → "New Project"
3. Enter project name: `Admin Portal`
4. Click "Create"
5. Wait for the project to be created

### Step 2: Enable Google Sheets API

1. In the Google Cloud Console, search for "Google Sheets API"
2. Click on it and press "Enable"
3. Search for "Google Drive API"
4. Click on it and press "Enable"

### Step 3: Create Service Account

1. In Google Cloud Console, go to "Service Accounts" (search in the search bar)
2. Click "Create Service Account"
3. Enter Service Account Name: `admin-portal-service`
4. Click "Create and Continue"
5. Skip optional steps and click "Done"

### Step 4: Generate Service Account Key

1. Click on the service account you just created
2. Go to the "Keys" tab
3. Click "Add Key" → "Create new key"
4. Choose "JSON" format
5. Click "Create"
6. A JSON file will download - **keep this safe**
7. Open the JSON file and copy the entire content

### Step 5: Create Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new blank spreadsheet
3. Name it: `Products Database`
4. Share it with your service account email (found in the JSON file under `client_email`)
5. Give it "Editor" permissions
6. Copy the Sheet ID from the URL (format: `https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit`)

### Step 6: Setup Sheet Columns

In your Google Sheet, create the following column headers in Row 1:

```
A: id
B: name
C: description
D: category
E: price
F: discount_percentage
G: discount_price
H: sizes
I: image_urls
J: sku
K: stock
L: colors
M: material
N: brand
O: weight
P: dimensions
Q: care_instructions
R: tags
S: created_at
T: updated_at
```

---

## Part 2: Cloudinary Setup

### Step 1: Create Cloudinary Account

1. Go to [Cloudinary](https://cloudinary.com/users/register/free)
2. Sign up with your email
3. Verify your email

### Step 2: Get API Credentials

1. Log in to your Cloudinary Dashboard
2. Go to "Settings" → "API Keys"
3. Copy the following:
   - **Cloud Name**: Found at the top of the dashboard  ---
   - **API Key**: Under "API Keys" ---
   - **API Secret**: Under "API Keys" (keep this secret!) ---

---

## Part 3: Project Setup

### Step 1: Clone/Download Project

```bash
# If using git
git clone <your-repo-url>
cd <project-folder>

# Or extract the downloaded ZIP file
```

### Step 2: Install Frontend Dependencies

```bash
# In the root directory
pnpm install
# or
npm install
```

### Step 3: Install Backend Dependencies

```bash
# Navigate to server directory
cd server
pnpm install
# or
npm install

# Return to root
cd ..
```

### Step 4: Setup Environment Variables

#### Frontend (.env.local)

Create a `.env.local` file in the root directory:

```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

#### Backend (server/.env)

Create a `.env` file in the `server` directory:

```
# Server Configuration
PORT=5000
NODE_ENV=development

# Google Sheets
GOOGLE_SHEETS_SPREADSHEET_ID=your_sheet_id_here
GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"...","private_key_id":"...","private_key":"...","client_email":"...","client_id":"...","auth_uri":"...","token_uri":"...","auth_provider_x509_cert_url":"...","client_x509_cert_url":"..."}

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here

# Admin Credentials (for authentication)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password_here
```

**Important:**
- For `GOOGLE_SERVICE_ACCOUNT_JSON`, paste the entire JSON content from the key file you downloaded (as a single line string)
- Replace `your_sheet_id_here` with the actual Google Sheet ID
- Replace Cloudinary credentials with your actual credentials
- Change the admin password to something secure

---

## Part 4: Running the Application

### Terminal 1: Start Backend Server

```bash
cd server
pnpm dev
# or
npm run dev
```

You should see:
```
Server running on http://localhost:5000
```

### Terminal 2: Start Frontend Development Server

```bash
# In the root directory (open a new terminal)
pnpm dev
# or
npm run dev
```

You should see:
```
▲ Next.js x.xx.x
  Local:        http://localhost:3000
```

### Access the Application

1. Open your browser and go to `http://localhost:3000`
2. You'll be redirected to the login page
3. Log in with credentials:
   - Username: `admin`
   - Password: (the password you set in `.env`)

---

## Part 5: Deployment

### Deploy to Vercel (Recommended)

#### Frontend

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. In "Environment Variables", add:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.com
   ```
6. Deploy

#### Backend (Express Server)

You have two options:

**Option A: Deploy to Railway.app**
1. Go to [Railway.app](https://railway.app)
2. Create a new project
3. Connect your GitHub repository
4. Add environment variables from your `.env` file
5. Deploy

**Option B: Deploy to Render.com**
1. Go to [Render.com](https://render.com)
2. Create a new "Web Service"
3. Connect your GitHub repository
4. Set root directory to `/server`
5. Add environment variables
6. Deploy

### Important Deployment Notes

- Update `NEXT_PUBLIC_API_URL` in frontend to your deployed backend URL
- Keep sensitive credentials (Google service account, Cloudinary API secret) in environment variables
- Never commit `.env` files to Git
- Enable HTTPS for production

---

## Part 6: Testing the Setup

### Test Authentication

1. Navigate to `http://localhost:3000/login`
2. Enter admin credentials
3. Should redirect to dashboard

### Test Product Management

1. Go to "Products" in sidebar
2. Click "Add Product"
3. Fill in product details
4. Upload 1-4 images
5. Click "Save Product"
6. Verify product appears in Cloudinary and Google Sheets

### Test Categories

1. Go to "Categories" in sidebar
2. View auto-generated categories from products
3. Add new category manually
4. Verify it updates the sheet

---

## Part 7: Troubleshooting

### Issue: "Cannot connect to backend"
- Ensure Express server is running on port 5000
- Check `NEXT_PUBLIC_API_URL` is correct in `.env.local`
- Check browser console for CORS errors

### Issue: "Google Sheets authentication failed"
- Verify `GOOGLE_SERVICE_ACCOUNT_JSON` is valid JSON
- Ensure service account email has access to the Google Sheet
- Check the Sheet ID is correct

### Issue: "Cloudinary upload failed"
- Verify Cloudinary credentials are correct
- Check API key and secret haven't been regenerated
- Ensure file size is under 100MB

### Issue: "Login fails"
- Verify admin username/password in `.env`
- Check cookies are enabled in browser
- Clear browser cache and try again

---

## Part 8: Database Maintenance

### Backup Google Sheet

1. In Google Sheets, click "File" → "Download" → "Excel"
2. Save the backup file locally
3. Do this regularly

### Clear Old Data

1. In Google Sheets, select rows to delete
2. Right-click and choose "Delete rows"
3. Note: Row 1 (headers) should never be deleted

---

## File Structure

```
admin-portal/
├── app/                          # Next.js app directory
│   ├── dashboard/               # Protected dashboard routes
│   ├── login/                   # Login page
│   ├── page.tsx                 # Root page (redirects)
│   └── layout.tsx               # Root layout with AuthProvider
├── components/
│   ├── dashboard/               # Dashboard components
│   ├── forms/                   # Form components
│   └── ui/                      # Shadcn UI components
├── lib/
│   ├── auth-context.tsx         # Authentication context
│   ├── api.ts                   # API utilities
│   └── utils.ts                 # General utilities
├── server/                      # Express backend
│   ├── index.js                 # Main server file
│   ├── routes/                  # API routes
│   ├── utils/                   # Utilities (sheets, cloudinary)
│   ├── package.json
│   └── .env                     # Backend environment variables
├── public/                      # Static assets
├── package.json                 # Frontend dependencies
├── .env.local                   # Frontend environment variables
└── SETUP_GUIDE.md              # This file
```

---

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Express.js Guide](https://expressjs.com/)
- [Google Sheets API Docs](https://developers.google.com/sheets/api)
- [Cloudinary Documentation](https://cloudinary.com/documentation)

---

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review console logs (both browser and terminal)
3. Verify all environment variables are set correctly
4. Check API credentials haven't expired

For additional help, consult the official documentation links above.
