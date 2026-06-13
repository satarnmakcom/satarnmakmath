import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import remarkGfm from 'remark-gfm'
import rehypeKatex from 'rehype-katex'

interface MarkdownRendererProps {
  content: string
  className?: string
}

export default function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  return (
    <div className={`prose prose-invert prose-sm md:prose-base max-w-none text-[var(--text-secondary)] leading-relaxed ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkMath, remarkGfm]}
        rehypePlugins={[rehypeKatex]}
        components={{
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
            if (src?.startsWith('css:')) {
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
