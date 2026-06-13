'use client'

import { useState, useRef, useEffect } from 'react'
import MarkdownRenderer from '@/components/MarkdownRenderer'
import CanvasEditor, { CanvasItem } from '../problems/components/CanvasEditor'

const LANG_SEP = '---LANG:TH---'

const extractCanvasData = (content: string) => {
  const match = content.match(/```satarn-canvas\n([\s\S]*?)\n```/);
  if (match) {
    try {
      const items = JSON.parse(match[1]);
      const cleanContent = content.replace(/```satarn-canvas\n[\s\S]*?\n```/, '').trim();
      return { items, cleanContent };
    } catch (e) {
      console.error('Failed to parse canvas data', e);
    }
  }
  return { items: [], cleanContent: content };
};

const parseBilingualContent = (content: string) => {
  const idx = content.indexOf(LANG_SEP)
  if (idx === -1) return { en: content, th: '' }
  return {
    en: content.slice(0, idx).trim(),
    th: content.slice(idx + LANG_SEP.length).trim()
  }
};

interface InlineProblemEditorProps {
  initialContent: string
  onChange: (content: string) => void
}

export default function InlineProblemEditor({ initialContent, onChange }: InlineProblemEditorProps) {
  const parsedContent = extractCanvasData(initialContent);
  const parsedLangs = parseBilingualContent(parsedContent.cleanContent);

  const [enContent, setEnContent] = useState(parsedLangs.en)
  const [thContent, setThContent] = useState(parsedLangs.th)
  const [canvasItems, setCanvasItems] = useState<CanvasItem[]>(parsedContent.items)
  const [contentLang, setContentLang] = useState<'en' | 'th'>('en')
  const [showPreview, setShowPreview] = useState(false)

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const textareaThRef = useRef<HTMLTextAreaElement>(null)

  // Notify parent on change
  useEffect(() => {
    const combinedContent = thContent.trim()
      ? `${enContent}\n${LANG_SEP}\n${thContent}`
      : enContent

    const finalContent = canvasItems.length > 0 
      ? `${combinedContent}\n\n\`\`\`satarn-canvas\n${JSON.stringify(canvasItems, null, 2)}\n\`\`\``
      : combinedContent;
      
    onChange(finalContent)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enContent, thContent, canvasItems])

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Problem Statement (LaTeX Supported)</label>
        
        <div className="flex items-center gap-2">
          {/* Language Tab Switcher */}
          <div className="flex items-center gap-1 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg p-0.5">
            <button
              type="button"
              onClick={() => setContentLang('en')}
              className={`text-xs px-3 py-1 rounded-md font-bold transition-colors ${contentLang === 'en' ? 'bg-electric-500 text-white' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
            >
              🇬🇧 EN
            </button>
            <button
              type="button"
              onClick={() => setContentLang('th')}
              className={`text-xs px-3 py-1 rounded-md font-bold transition-colors ${contentLang === 'th' ? 'bg-electric-500 text-white' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
            >
              🇹🇭 TH
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-colors flex items-center gap-1 ${
              showPreview
                ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                : 'bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </button>
        </div>
      </div>

      {/* Interactive Canvas Editor */}
      <div className="mb-4">
        <CanvasEditor items={canvasItems} onChange={setCanvasItems} markdownContent={enContent} />
      </div>

      {/* Editor + Live Preview side by side when preview is open */}
      {showPreview ? (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase mb-1.5 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Editor ({contentLang === 'en' ? '🇬🇧 EN' : '🇹🇭 TH'})
            </div>
            {contentLang === 'en' ? (
              <textarea
                required
                ref={textareaRef}
                rows={10}
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-electric-500/50 transition-all resize-y"
                value={enContent}
                onChange={e => setEnContent(e.target.value)}
              />
            ) : (
              <textarea
                ref={textareaThRef}
                rows={10}
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-electric-500/50 transition-all resize-y"
                value={thContent}
                onChange={e => setThContent(e.target.value)}
                placeholder="Thai content (optional — if empty, EN version will be shown)"
              />
            )}
          </div>
          <div>
            <div className="text-[10px] font-bold text-emerald-400 uppercase mb-1.5 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Live Preview ({contentLang === 'en' ? '🇬🇧 EN' : '🇹🇭 TH'})
            </div>
            <div className="bg-[var(--bg-secondary)] border border-emerald-500/30 rounded-xl px-4 py-3 overflow-y-auto relative" style={{ minHeight: '14rem', maxHeight: '20rem' }}>
              {(contentLang === 'en' ? enContent : (thContent || enContent)) || canvasItems.length > 0 ? (
                <MarkdownRenderer 
                  content={(() => {
                    const base = contentLang === 'en' ? enContent : (thContent || enContent)
                    return canvasItems.length > 0 ? `${base}\n\n\`\`\`satarn-canvas\n${JSON.stringify(canvasItems, null, 2)}\n\`\`\`` : base
                  })()}
                />
              ) : (
                <div className="text-[var(--text-tertiary)] text-sm italic text-center py-4">
                  เริ่มพิมพ์โจทย์ด้านซ้าย หรือเพิ่มรูป HTML Art เพื่อดู preview ที่นี่...
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        contentLang === 'en' ? (
          <textarea
            required
            ref={textareaRef}
            rows={6}
            className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-electric-500/50 transition-all resize-y"
            value={enContent}
            onChange={e => setEnContent(e.target.value)}
          />
        ) : (
          <textarea
            ref={textareaThRef}
            rows={6}
            className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-electric-500/50 transition-all resize-y"
            value={thContent}
            onChange={e => setThContent(e.target.value)}
            placeholder="Thai content (optional — if empty, EN version will be shown to Thai users)"
          />
        )
      )}
    </div>
  )
}
