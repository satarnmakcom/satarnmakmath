import React, { useState } from 'react';
import { Rnd } from 'react-rnd';
import MarkdownRenderer from '@/components/MarkdownRenderer';

export interface CanvasItem {
  id: string;
  htmlCode: string;
  x: number;
  y: number;
  width: number;
  height: number;
  originalWidth?: number;
  originalHeight?: number;
}

interface CanvasEditorProps {
  items: CanvasItem[];
  onChange: (items: CanvasItem[]) => void;
  canvasHeight?: number;
  markdownContent?: string;
}

export default function CanvasEditor({ items, onChange, canvasHeight = 600, markdownContent }: CanvasEditorProps) {
  const [newHtml, setNewHtml] = useState('');
  const [initWidth, setInitWidth] = useState('500');
  const [initHeight, setInitHeight] = useState('500');
  const [showAdder, setShowAdder] = useState(false);

  const handleAdd = () => {
    if (!newHtml.trim()) return;
    const w = parseInt(initWidth, 10) || 500;
    const h = parseInt(initHeight, 10) || 500;
    const newItem: CanvasItem = {
      id: Math.random().toString(36).substring(2, 9),
      htmlCode: newHtml,
      x: 100,
      y: 100,
      width: w,
      height: h,
      originalWidth: w,
      originalHeight: h
    };
    onChange([...items, newItem]);
    setNewHtml('');
    setShowAdder(false);
  };

  const updateItem = (id: string, updates: Partial<CanvasItem>) => {
    onChange(items.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const removeItem = (id: string) => {
    onChange(items.filter(item => item.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-bold text-[var(--text-primary)]">Interactive Art Canvas</h3>
        <button
          type="button"
          onClick={() => setShowAdder(!showAdder)}
          className="text-xs px-3 py-1.5 rounded-lg bg-electric-500 text-white font-bold hover:bg-electric-600 transition-colors shadow-sm"
        >
          {showAdder ? 'Cancel' : '+ Add HTML Art'}
        </button>
      </div>

      {showAdder && (
        <div className="p-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl space-y-3">
          <textarea
            value={newHtml}
            onChange={(e) => setNewHtml(e.target.value)}
            placeholder="Paste HTML/CSS code here..."
            className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-electric-500/50 font-mono resize-y"
            rows={4}
          />
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-[10px] font-bold text-[var(--text-tertiary)] uppercase mb-1">Base Width (px)</label>
              <input type="number" value={initWidth} onChange={e => setInitWidth(e.target.value)} className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-electric-500/50" />
            </div>
            <div className="flex-1">
              <label className="block text-[10px] font-bold text-[var(--text-tertiary)] uppercase mb-1">Base Height (px)</label>
              <input type="number" value={initHeight} onChange={e => setInitHeight(e.target.value)} className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-electric-500/50" />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleAdd}
              disabled={!newHtml.trim()}
              className="px-4 py-1.5 bg-emerald-500 text-white text-xs font-bold rounded-lg hover:bg-emerald-600 disabled:opacity-50"
            >
              Add to Canvas
            </button>
          </div>
        </div>
      )}

      <div 
        className="relative w-full bg-[var(--bg-card)] border-2 border-[var(--border-color)] rounded-xl overflow-y-auto"
        style={{ minHeight: canvasHeight, maxHeight: 800 }}
      >
        {/* Render markdown text in the background if provided */}
        {markdownContent && (
          <div className="absolute inset-0 p-4 pointer-events-none opacity-50">
            <MarkdownRenderer content={markdownContent} />
          </div>
        )}

        {items.length === 0 && !markdownContent && (
          <div className="absolute inset-0 flex items-center justify-center text-[var(--text-tertiary)] text-sm font-semibold pointer-events-none">
            Canvas is empty. Add some HTML art!
          </div>
        )}
        
        {items.map(item => (
          <Rnd
            key={item.id}
            size={{ width: item.width, height: item.height }}
            position={{ x: item.x, y: item.y }}
            onDragStop={(e, d) => updateItem(item.id, { x: d.x, y: d.y })}
            onResizeStop={(e, direction, ref, delta, position) => {
              updateItem(item.id, {
                width: parseInt(ref.style.width, 10),
                height: parseInt(ref.style.height, 10),
                ...position,
              });
            }}
            bounds="parent"
            className="group bg-transparent"
          >
            <div className="relative w-full h-full rounded-lg overflow-hidden group-hover:ring-2 ring-electric-500/50 transition-all cursor-move">
              {/* Overlay to catch pointer events for dragging while still letting background show */}
              <div className="absolute inset-0 z-10 pointer-events-auto opacity-0" />
              
              {/* Delete button (only visible on hover) */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeItem(item.id);
                }}
                className="absolute top-2 right-2 z-20 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg pointer-events-auto"
                title="Remove"
              >
                &times;
              </button>
              
              <div className="w-full h-full overflow-hidden">
                <iframe
                  srcDoc={`<style>body { background: transparent !important; margin: 0; padding: 0; overflow: hidden !important; }</style>${item.htmlCode}`}
                  className="border-0 pointer-events-none dark:invert dark:hue-rotate-180"
                  scrolling="no"
                  style={{ 
                    background: 'transparent',
                    width: `${item.originalWidth || item.width}px`,
                    height: `${item.originalHeight || item.height}px`,
                    transform: `scale(${item.width / (item.originalWidth || item.width || 1)}, ${item.height / (item.originalHeight || item.height || 1)})`,
                    transformOrigin: 'top left'
                  }}
                  sandbox="allow-scripts allow-same-origin"
                />
              </div>
            </div>
          </Rnd>
        ))}
      </div>
      <p className="text-[10px] text-[var(--text-tertiary)] text-right">
        * You can drag and resize the art blocks.
      </p>
    </div>
  );
}
