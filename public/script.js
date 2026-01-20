document.getElementById('checkinForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitBtn = document.getElementById('submitBtn');
    const messageDiv = document.getElementById('message');
    const form = e.target;
    
    const formData = {
        checked: document.getElementById('checked').checked,
        name: document.getElementById('name').value.trim(),
        phone: document.getElementById('phone').value.trim()
    };
    
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
            form.reset();
        } else {
            messageDiv.className = 'message error';
            messageDiv.textContent = data.message || 'An error occurred';
        }
    } catch (error) {
        console.error('Error submitting form:', error);
        messageDiv.className = 'message error';
        messageDiv.textContent = 'Network error. Please try again.';
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit';
    }
});
