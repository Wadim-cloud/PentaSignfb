
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Wand2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Declare penpot and its types as globally available in the plugin environment
declare const penpot: import('@penpot/plugin-types').Penpot;
type Shape = import('@penpot/plugin-types').Shape;

type RenderedShape = {
  html: string;
  css: string;
};

export default function HomePage() {
  const [renderedShapes, setRenderedShapes] = useState<RenderedShape[]>([]);
  const [selectedShapeCount, setSelectedShapeCount] = useState(0);

  // Access browser/penpot globals only after component mounts
  const isShape = (obj: any): obj is Shape => (window as any).penpot?.isShape(obj);
  const isText = (obj: any): obj is Shape => (window as any).penpot?.isText(obj);


  const renderShapeToHtml = (shape: Shape, level = 0): RenderedShape => {
    let styles: Record<string, string | number> = {
      position: 'absolute',
      left: `${shape.x}px`,
      top: `${shape.y}px`,
      width: `${shape.width}px`,
      height: `${shape.height}px`,
      opacity: shape.opacity,
      transform: `rotate(${shape.rotation}deg)`,
      'border-radius': `${shape.borderRadius}px`,
    };

    if (shape.fills && shape.fills.length > 0) {
      const fill = shape.fills[0]; // Using the first fill
      if (fill.type === 'solid') {
        styles['background-color'] = `rgba(${fill.color.r}, ${fill.color.g}, ${fill.color.b}, ${fill.color.a})`;
      }
    }

    if (shape.strokes && shape.strokes.length > 0) {
      const stroke = shape.strokes[0];
      styles['border'] = `${stroke.strokeWidth}px ${stroke.strokeStyle} rgba(${stroke.color.r}, ${stroke.color.g}, ${stroke.color.b}, ${stroke.color.a})`;
    }
    
    if (isText(shape)) {
        styles['color'] = styles['background-color'] || 'black';
        styles['background-color'] = 'transparent';
        styles['font-size'] = `${shape.fontSize}px`;
        styles['font-family'] = `"${shape.fontFamily}"`;
        styles['text-align'] = shape.textAlignHorizontal.toLowerCase();
    }


    const styleString = Object.entries(styles)
      .map(([key, value]) => `${key}: ${value};`)
      .join(' ');
      
    let childrenHtml = '';
    if ('children' in shape && shape.children) {
      childrenHtml = shape.children
        .map(child => renderShapeToHtml(child as Shape, level + 1).html)
        .join('');
    }
    
    const content = isText(shape) ? shape.content : childrenHtml;

    const html = `<div style="${styleString}">${content}</div>`;
    const css = `/* No separate CSS for inline styles */`;


    return { html, css };
  };

  const handleRenderSelection = () => {
    if (typeof penpot !== 'undefined') {
      penpot.selection.get().then(selection => {
        const shapes = selection.filter(isShape);
        const rendered = shapes.map(shape => renderShapeToHtml(shape));
        setRenderedShapes(rendered);
      });
    }
  };

  useEffect(() => {
    if (typeof penpot !== 'undefined') {
      const handleSelectionChange = (selection: readonly Shape[]) => {
        setSelectedShapeCount(selection.filter(isShape).length);
      };

      penpot.selection.on('change', handleSelectionChange);
      penpot.selection.get().then(handleSelectionChange);

      return () => {
        // Clean up the event listener when the component unmounts
        // This is a placeholder as Penpot's API might not have a .off method
      };
    }
  }, []);

  return (
    <div className="container mx-auto p-0 grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Penpot Renderer</CardTitle>
            <CardDescription>
              Select shapes on your Penpot canvas and click render to see them
              as HTML and CSS.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleRenderSelection} className="w-full" size="lg">
              <Wand2 className="mr-2" />
              Render Selection
              {selectedShapeCount > 0 && (
                <Badge variant="secondary" className="ml-2">{selectedShapeCount}</Badge>
              )}
            </Button>
          </CardContent>
        </Card>
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Generated Code</CardTitle>
            <CardDescription>
              The HTML and CSS for the selected shapes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-lg text-xs overflow-auto max-h-96">
              <code>
                {renderedShapes.length > 0
                  ? renderedShapes.map(s => s.html).join('\n')
                  : 'Select shapes and click render...'}
              </code>
            </pre>
          </CardContent>
        </Card>
      </div>

      <div>
        <Card>
          <CardHeader>
            <CardTitle>Live Preview</CardTitle>
            <CardDescription>
              A live preview of the rendered HTML elements.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className="relative w-full h-[600px] bg-background border-2 border-dashed rounded-lg overflow-hidden"
              dangerouslySetInnerHTML={{ __html: renderedShapes.map(s => s.html).join('') }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
