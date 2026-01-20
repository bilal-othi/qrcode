# QR Code Check-In Application

A simple web application that allows users to scan a QR code and complete a check-in form from their phone.

## Features

1. **QR Code Generation** - Generate a QR code that links to the check-in page
2. **Mobile-Friendly Form** - Responsive design optimized for phone screens
3. **Form Validation** - Requires checkbox, name, and phone number
4. **Confirmation** - Sends confirmation message back to the user after submission

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
2. You'll be taken to the check-in form
3. Check the box
4. Enter your name
5. Enter your phone number
6. Click Submit
7. You'll receive a confirmation message

## Project Structure

```
qrcode/
├── server.js          # Express server with routes
├── package.json       # Dependencies
├── README.md          # This file
└── public/
    ├── index.html     # Check-in form page
    ├── style.css      # Styling
    └── script.js      # Form handling JavaScript
```

## API Endpoints

- `GET /` - Serves the check-in form
- `GET /qr` - Displays the QR code
- `POST /submit` - Handles form submission and returns confirmation

## Configuration

To change the port, set the `PORT` environment variable:

```bash
PORT=8080 npm start
```

## Next Steps

You can extend this application by:
- Adding database storage for check-ins
- Sending SMS/email confirmations
- Adding authentication
- Creating an admin dashboard to view check-ins
