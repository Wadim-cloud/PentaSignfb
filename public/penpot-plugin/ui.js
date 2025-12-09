const tabs = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');
const renderSelectionButton = document.getElementById('render-selection');
const htmlOutput = document.getElementById('html-output');
const previewContainer = document.getElementById('preview-container');


tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const target = tab.getAttribute('data-tab');

    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    tabContents.forEach(content => {
      content.classList.remove('active');
      if (content.id === target) {
        content.classList.add('active');
      }
    });
  });
});

// Request selection from Penpot when the render tab is clicked or button is clicked
renderSelectionButton.addEventListener('click', () => {
  parent.postMessage({ pluginMessage: { type: 'get-selection' } }, '*');
});


// Listen for messages from the plugin's main code (code.js)
window.addEventListener('message', event => {
  const message = event.data.pluginMessage;
  if (message.type === 'selection-change') {
    if (message.data.length > 0) {
      const rendered = renderShapes(message.data);
      htmlOutput.textContent = rendered.html;
      previewContainer.innerHTML = rendered.html;

    } else {
      htmlOutput.textContent = 'No shapes selected.';
      previewContainer.innerHTML = '<p>No shapes selected.</p>';
    }
  }
});


function renderShapes(shapes) {
    let html = '';
    for (const shape of shapes) {
        html += renderShape(shape);
    }
    return { html };
}

function renderShape(shape) {
    if (!shape.visible) {
        return '';
    }

    const styles = {
        position: 'absolute',
        left: `${shape.x}px`,
        top: `${shape.y}px`,
        width: `${shape.width}px`,
        height: `${shape.height}px`,
        opacity: shape.opacity,
        transform: `rotate(${shape.rotation}deg)`,
        'border-radius': `${shape.borderRadius}px`,
        'mix-blend-mode': shape.blendMode,
    };

    if (shape.fills && shape.fills.length > 0) {
        const fill = shape.fills[0]; // Assuming one fill for simplicity
        if (fill.type === 'solid') {
             styles['background-color'] = `rgba(${fill.color.r * 255}, ${fill.color.g * 255}, ${fill.color.b * 255}, ${fill.color.a})`;
        }
    }
    
    if (shape.strokes && shape.strokes.length > 0) {
        const stroke = shape.strokes[0]; // Assuming one stroke
         styles.border = `${stroke.strokeWidth}px ${stroke.strokeStyle} rgba(${stroke.color.r * 255}, ${stroke.color.g * 255}, ${stroke.color.b * 255}, ${stroke.color.a})`;
    }
    
    if (shape.shadows && shape.shadows.length > 0) {
        const shadow = shape.shadows[0]; // Assuming one shadow
        styles['box-shadow'] = `${shadow.shadowOffsetX}px ${shadow.shadowOffsetY}px ${shadow.shadowBlur}px rgba(${shadow.color.r * 255}, ${shadow.color.g * 255}, ${shadow.color.b * 255}, ${shadow.color.a})`;
    }


    const styleString = Object.entries(styles)
        .map(([key, value]) => `${key}: ${value};`)
        .join(' ');
        
    let childrenHtml = '';
    if (shape.children && shape.children.length > 0) {
        childrenHtml = renderShapes(shape.children).html;
    }

    return `<div id="${shape.id}" style="${styleString}">${childrenHtml}</div>`;
}
