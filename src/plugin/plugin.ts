/// <reference types="plugin-types" />

const IFRAME_URL = '/penpot-plugin/ui.html';

// The command to be executed when the user right-clicks on an element and selects "PentaSign -> Sign document".
penpot.ui.registerCommand('pentasign.sign', {
  label: 'PentaSign Tools',
  async onexecute() {
    penpot.ui.open('PentaSign', IFRAME_URL, {
      width: 450,
      height: 600,
    });
  },
});

// Communication with the iframe
penpot.ui.on('message', (message) => {
  if (message.type === 'get-selection') {
    const selection = penpot.selection.get();
    
    // We need to convert the Uint8Array image data to something sendable, like Base64
    // This is a placeholder for a proper implementation
    const serializableSelection = JSON.parse(JSON.stringify(selection));

    penpot.ui.sendMessage({
      type: 'selection-change',
      data: serializableSelection,
    });
  }
});

// Listen for selection changes in Penpot and notify the iframe
penpot.selection.on('change', (selection) => {
    const serializableSelection = JSON.parse(JSON.stringify(selection));
    penpot.ui.sendMessage({
        type: 'selection-change',
        data: serializableSelection
    });
});
