document.addEventListener('DOMContentLoaded', () => {
  const createTab = document.getElementById('tab-create');
  const verifyTab = document.getElementById('tab-verify');
  const createContent = document.getElementById('content-create');
  const verifyContent = document.getElementById('content-verify');

  const createForm = document.getElementById('form-create');
  const verifyForm = document.getElementById('form-verify');
  
  const statusContainer = document.getElementById('status-container');
  const bundleOutput = document.getElementById('bundle-output');
  const svgOutput = document.getElementById('svg-output');
  const verificationResultContainer = document.getElementById('verification-result');

  // --- Tab Logic ---
  createTab.addEventListener('click', () => {
    createTab.classList.add('active');
    verifyTab.classList.remove('active');
    createContent.style.display = 'block';
    verifyContent.style.display = 'none';
  });

  verifyTab.addEventListener('click', () => {
    verifyTab.classList.add('active');
    createTab.classList.remove('active');
    verifyContent.style.display = 'block';
    createContent.style.display = 'none';
  });
  
  // --- Communication with Penpot Plugin ---
  function sendMessageToPlugin(message) {
    parent.postMessage({ pluginMessage: message }, '*');
  }

  window.addEventListener('message', (event) => {
    const message = event.data.pluginMessage;
    if (!message) return;
    
    console.log('Message from Penpot:', message);

    if (message.type === 'selection-change') {
      // Handle selection change from Penpot
      // For example, update the UI with the number of selected items
      const selectionCount = message.data.length;
      updateStatus(`Selected items: ${selectionCount}`, 'info');
    }
  });


  // --- Form Handling & UI Updates ---
  function updateStatus(message, type = 'info') {
    statusContainer.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
  }
  
  function showVerificationResult(isAuthentic, details) {
      verificationResultContainer.innerHTML = `
        <div class="alert ${isAuthentic ? 'alert-success' : 'alert-error'}">
          <strong>${isAuthentic ? 'Success' : 'Failure'}:</strong> ${details}
        </div>
      `;
  }

  // Example: Request current selection when the UI loads
  sendMessageToPlugin({ type: 'get-selection' });


  // --- Placeholder Logic ---
  // Replace this with actual calls to your crypto and verification functions
  createForm.addEventListener('submit', (e) => {
    e.preventDefault();
    updateStatus('Generating signature (simulation)...', 'info');
    
    const formData = new FormData(createForm);
    const sofi = formData.get('sofi');

    // Simulate async operation
    setTimeout(() => {
        const fakeBundle = {
            docHash: 'a1b2c3d4...',
            sofi: sofi,
            publicKey: 'abc...xyz',
            signature: '123...789',
            maskNonce: 12345
        };
        bundleOutput.value = JSON.stringify(fakeBundle, null, 2);
        
        svgOutput.innerHTML = `<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" fill="#f0f0f0"/><circle cx="50" cy="50" r="40" stroke="#333" stroke-width="2"/><text x="50" y="55" font-family="Arial" font-size="12" text-anchor="middle">SVG</text></svg>`;

        updateStatus('Signature generated successfully (simulation).', 'success');
    }, 1000);
  });
  
  verifyForm.addEventListener('submit', (e) => {
     e.preventDefault();
     updateStatus('Verifying signature (simulation)...', 'info');
     
     setTimeout(() => {
        showVerificationResult(true, "The signature is authentic and the document has not been tampered with (simulation).")
     }, 1000);
  });

});
