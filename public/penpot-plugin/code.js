// This script runs in Penpot's main context.
// It has access to the Penpot API.

penpot.ui.open({
    title: 'PentaSign',
    url: 'ui.html',
    width: 400,
    height: 600,
});

penpot.ui.on('message', (message) => {
    console.log('Message from UI:', message);

    if (message.type === 'sign-document') {
        const selection = penpot.selection.get();
        if (selection.length === 0) {
            penpot.ui.postMessage({ type: 'error', message: 'Please select an object to sign.' });
            return;
        }

        // For now, let's just log the selection.
        // In a real scenario, we would process this data.
        console.log('Signing selection:', selection);
        
        penpot.ui.postMessage({ type: 'sign-success', message: 'Object sent for signing (simulated).' });
    }
});
