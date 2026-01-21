# QR Code Check-In Application with Electronic Signature

A comprehensive web application that allows users to scan a QR code, review a legal waiver, and complete a check-in form with electronic signature (selfie) from their phone.

## Features

1. **QR Code Generation** - Generate a QR code that links to the check-in page
2. **Complete Legal Waiver** - Full 8-section Release and Waiver of Liability document
3. **Florida Statutory Compliance** - Section 6.2 formatted 5 points larger as required by FLA. STAT. § 744.301
4. **Electronic Signature via Selfie** - Camera capture for electronic signature per Florida Electronic Signature Act of 1996
5. **Mobile-Friendly Form** - Fully responsive design optimized for phone and desktop screens
6. **Form Validation** - Requires waiver acceptance, name, phone number, and selfie
7. **File Storage** - Selfies and records saved to local `uploads/` directory
8. **Confirmation** - Sends confirmation message back to the user after submission

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Start the Server

```bash
npm start
```

The server will start on `http://localhost:3000`

### 3. Access the QR Code

Open your browser and navigate to:
```
http://localhost:3000/qr
```

This page displays a QR code that can be scanned with any smartphone.

### 4. Test the Application

1. Scan the QR code with your phone's camera
2. You'll be taken to the check-in form with the complete waiver
3. Scroll through and read the waiver text
4. Check the box to agree to the waiver terms
5. Enter your name
6. Enter your phone number
7. Click "Take Selfie" to capture your electronic signature
8. Review your selfie and click "Retake" if needed
9. Click Submit
10. You'll receive a confirmation message

**Note:** The selfie serves as your electronic signature per Florida Electronic Signature Act of 1996.

## Project Structure

```
qrcode/
├── server.js          # Express server with routes and file handling
├── package.json       # Dependencies
├── README.md          # This file
├── uploads/           # Selfie images and records (created automatically)
│   ├── selfie_*.jpg   # Captured selfie images
│   └── record_*.json  # Check-in records with metadata
└── public/
    ├── index.html     # Check-in form page with waiver
    ├── style.css      # Responsive styling
    └── script.js      # Form handling and camera capture JavaScript
```

## API Endpoints

- `GET /` - Serves the check-in form with waiver
- `GET /qr` - Displays the QR code
- `POST /submit` - Handles form submission with selfie, saves files, and returns confirmation

## File Storage

Selfies and records are saved to the `uploads/` directory:
- **Selfie Images**: `selfie_[Name]_[timestamp].jpg` - JPEG images of captured selfies
- **Records**: `record_[Name]_[timestamp].json` - JSON files containing:
  - Name and phone number
  - Timestamp
  - Selfie filename
  - Waiver version (update when waiver text changes)
  - IP address

**Important:** The `uploads/` directory is excluded from git via `.gitignore` for privacy.

## Configuration

To change the port, set the `PORT` environment variable:

```bash
PORT=8080 npm start
```

## Legal Compliance

### Florida Statutory Requirements

1. **Section 6.2 Notice**: The notice to minor child's natural guardian (Section 6.2) is formatted 5 points larger than the base text as required by FLA. STAT. § 744.301.

2. **Electronic Signature**: Selfie capture constitutes a valid electronic signature per Florida Electronic Signature Act of 1996.

3. **Waiver Version Tracking**: Each submission records the waiver version. **IMPORTANT:** Update `waiverVersion` in `server.js` (line ~95) whenever the waiver text changes to maintain proper audit trail.

### Door Staff Instructions

- Verify that the selfie matches the face of the person entering
- A bad photo = no valid signature = no entry
- Check the timestamp and waiver version in the record file if needed

## Security Notes

- The `uploads/` directory contains sensitive personal data (selfies, names, phone numbers)
- Ensure proper file permissions and access controls
- Consider implementing authentication for accessing stored files
- Regular backups recommended for legal compliance

## Next Steps

You can extend this application by:
- Adding database storage for better querying and organization
- Implementing admin dashboard to view check-ins and selfies
- Adding email/SMS confirmations
- Setting up automated backups
- Adding authentication for admin access
