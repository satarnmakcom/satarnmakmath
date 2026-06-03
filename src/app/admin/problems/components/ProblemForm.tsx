'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { CompetitionLevel } from '@prisma/client'
import { uploadSvgAction } from '@/actions/admin'
import MarkdownRenderer from '@/components/MarkdownRenderer'

interface ProblemFormProps {
  initialData?: {
    id?: string
    code: string
    title: string
    content: string
    level: CompetitionLevel
    difficulty: number
    tags: string[]
    hints?: string[]
  }
  onSubmit: (data: any) => Promise<{ success: boolean, error?: string }>
  isEditing?: boolean
}

export default function ProblemForm({ initialData, onSubmit, isEditing = false }: ProblemFormProps) {
  const router = useRouter()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [formData, setFormData] = useState({
    code: initialData?.code || '',
    title: initialData?.title || '',
    content: initialData?.content || '',
    level: initialData?.level || 'POSN',
    difficulty: initialData?.difficulty || 1200,
    tags: initialData?.tags?.join(', ') || '',
    hints: initialData?.hints || []
  })

  // Upload States
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [uploadedUrl, setUploadedUrl] = useState('')
  const [imgAlign, setImgAlign] = useState<'left' | 'center' | 'right'>('center')
  const [imgWidth, setImgWidth] = useState('300')

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setUploadError('')
    setUploadedUrl('')

    try {
      const data = new FormData()
      data.append('file', file)
      const res = await uploadSvgAction(data)
      if (res.success && res.url) {
        setUploadedUrl(res.url)
      } else {
        setUploadError(res.error || 'Failed to upload image')
      }
    } catch (err: any) {
      setUploadError(err.message || 'Upload error')
    } finally {
      setUploading(false)
    }
  }

  const insertImageMarkdown = () => {
    if (!uploadedUrl) return
    const tag = `\n![${imgAlign}|${imgWidth}](${uploadedUrl})\n`
    
    const textarea = textareaRef.current
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const text = formData.content
      const before = text.substring(0, start)
      const after = text.substring(end)
      setFormData({
        ...formData,
        content: before + tag + after
      })
      
      setUploadedUrl('')
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      
      // Auto-show preview after inserting
      setShowPreview(true)
      
      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(start + tag.length, start + tag.length)
      }, 50)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(Boolean)

    const res = await onSubmit({
      ...formData,
      difficulty: Number(formData.difficulty),
      tags: tagsArray,
      hints: formData.hints.filter(h => h.trim() !== '')
    })

    if (res.success) {
      router.push('/admin/problems')
    } else {
      setError(res.error || 'Failed to save problem')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">
          {isEditing ? 'Edit Problem' : 'Create New Problem'}
        </h1>
        <div className="flex gap-3">
          <Link href="/admin/problems" className="px-4 py-2 rounded-xl border border-[var(--border-color)] text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
            Cancel
          </Link>
          <button type="submit" disabled={loading} className="btn-primary px-6 py-2 text-white rounded-xl text-sm font-semibold disabled:opacity-50">
            {loading ? 'Saving...' : 'Save Problem'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-rose-500/10 text-rose-500 p-4 rounded-xl text-sm font-semibold border border-rose-500/20">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="card p-6 rounded-2xl space-y-4">
            <div>
              <label className="block text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Title</label>
              <input
                type="text"
                required
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-electric-500/50 transition-all"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Content (LaTeX Supported)</label>
                
                <div className="flex items-center gap-2">
                  {/* Preview Toggle */}
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

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept=".svg,.png,.jpg,.jpeg,.webp,.gif"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="text-xs px-3 py-1.5 rounded-lg bg-electric-500/10 text-electric-400 font-bold hover:bg-electric-500/20 transition-colors flex items-center gap-1 disabled:opacity-50"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    {uploading ? 'Uploading...' : 'Upload Image/SVG'}
                  </button>
                </div>
              </div>

              {uploadedUrl && (
                <div className="mb-3 p-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[var(--text-primary)]">Image Settings:</span>
                    <button
                      type="button"
                      onClick={() => setUploadedUrl('')}
                      className="text-xs text-rose-500 hover:underline"
                    >
                      Cancel
                    </button>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-[var(--text-tertiary)] uppercase">Align:</span>
                      <div className="flex rounded-lg overflow-hidden border border-[var(--border-color)] bg-[var(--bg-card)]">
                        {(['left', 'center', 'right'] as const).map(align => (
                          <button
                            key={align}
                            type="button"
                            onClick={() => setImgAlign(align)}
                            className={`px-2.5 py-1 text-xs font-semibold transition-all capitalize ${
                              imgAlign === align
                                ? 'bg-electric-500 text-white'
                                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'
                            }`}
                          >
                            {align}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-[var(--text-tertiary)] uppercase">Width:</span>
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={imgWidth}
                          onChange={e => setImgWidth(e.target.value)}
                          placeholder="e.g. 300 or 50%"
                          className="w-20 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg px-2 py-1 text-xs text-[var(--text-primary)] focus:outline-none focus:border-electric-500/50"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={insertImageMarkdown}
                      className="ml-auto px-3 py-1.5 bg-electric-500 hover:bg-electric-600 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
                    >
                      Insert Image Code
                    </button>
                  </div>

                  {/* Image preview with position indicator */}
                  <div className="pt-2 border-t border-[var(--border-color)]">
                    <div className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase mb-2">Preview (จะแสดงผลแบบนี้ใน Content):</div>
                    <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] p-3 overflow-hidden">
                      <div className={`${
                        imgAlign === 'left' ? 'float-left mr-4 mb-2' :
                        imgAlign === 'right' ? 'float-right ml-4 mb-2' :
                        'mx-auto block'
                      }`} style={{ width: (() => {
                        const num = parseInt(imgWidth, 10)
                        if (!isNaN(num)) {
                          const unit = imgWidth.replace(/[0-9]/g, '') || 'px'
                          return `${num}${unit}`
                        }
                        return imgWidth || 'auto'
                      })() }}>
                        <img src={uploadedUrl} alt="preview" className="max-w-full h-auto rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)]" />
                      </div>
                      <div className="clear-both" />
                      <p className="text-[var(--text-tertiary)] text-xs mt-1">← ข้อความโจทย์จะอยู่ที่นี่</p>
                    </div>
                  </div>
                </div>
              )}

              {uploadError && (
                <div className="mb-3 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs rounded-xl font-medium">
                  ⚠️ {uploadError}
                </div>
              )}

              {/* Editor + Live Preview side by side when preview is open */}
              {showPreview ? (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase mb-1.5 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Editor
                    </div>
                    <textarea
                      required
                      ref={textareaRef}
                      rows={18}
                      className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-electric-500/50 transition-all resize-y"
                      value={formData.content}
                      onChange={e => setFormData({ ...formData, content: e.target.value })}
                    />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-emerald-400 uppercase mb-1.5 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Live Preview (เหมือนที่นักเรียนเห็น)
                    </div>
                    <div className="bg-[var(--bg-secondary)] border border-emerald-500/30 rounded-xl px-4 py-3 overflow-y-auto" style={{ minHeight: '18rem', maxHeight: '36rem' }}>
                      {formData.content ? (
                        <MarkdownRenderer content={formData.content} />
                      ) : (
                        <div className="text-[var(--text-tertiary)] text-sm italic text-center py-8">
                          เริ่มพิมพ์โจทย์ด้านซ้าย เพื่อดู preview ที่นี่...
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <textarea
                  required
                  ref={textareaRef}
                  rows={15}
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-electric-500/50 transition-all resize-y"
                  value={formData.content}
                  onChange={e => setFormData({ ...formData, content: e.target.value })}
                />
              )}
            </div>
            
            {/* Hints Section */}
            <div className="pt-4 border-t border-[var(--border-color)]">
              <div className="flex items-center justify-between mb-4">
                <label className="block text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Hints</label>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, hints: [...formData.hints, ''] })}
                  className="text-xs px-3 py-1 rounded-lg bg-electric-500/10 text-electric-400 font-bold hover:bg-electric-500/20 transition-colors"
                >
                  + Add Hint
                </button>
              </div>
              <div className="space-y-3">
                {formData.hints.map((hint, index) => (
                  <div key={index} className="flex gap-2">
                    <span className="flex-shrink-0 w-6 h-6 mt-2 rounded-full bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center justify-center text-xs font-bold text-[var(--text-tertiary)]">
                      {index + 1}
                    </span>
                    <textarea
                      rows={2}
                      className="flex-1 bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-electric-500/50 transition-all resize-y font-mono"
                      value={hint}
                      onChange={(e) => {
                        const newHints = [...formData.hints]
                        newHints[index] = e.target.value
                        setFormData({ ...formData, hints: newHints })
                      }}
                      placeholder={`Hint ${index + 1} (LaTeX supported)`}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newHints = formData.hints.filter((_, i) => i !== index)
                        setFormData({ ...formData, hints: newHints })
                      }}
                      className="flex-shrink-0 mt-2 w-8 h-8 rounded-lg flex items-center justify-center text-rose-500 hover:bg-rose-500/10 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                ))}
                {formData.hints.length === 0 && (
                  <div className="text-sm text-[var(--text-tertiary)] text-center py-4 bg-[var(--bg-card)] rounded-xl border border-dashed border-[var(--border-color)]">
                    No hints added yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6 rounded-2xl space-y-4">
            <div>
              <label className="block text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Code</label>
              <input
                type="text"
                required
                placeholder="e.g. TMO-2565-P1"
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-electric-500/50 transition-all"
                value={formData.code}
                onChange={e => setFormData({ ...formData, code: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Level</label>
              <select
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-electric-500/50 transition-all"
                value={formData.level}
                onChange={e => setFormData({ ...formData, level: e.target.value as CompetitionLevel })}
              >
                {Object.values(CompetitionLevel).map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Difficulty Rating</label>
              <input
                type="number"
                required
                min={800}
                max={4000}
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-electric-500/50 transition-all"
                value={formData.difficulty}
                onChange={e => setFormData({ ...formData, difficulty: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Tags (Comma separated)</label>
              <input
                type="text"
                placeholder="Geometry, Number Theory"
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-electric-500/50 transition-all"
                value={formData.tags}
                onChange={e => setFormData({ ...formData, tags: e.target.value })}
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}
