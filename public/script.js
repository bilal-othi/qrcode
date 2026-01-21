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

// Start camera when capture button is clicked
captureBtn.addEventListener('click', async () => {
    try {
        // Request camera access
        stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                facingMode: 'user', // Use front-facing camera
                width: { ideal: 640 },
                height: { ideal: 480 }
            } 
        });
        
        // Display video stream
        video.srcObject = stream;
        video.style.display = 'block';
        captureBtn.textContent = 'Capture Photo';
        
        // Change button action to capture
        captureBtn.onclick = captureSelfie;
    } catch (err) {
        console.error('Error accessing camera:', err);
        const messageDiv = document.getElementById('message');
        messageDiv.className = 'message error';
        messageDiv.textContent = 'Unable to access camera. Please ensure camera permissions are granted and try again.';
        messageDiv.style.display = 'block';
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
        try {
            stream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    facingMode: 'user',
                    width: { ideal: 640 },
                    height: { ideal: 480 }
                } 
            });
            video.srcObject = stream;
            video.style.display = 'block';
            captureBtn.textContent = 'Capture Photo';
            captureBtn.onclick = captureSelfie;
        } catch (err) {
            console.error('Error accessing camera:', err);
            const messageDiv = document.getElementById('message');
            messageDiv.className = 'message error';
            messageDiv.textContent = 'Unable to access camera. Please ensure camera permissions are granted.';
            messageDiv.style.display = 'block';
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
                try {
                    stream = await navigator.mediaDevices.getUserMedia({ 
                        video: { facingMode: 'user' } 
                    });
                    video.srcObject = stream;
                    video.style.display = 'block';
                    captureBtn.textContent = 'Capture Photo';
                    captureBtn.onclick = captureSelfie;
                } catch (err) {
                    console.error('Error accessing camera:', err);
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
