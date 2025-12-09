const tabs = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');
const createForm = document.getElementById('create-form');
const verifyForm = document.getElementById('verify-form');
const statusEl = document.getElementById('status');
const createResultEl = document.getElementById('create-result');
const verifyResultEl = document.getElementById('verify-result');

// --- Tab Navigation ---
tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const target = tab.getAttribute('data-tab');
        tabContents.forEach(content => {
            content.classList.remove('active');
            if (content.id === target) {
                content.classList.add('active');
            }
        });
    });
});

// --- Form Submissions ---
createForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const sofi = document.getElementById('sofi').value;
    if (!sofi) {
        updateStatus('SOFI/ID is required.', 'error');
        return;
    }
    updateStatus('Generating signature...');
    parent.postMessage({ pluginMessage: { type: 'create-signature', sofi } }, '*');
});

verifyForm.addEventListener('submit', (e) => {
    e.preventDefault();
    updateStatus('Verifying signature...');
    parent.postMessage({ pluginMessage: { type: 'verify-signature' } }, '*');
});

// --- Communication with Penpot (code.js) ---
window.onmessage = (event) => {
    const msg = event.data.pluginMessage;
    if (!msg) return;

    console.log('Message from code.js:', msg);

    switch (msg.type) {
        case 'status-update':
            updateStatus(msg.message, msg.statusType);
            break;
        case 'creation-success':
            showCreationResult(msg.svg);
            updateStatus('Signature created successfully!', 'success');
            break;
        case 'verification-result':
            showVerificationResult(msg.result);
            const status = msg.result.isAuthentic ? 'success' : 'error';
            updateStatus(`Verification ${status === 'success' ? 'succeeded' : 'failed'}.`, status);
            break;
        case 'error':
            updateStatus(msg.message, 'error');
            break;
    }
};

// --- UI Helper Functions ---
function updateStatus(message, type = 'info') {
    statusEl.textContent = message;
    statusEl.style.color = type === 'error' ? '#e53e3e' : type === 'success' ? '#38a169' : 'var(--muted-foreground)';
}

function showCreationResult(svg) {
    const svgContainer = document.getElementById('visual-signature-svg');
    svgContainer.innerHTML = svg;
    createResultEl.style.display = 'block';
    verifyResultEl.style.display = 'none';
}

function showVerificationResult(result) {
    verifyResultEl.innerHTML = `
        <h2>Verification ${result.isAuthentic ? 'Successful' : 'Failed'}</h2>
        <p>${result.verificationDetails}</p>
    `;
    verifyResultEl.className = `result-area ${result.isAuthentic ? 'success' : 'error'}`;
    verifyResultEl.style.display = 'block';
    createResultEl.style.display = 'none';
}

// Initial status message
updateStatus('Select a shape to begin.');
parent.postMessage({ pluginMessage: { type: 'ui-ready' } }, '*');
