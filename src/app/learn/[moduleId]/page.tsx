import prisma from '@/lib/prisma'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function ModulePage({ params }: { params: Promise<{ moduleId: string }> }) {
  const { moduleId } = await params
  
  const mod = await prisma.curriculumModule.findUnique({
    where: { id: moduleId },
    include: {
      lessons: {
        orderBy: { order: 'asc' }
      }
    }
  })

  if (!mod) {
    notFound()
  }

  return (
    <section className="max-w-3xl mx-auto py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)] mb-6">
        <Link href="/learn" className="hover:text-electric-400 cursor-pointer font-medium transition-colors">Curriculum</Link>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
        </svg>
        <span className="text-[var(--text-primary)] font-medium">{mod.title}</span>
      </div>

      <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-4 tracking-tight">{mod.title}</h1>
      <div className="flex items-center gap-3 mb-6">
        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-electric-500/10 text-electric-400 border border-electric-500/20">
          {mod.level}
        </span>
        <span className="text-sm font-semibold text-[var(--text-tertiary)]">{mod.lessons.length} Lessons</span>
      </div>
      
      {mod.description && (
        <p className="text-base text-[var(--text-secondary)] mb-10 leading-relaxed border-l-4 border-electric-500/50 pl-4 py-1">
          {mod.description}
        </p>
      )}

      {/* Content Sections */}
      <div className="space-y-4">
        {mod.lessons.map((lesson) => (
          <div key={lesson.id} className="card rounded-2xl p-6 border border-[var(--border-color)] hover:border-electric-500/30 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center font-bold text-sm text-[var(--text-tertiary)] border border-[var(--border-color)]">
                  {lesson.order}
                </div>
                <h3 className="text-lg font-bold text-[var(--text-primary)]">{lesson.title}</h3>
              </div>
              {lesson.videoUrl && (
                <a href={lesson.videoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs font-bold text-rose-500 bg-rose-500/10 px-3 py-1.5 rounded-lg hover:bg-rose-500/20 transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
                  Watch
                </a>
              )}
            </div>
            
            <div className="prose prose-invert prose-sm max-w-none text-[var(--text-secondary)]">
              {/* Note: In a real app we'd use a Markdown/LaTeX renderer here */}
              <div className="whitespace-pre-wrap">{lesson.content}</div>
            </div>
          </div>
        ))}

        {mod.lessons.length === 0 && (
          <div className="p-8 text-center border-2 border-dashed border-[var(--border-color)] rounded-2xl">
            <p className="text-[var(--text-secondary)] font-medium">No lessons added to this module yet.</p>
          </div>
        )}
      </div>

      {/* Practice Button */}
      <div className="mt-12 flex justify-center border-t border-[var(--border-color)] pt-8">
        <Link 
          href={`/practice?level=${mod.level}`} 
          className="btn-primary px-8 py-3 text-white rounded-xl text-base font-semibold hover:scale-105 transition-transform shadow-lg shadow-electric-500/20"
        >
          Practice {mod.level} Problems
        </Link>
      </div>
    </section>
  )
}
