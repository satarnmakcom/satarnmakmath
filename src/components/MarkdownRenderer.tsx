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
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
