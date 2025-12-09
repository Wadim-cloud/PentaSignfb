/// <reference types="plugin-types" />

const IFRAME_URL = '/penpot-plugin/ui.html';

// The command to be executed when the user right-clicks on an element and selects "PentaSign -> Sign document".
penpot.ui.registerCommand('pentasign.sign', {
  label: 'Sign document',
  async onexecute() {
    penpot.ui.open('PentaSign', IFRAME_URL, {
      width: 800,
      height: 700,
    });
  },
});

// Communication with the iframe
penpot.ui.on('message', (message) => {
  console.log('Message from iframe:', message);

  // Example of responding to the iframe
  if (message.type === 'get-selection') {
    const selection = penpot.selection.get();
    penpot.ui.sendMessage({
      type: 'selection-change',
      data: selection,
    });
  }
});

// Listen for selection changes in Penpot and notify the iframe
penpot.selection.on('change', (selection) => {
    penpot.ui.sendMessage({
        type: 'selection-change',
        data: selection
    });
});
