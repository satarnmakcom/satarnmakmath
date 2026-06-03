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
            const align = parts[0]?.trim().toLowerCase() || 'center';
            const size = parts[1]?.trim() || '';

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
                widthStyle = { width: `${num}${unit}` };
              }
            }

            return (
              <span className={`inline-block ${alignmentClass}`} style={widthStyle}>
                <img
                  src={src}
                  alt={parts[0] || ''}
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
