let stream = null;
let selfieCaptured = false;

// Get DOM elements
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const captureBtn = document.getElementById('capture-btn');
const retakeBtn = document.getElementById('retake-btn');
const selfiePreview = document.getElementById('selfie-preview');
const selfieImage = document.getElementById('selfie-image');
const selfieDataInput = document.getElementById('selfie-data');
const httpsWarning = document.getElementById('https-warning');

// Check HTTPS requirement on page load
// Note: localhost and 127.0.0.1 work with HTTP, but IP addresses (192.168.x.x) require HTTPS
const isLocalhost = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
const needsHttps = location.protocol !== 'https:' && !isLocalhost;

if (needsHttps && httpsWarning) {
    httpsWarning.innerHTML = `
        <p><strong>⚠️ HTTPS Required for Camera:</strong> You're accessing this page via <strong>${location.hostname}</strong> which requires HTTPS for camera access.</p>
        <p><strong>Solutions:</strong></p>
        <ul style="margin: 8px 0; padding-left: 20px;">
            <li>Use <strong>localhost</strong> or <strong>127.0.0.1</strong> (works with HTTP)</li>
            <li>Set up HTTPS (see README for instructions)</li>
            <li>Use a tunnel service like ngrok for testing</li>
        </ul>
    `;
    httpsWarning.style.display = 'block';
}

// Helper function to get user-friendly error message
function getCameraErrorMessage(error) {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        return 'Camera access is not supported in this browser. Please use a modern browser like Chrome, Safari, or Firefox.';
    }
    
    // Check if HTTPS is required (localhost is exempt)
    const isLocalhost = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
    if (location.protocol !== 'https:' && !isLocalhost) {
        return `Camera access requires HTTPS when accessing via ${location.hostname}. Use localhost or set up HTTPS. See README for instructions.`;
    }
    
    if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        return 'Camera permission denied. Please allow camera access in your browser settings and try again.';
    } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        return 'No camera found. Please ensure your device has a camera and try again.';
    } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        return 'Camera is already in use by another application. Please close other apps using the camera and try again.';
    } else if (error.name === 'OverconstrainedError' || error.name === 'ConstraintNotSatisfiedError') {
        return 'Camera settings not supported. Trying with simpler settings...';
    } else if (error.name === 'NotSupportedError') {
        return 'Camera access is not supported on this device or browser.';
    } else {
        return `Camera error: ${error.message || 'Unknown error'}. Please try again or contact support.`;
    }
}

// Function to request camera with fallback constraints
async function requestCamera() {
    // Check if mediaDevices is available
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('MediaDevices not available');
    }
    
    // Try with ideal constraints first
    const constraints = [
        {
            video: { 
                facingMode: 'user',
                width: { ideal: 640 },
                height: { ideal: 480 }
            }
        },
        // Fallback: simpler constraints for mobile
        {
            video: { 
                facingMode: 'user'
            }
        },
        // Fallback: any camera
        {
            video: true
        }
    ];
    
    let lastError = null;
    
    for (const constraint of constraints) {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia(constraint);
            return mediaStream;
        } catch (err) {
            lastError = err;
            // If it's not a constraint error, stop trying
            if (err.name !== 'OverconstrainedError' && err.name !== 'ConstraintNotSatisfiedError') {
                throw err;
            }
        }
    }
    
    throw lastError || new Error('Failed to access camera');
}

// Start camera when capture button is clicked
captureBtn.addEventListener('click', async () => {
    const messageDiv = document.getElementById('message');
    
    // Show loading state
    captureBtn.disabled = true;
    captureBtn.textContent = 'Accessing Camera...';
    messageDiv.style.display = 'none';
    
    try {
        // Request camera access with fallback
        stream = await requestCamera();
        
        // Display video stream
        video.srcObject = stream;
        video.style.display = 'block';
        captureBtn.textContent = 'Capture Photo';
        captureBtn.disabled = false;
        
        // Wait for video to be ready
        video.onloadedmetadata = () => {
            video.play().catch(err => console.error('Error playing video:', err));
        };
        
        // Change button action to capture
        captureBtn.onclick = captureSelfie;
    } catch (err) {
        console.error('Error accessing camera:', err);
        messageDiv.className = 'message error';
        messageDiv.textContent = getCameraErrorMessage(err);
        messageDiv.style.display = 'block';
        captureBtn.disabled = false;
        captureBtn.textContent = 'Take Selfie';
        captureBtn.onclick = null; // Reset onclick
    }
});

// Capture selfie from video stream
function captureSelfie() {
    try {
        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Draw current video frame to canvas
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Stop video stream
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            stream = null;
        }
        
        // Convert canvas to base64 JPEG (80% quality for reasonable file size)
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        
        // Store in hidden input
        selfieDataInput.value = imageData;
        selfieImage.src = imageData;
        
        // Show preview and hide video
        video.style.display = 'none';
        selfiePreview.style.display = 'block';
        captureBtn.style.display = 'none';
        selfieCaptured = true;
    } catch (err) {
        console.error('Error capturing selfie:', err);
        const messageDiv = document.getElementById('message');
        messageDiv.className = 'message error';
        messageDiv.textContent = 'Error capturing photo. Please try again.';
        messageDiv.style.display = 'block';
    }
}

// Retake selfie
retakeBtn.addEventListener('click', () => {
    // Reset UI
    selfiePreview.style.display = 'none';
    selfieImage.src = '';
    selfieDataInput.value = '';
    captureBtn.style.display = 'block';
    captureBtn.textContent = 'Take Selfie';
    selfieCaptured = false;
    
    // Restore original button functionality
    captureBtn.onclick = async () => {
        const messageDiv = document.getElementById('message');
        captureBtn.disabled = true;
        captureBtn.textContent = 'Accessing Camera...';
        messageDiv.style.display = 'none';
        
        try {
            stream = await requestCamera();
            video.srcObject = stream;
            video.style.display = 'block';
            captureBtn.textContent = 'Capture Photo';
            captureBtn.disabled = false;
            
            video.onloadedmetadata = () => {
                video.play().catch(err => console.error('Error playing video:', err));
            };
            
            captureBtn.onclick = captureSelfie;
        } catch (err) {
            console.error('Error accessing camera:', err);
            messageDiv.className = 'message error';
            messageDiv.textContent = getCameraErrorMessage(err);
            messageDiv.style.display = 'block';
            captureBtn.disabled = false;
            captureBtn.textContent = 'Take Selfie';
        }
    };
});

// Form submission
document.getElementById('checkinForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitBtn = document.getElementById('submitBtn');
    const messageDiv = document.getElementById('message');
    const form = e.target;
    
    // Validate selfie is captured
    if (!selfieCaptured || !selfieDataInput.value) {
        messageDiv.className = 'message error';
        messageDiv.textContent = 'Please take a selfie to complete your electronic signature.';
        messageDiv.style.display = 'block';
        // Scroll to selfie section
        document.querySelector('.selfie-container').scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
    }
    
    // Validate checkbox
    if (!document.getElementById('checked').checked) {
        messageDiv.className = 'message error';
        messageDiv.textContent = 'Please check the box to agree to the waiver terms.';
        messageDiv.style.display = 'block';
        return;
    }
    
    // Prepare form data
    const formData = {
        checked: document.getElementById('checked').checked,
        name: document.getElementById('name').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        selfie: selfieDataInput.value
    };
    
    // Validate required fields
    if (!formData.name || !formData.phone) {
        messageDiv.className = 'message error';
        messageDiv.textContent = 'Please fill in all required fields.';
        messageDiv.style.display = 'block';
        return;
    }
    
    // Disable submit button
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';
    messageDiv.style.display = 'none';
    
    try {
        const response = await fetch('/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            messageDiv.className = 'message success';
            messageDiv.textContent = data.message;
            
            // Reset form
            form.reset();
            
            // Reset selfie
            selfiePreview.style.display = 'none';
            selfieImage.src = '';
            selfieDataInput.value = '';
            captureBtn.style.display = 'block';
            captureBtn.textContent = 'Take Selfie';
            captureBtn.onclick = async () => {
                const messageDiv = document.getElementById('message');
                captureBtn.disabled = true;
                captureBtn.textContent = 'Accessing Camera...';
                messageDiv.style.display = 'none';
                
                try {
                    stream = await requestCamera();
                    video.srcObject = stream;
                    video.style.display = 'block';
                    captureBtn.textContent = 'Capture Photo';
                    captureBtn.disabled = false;
                    
                    video.onloadedmetadata = () => {
                        video.play().catch(err => console.error('Error playing video:', err));
                    };
                    
                    captureBtn.onclick = captureSelfie;
                } catch (err) {
                    console.error('Error accessing camera:', err);
                    messageDiv.className = 'message error';
                    messageDiv.textContent = getCameraErrorMessage(err);
                    messageDiv.style.display = 'block';
                    captureBtn.disabled = false;
                    captureBtn.textContent = 'Take Selfie';
                }
            };
            selfieCaptured = false;
            
            // Stop any active video stream
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
                stream = null;
            }
        } else {
            messageDiv.className = 'message error';
            messageDiv.textContent = data.message || 'An error occurred. Please try again.';
        }
    } catch (error) {
        console.error('Error submitting form:', error);
        messageDiv.className = 'message error';
        messageDiv.textContent = 'Network error. Please check your connection and try again.';
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit';
    }
});
