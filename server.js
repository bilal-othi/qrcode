const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const QRCode = require('qrcode');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

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
app.post('/submit', (req, res) => {
    const { checked, name, phone } = req.body;
    
    if (!checked || !name || !phone) {
        return res.status(400).json({ 
            success: false, 
            message: 'Please fill in all fields and check the box' 
        });
    }
    
    // Here you would typically save to database
    console.log('Check-in received:', { checked, name, phone, timestamp: new Date().toISOString() });
    
    // Send confirmation back
    res.json({
        success: true,
        message: `Thank you ${name}! Your check-in has been confirmed.`,
        phone: phone
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`QR Code available at http://localhost:${PORT}/qr`);
});
