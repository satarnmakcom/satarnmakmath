import React, { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import remarkGfm from 'remark-gfm'
import rehypeKatex from 'rehype-katex'

function useDarkMode() {
  const [isDark, setIsDark] = useState(false)
  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains('dark'))
    check()
    const observer = new MutationObserver(check)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])
  return isDark
}

interface MarkdownRendererProps {
  content: string
  className?: string
}

export default function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  const isDark = useDarkMode()
  const iframeBaseCSS = 'html, body { background: transparent !important; margin: 0; padding: 0; overflow: hidden !important; }'
  const filterStyle = isDark ? { filter: 'invert(1) hue-rotate(180deg)' } as React.CSSProperties : {}
  return (
    <div className={`relative prose prose-invert prose-sm md:prose-base max-w-none text-[var(--text-secondary)] leading-relaxed ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkMath, remarkGfm]}
        rehypePlugins={[rehypeKatex]}
        components={{
          // Custom HTML/CSS Art Renderer (Sandboxed Iframe)
          pre: ({ node, children, ...props }) => {
            const childrenArray = React.Children.toArray(children);

            // Canvas Renderer
            const canvasChild = childrenArray.find(
              (child: any) => child?.props?.className?.includes('language-satarn-canvas')
            ) as any;

            if (canvasChild && canvasChild.props) {
              try {
                const items = JSON.parse(String(canvasChild.props.children).replace(/\n$/, ''));
                if (Array.isArray(items) && items.length > 0) {
                  const canvasH = items.reduce((max: number, it: any) => Math.max(max, (it.y || 0) + (it.height || 0)), 0) + 20;
                  return (
                    <div className="relative w-full my-4 not-prose" style={{ height: canvasH }}>
                      {items.map((item: any) => (
                        <div
                          key={item.id}
                          className="absolute overflow-hidden"
                          style={{
                            left: item.x,
                            top: item.y,
                            width: item.width,
                            height: item.height,
                            ...filterStyle
                          }}
                        >
                          <iframe 
                            srcDoc={`<style>${iframeBaseCSS}</style>${item.htmlCode}`}
                            className="border-0" 
                            scrolling="no"
                            allow=""
                            style={{ 
                              display: 'block',
                              background: 'transparent',
                              width: `${item.originalWidth || item.width}px`,
                              height: `${item.originalHeight || item.height}px`,
                              transform: `scale(${item.width / (item.originalWidth || item.width || 1)}, ${item.height / (item.originalHeight || item.height || 1)})`,
                              transformOrigin: 'top left'
                            }}
                            sandbox="allow-scripts allow-same-origin"
                          />
                        </div>
                      ))}
                    </div>
                  );
                }
              } catch (e) {
                console.error("Failed to parse satarn-canvas JSON", e);
              }
              return null;
            }

            // Legacy HTML Art Logic (For backward compatibility)
            const codeChild = childrenArray.find(
              (child: any) => child?.props?.className?.includes('language-html-art')
            ) as any;
            
            if (codeChild && codeChild.props) {
              const className = codeChild.props.className;
              const match = /language-html-art(?:\|([^\|]+)\|([^\|]+)\|([^\|]+))?/.exec(className || '');
              const align = match ? match[1]?.trim().toLowerCase() : 'center';
              const width = match ? match[2]?.trim() : '100%';
              const height = match ? match[3]?.trim() : '300px';

              let alignmentClass = 'block mx-auto my-4';
              if (align === 'left') alignmentClass = 'float-left mr-4 mb-4';
              else if (align === 'right') alignmentClass = 'float-right ml-4 mb-4';

              const w = width.match(/^\d+$/) ? `${width}px` : width;
              const h = height.match(/^\d+$/) ? `${height}px` : height;

              return (
                <span className={`inline-block ${alignmentClass} overflow-hidden rounded-xl border border-[var(--border-color)] shadow-sm bg-white`} style={{ width: w, height: h }}>
                  <iframe 
                    srcDoc={String(codeChild.props.children).replace(/\n$/, '')} 
                    className="w-full h-full border-0" 
                    sandbox="allow-scripts allow-same-origin"
                  />
                </span>
              );
            }
            return <pre className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-4 overflow-x-auto my-4" {...props}>{children}</pre>;
          },
          // Customize link styles or other tags if needed
          a: ({ node, ...props }) => <a className="text-electric-400 hover:text-electric-300 transition-colors" {...props} />,
          p: ({ node, ...props }) => <p className="mb-4 last:mb-0" {...props} />,
          img: ({ node, src, alt, ...props }) => {
            const altText = alt || '';
            const parts = altText.split('|');
            const altName = parts[0]?.trim() || '';
            const align = parts[1]?.trim().toLowerCase() || 'center';
            const size = parts[2]?.trim() || '';
            const height = parts[3]?.trim() || '';

            let alignmentClass = 'block mx-auto my-4'; // Default center
            if (align === 'left') {
              alignmentClass = 'float-left mr-4 mb-4';
            } else if (align === 'right') {
              alignmentClass = 'float-right ml-4 mb-4';
            }

            let widthStyle: React.CSSProperties = {};
            if (size) {
              const num = parseInt(size, 10);
              if (!isNaN(num)) {
                const unit = size.replace(/[0-9]/g, '') || 'px';
                widthStyle.width = `${num}${unit}`;
              } else {
                widthStyle.width = size;
              }
            }
            if (height) {
              const num = parseInt(height, 10);
              if (!isNaN(num)) {
                const unit = height.replace(/[0-9]/g, '') || 'px';
                widthStyle.height = `${num}${unit}`;
              } else {
                widthStyle.height = height;
              }
            }

            // Custom CSS Image Parser
            if (typeof src === 'string' && src.startsWith('css:')) {
              const urls = src.substring(4).split('|');
              const lightUrl = urls[0];
              const darkUrl = urls[1];

              return (
                <span className={`inline-block ${alignmentClass}`} style={widthStyle}>
                  <div 
                    role="img" 
                    aria-label={altName}
                    className="w-full h-full min-h-[50px] rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-sm bg-contain bg-no-repeat bg-center"
                    style={{
                      backgroundImage: `url('${lightUrl}')`,
                      // If there is a dark url, we can't easily inline it with Tailwind dark: classes unless we use inline CSS variables
                      // A clean trick is to use standard CSS variables for the background, but since we are generating it dynamically,
                      // we can render two divs, one for light, one for dark.
                    }}
                  >
                    {/* The dark mode overlay trick using Tailwind */}
                    {darkUrl && (
                      <div 
                        className="w-full h-full hidden dark:block bg-contain bg-no-repeat bg-center"
                        style={{ backgroundImage: `url('${darkUrl}')`, backgroundColor: 'var(--bg-card)' }}
                      />
                    )}
                  </div>
                </span>
              );
            }

            return (
              <span className={`inline-block ${alignmentClass}`} style={widthStyle}>
                <img
                  src={src}
                  alt={altName}
                  className="max-w-full h-auto rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-1 shadow-sm"
                  {...props}
                />
              </span>
            );
          }
        }}
      >
        {content}
      </ReactMarkdown>
      {/* Clear floats just in case an image was floated left or right */}
      <div className="clear-both"></div>
    </div>
  )
}
