document.addEventListener('DOMContentLoaded', () => {
  const tabs = document.querySelectorAll('.tab-button');
  const tabContents = document.querySelectorAll('.tab-content');
  const statusArea = document.getElementById('status-area');
  const renderBtn = document.getElementById('render-selection-btn');
  const renderPreviewArea = document.getElementById('render-preview-area');
  const renderHtmlArea = document.getElementById('render-html-area');
  const renderTabs = document.querySelectorAll('.render-tab-button');
  const renderTabContents = document.querySelectorAll('.render-tab-content');

  // Main tabs
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const target = tab.getAttribute('data-tab');
      tabContents.forEach(content => {
        content.id === target
          ? content.classList.add('active')
          : content.classList.remove('active');
      });
    });
  });

  // Render tabs
  renderTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      renderTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const target = tab.getAttribute('data-render-tab');
      renderTabContents.forEach(content => {
        content.id === target
          ? content.classList.add('active')
          : content.classList.remove('active');
      });
    });
  });

  function showStatus(message, type = 'info') {
    if (!statusArea) return;
    statusArea.textContent = message;
    statusArea.className = type; // 'success' or 'error'
  }

  // Listen for messages from Penpot
  window.addEventListener('message', event => {
    const message = event.data;
    if (message && message.type === 'selection-change') {
      handleSelectionChange(message.data);
    }
  });

  if (renderBtn) {
    renderBtn.addEventListener('click', () => {
      // Ask Penpot for the current selection
      parent.postMessage({ type: 'get-selection' }, '*');
    });
  }

  function handleSelectionChange(shapes) {
    if (!renderPreviewArea || !renderHtmlArea) return;
    
    if (!shapes || shapes.length === 0) {
      renderPreviewArea.innerHTML = '<p>No shapes selected in Penpot.</p>';
      renderHtmlArea.textContent = '';
      return;
    }
    
    // Clear previous render
    renderPreviewArea.innerHTML = '';

    const container = document.createElement('div');
    container.style.position = 'relative';
    container.style.width = '100%';
    container.style.height = '100%';

    let renderedHtml = '';

    shapes.forEach(shape => {
      const { element, html } = renderShape(shape);
      container.appendChild(element);
      renderedHtml += html + '\n';
    });

    renderPreviewArea.appendChild(container);
    renderHtmlArea.textContent = renderedHtml;
  }
  
  function renderShape(shape) {
      const el = document.createElement('div');
      
      const styles = {
        position: 'absolute',
        left: `${shape.x}px`,
        top: `${shape.y}px`,
        width: `${shape.width}px`,
        height: `${shape.height}px`,
        opacity: shape.opacity,
        transform: `rotate(${shape.rotation || 0}deg)`,
        'border-radius': `${shape.borderRadius || 0}px`,
        ...(shape.blocked && { 'pointer-events': 'none' }),
      };

      // Fills (background)
      if (shape.fills && shape.fills.length > 0) {
          const fill = shape.fills[0]; // Simple case: use the first fill
          if (fill.type === 'color') {
              styles['background-color'] = `rgba(${fill.color.r}, ${fill.color.g}, ${fill.color.b}, ${fill.color.a})`;
          }
      }

      // Strokes (border)
      if (shape.strokes && shape.strokes.length > 0) {
          const stroke = shape.strokes[0];
          styles.border = `${stroke.width}px ${stroke.position} rgba(${stroke.color.r}, ${stroke.color.g}, ${stroke.color.b}, ${stroke.color.a})`;
      }

      // Shadows
      if (shape.shadows && shape.shadows.length > 0) {
          const shadowCss = shape.shadows.map(s => 
              `${s.x}px ${s.y}px ${s.blur}px rgba(${s.color.r}, ${s.color.g}, ${s.color.b}, ${s.color.a})`
          ).join(', ');
          styles['box-shadow'] = shadowCss;
      }
      
      let styleString = '';
      for (const [key, value] of Object.entries(styles)) {
          if (value !== undefined && value !== null) {
              el.style[key] = value;
              styleString += `${key}: ${value}; `;
          }
      }

      let innerHtml = '';
      if (shape.children && shape.children.length > 0) {
          shape.children.forEach(child => {
              const { element: childElement, html: childHtml } = renderShape(child);
              el.appendChild(childElement);
              innerHtml += '\n  ' + childHtml.replace(/\n/g, '\n  ');
          });
      }

      const outerHtml = `<div style="${styleString.trim()}">${innerHtml}\n</div>`;

      return { element: el, html: outerHtml };
  }

});
