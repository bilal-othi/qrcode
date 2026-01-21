const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const QRCode = require('qrcode');
const fs = require('fs').promises;

const app = express();
const PORT = process.env.PORT || 3000;

// Increase body parser limit for base64 images (10MB)
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static('public'));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
fs.mkdir(uploadsDir, { recursive: true })
    .then(() => console.log('Uploads directory ready'))
    .catch(err => console.error('Error creating uploads directory:', err));

// Serve the main check-in page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Generate QR code
app.get('/qr', async (req, res) => {
    try {
        const url = `${req.protocol}://${req.get('host')}`;
        const qrCodeDataURL = await QRCode.toDataURL(url);
        res.send(`
            <html>
                <head>
                    <title>QR Code</title>
                    <style>
                        body {
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            height: 100vh;
                            margin: 0;
                            font-family: Arial, sans-serif;
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        }
                        .qr-container {
                            text-align: center;
                            background: white;
                            padding: 40px;
                            border-radius: 20px;
                            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                        }
                        img {
                            border: 2px solid #333;
                            padding: 20px;
                            background: white;
                            margin: 20px 0;
                        }
                        h1 {
                            color: #333;
                            margin-bottom: 10px;
                        }
                        p {
                            color: #666;
                            margin-top: 20px;
                        }
                    </style>
                </head>
                <body>
                    <div class="qr-container">
                        <h1>Scan this QR Code</h1>
                        <img src="${qrCodeDataURL}" alt="QR Code">
                        <p>Scan with your phone to check in</p>
                    </div>
                </body>
            </html>
        `);
    } catch (err) {
        console.error('Error generating QR code:', err);
        res.status(500).send('Error generating QR code');
    }
});

// Handle form submission
app.post('/submit', async (req, res) => {
    const { checked, name, phone, selfie } = req.body;
    
    // Validate all required fields
    if (!checked || !name || !phone || !selfie) {
        return res.status(400).json({ 
            success: false, 
            message: 'Please fill in all fields, check the box, and take a selfie' 
        });
    }
    
    // Validate selfie format (should be base64 data URL)
    if (!selfie.startsWith('data:image/')) {
        return res.status(400).json({ 
            success: false, 
            message: 'Invalid selfie format. Please take a new selfie.' 
        });
    }
    
    try {
        // Generate unique filename with timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const sanitizedName = name.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 50);
        const filename = `selfie_${sanitizedName}_${timestamp}.jpg`;
        const filepath = path.join(uploadsDir, filename);
        
        // Convert base64 to buffer and save image file
        const base64Data = selfie.replace(/^data:image\/jpeg;base64,/, '');
        await fs.writeFile(filepath, base64Data, 'base64');
        
        // Create record linking selfie to waiver version
        // IMPORTANT: Update waiverVersion when waiver text changes
        const record = {
            name: name,
            phone: phone,
            timestamp: new Date().toISOString(),
            selfieFile: filename,
            waiverVersion: '1.0', // Update this when waiver text changes
            checked: checked,
            ipAddress: req.ip || req.connection.remoteAddress
        };
        
        // Save record as JSON file
        const recordFilename = `record_${sanitizedName}_${timestamp}.json`;
        const recordFilepath = path.join(uploadsDir, recordFilename);
        await fs.writeFile(recordFilepath, JSON.stringify(record, null, 2), 'utf8');
        
        console.log('Check-in received and saved:', {
            name: record.name,
            phone: record.phone,
            timestamp: record.timestamp,
            selfieFile: record.selfieFile,
            recordFile: recordFilename
        });
        
        // Send confirmation back
        res.json({
            success: true,
            message: `Thank you ${name}! Your check-in has been confirmed. Your electronic signature has been recorded.`,
            phone: phone
        });
    } catch (error) {
        console.error('Error saving check-in:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing your check-in. Please try again.'
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`QR Code available at http://localhost:${PORT}/qr`);
    console.log(`Selfies and records will be saved to: ${uploadsDir}`);
});
