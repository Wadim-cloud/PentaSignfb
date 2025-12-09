// This script runs in the plugin's UI (iframe).
// It has access to the DOM, but not the Penpot API directly.

const penpotConnection = window.parent; // Connection to the main penpot context

function openTab(evt, tabName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tab-content");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tab-button");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
}

function showStatus(message, type = 'info') {
    const statusEl = document.getElementById('status-message');
    statusEl.textContent = message;
    statusEl.className = `alert ${type}`;
    statusEl.style.display = 'block';
    setTimeout(() => {
        statusEl.style.display = 'none';
    }, 3000);
}

// Handle form submissions
document.getElementById('create-form').addEventListener('submit', function(e) {
    e.preventDefault();
    showStatus('Requesting to sign selected object...', 'info');
    penpotConnection.postMessage({
        type: 'sign-document',
        payload: {
            sofi: document.getElementById('sofi').value,
        }
    }, '*');
});

document.getElementById('verify-form').addEventListener('submit', function(e) {
    e.preventDefault();
    showStatus('Requesting to verify selected object...', 'info');
    penpotConnection.postMessage({
        type: 'verify-document',
        payload: {
            bundle: document.getElementById('bundle-input').value,
        }
    }, '*');
});


// Listen for messages from the main plugin script (code.js)
window.addEventListener('message', event => {
    const message = event.data;
    if(message.source && message.source.startsWith('react-devtools')) return;
    
    console.log('Message from main context:', message);

    if (message.type === 'error') {
        showStatus(message.message, 'error');
    }

    if (message.type === 'sign-success') {
        showStatus(message.message, 'success');
        // In a real app, you would receive the bundle and display it.
        document.getElementById('create-output').style.display = 'block';
        document.getElementById('bundle-output').value = "{\n  \"message\": \"This is a simulated signature bundle.\"\n}";
        document.getElementById('svg-output').innerHTML = `<p>Simulated SVG</p>`;
    }
});
