import prisma from "@/lib/prisma"
import Link from "next/link"

export default async function AdminCurriculumPage() {
  try {
    const modules = await prisma.curriculumModule.findMany({
      include: {
        lessons: { orderBy: { order: 'asc' } }
      },
      orderBy: [
        { level: 'asc' },
        { order: 'asc' }
      ]
    })

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Manage Curriculum</h1>
          <Link
            href="/admin/curriculum/new"
            className="btn-primary px-4 py-2 text-white rounded-xl text-sm font-semibold"
          >
            + New Module
          </Link>
        </div>

        <div className="space-y-4">
          {modules.map(mod => (
            <div key={mod.id} className="card p-6 rounded-2xl border border-[var(--border-color)]">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 bg-electric-500/10 text-electric-400 text-[10px] font-bold rounded uppercase tracking-wider">
                      {mod.level}
                    </span>
                    <span className="text-[10px] text-[var(--text-tertiary)] font-bold">
                      ORDER: {mod.order}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-[var(--text-primary)]">{mod.title}</h3>
                  {mod.description && (
                    <p className="text-sm text-[var(--text-secondary)] mt-1">{mod.description}</p>
                  )}
                </div>
                <Link
                  href={`/admin/curriculum/${mod.id}/edit`}
                  className="text-sm font-semibold text-electric-400 hover:text-electric-300 px-3 py-1.5 rounded-lg hover:bg-electric-500/10 transition-all"
                >
                  Edit Module
                </Link>
              </div>

              <div className="pl-4 border-l-2 border-[var(--border-color)] space-y-2 mt-4">
                <h4 className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">
                  Lessons ({mod.lessons.length})
                </h4>
                {mod.lessons.map(lesson => (
                  <div key={lesson.id} className="flex justify-between items-center bg-[var(--bg-secondary)] p-3 rounded-xl">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 flex items-center justify-center rounded-md bg-[var(--bg-primary)] text-xs font-bold text-[var(--text-secondary)] border border-[var(--border-color)]">
                        {lesson.order}
                      </span>
                      <span className="text-sm font-semibold text-[var(--text-primary)]">{lesson.title}</span>
                    </div>
                    <Link
                      href={`/admin/curriculum/${mod.id}/lessons/${lesson.id}/edit`}
                      className="text-xs font-semibold text-violet-400 hover:text-violet-300 px-2 py-1 rounded-lg hover:bg-violet-500/10 transition-all"
                    >
                      Edit
                    </Link>
                  </div>
                ))}
                <Link
                  href={`/admin/curriculum/${mod.id}/lessons/new`}
                  className="mt-2 w-full py-2 border-2 border-dashed border-[var(--border-color)] hover:border-electric-500/50 rounded-xl text-sm font-semibold text-[var(--text-secondary)] hover:text-electric-400 transition-colors flex items-center justify-center"
                >
                  + Add Lesson
                </Link>
              </div>
            </div>
          ))}

          {modules.length === 0 && (
            <div className="text-center py-16 card border border-[var(--border-color)] rounded-2xl">
              <div className="text-4xl mb-4">📚</div>
              <p className="font-semibold text-[var(--text-secondary)]">No curriculum modules yet</p>
              <Link href="/admin/curriculum/new" className="mt-4 inline-block text-electric-400 hover:text-electric-300 text-sm font-semibold">
                Create your first module →
              </Link>
            </div>
          )}
        </div>
      </div>
    )
  } catch (e: any) {
    return (
      <div className="p-8 bg-red-100 text-red-900 border border-red-300 rounded-xl">
        <h1 className="font-bold text-lg mb-2">Curriculum Page Error:</h1>
        <pre className="whitespace-pre-wrap text-sm">{e.stack || e.message}</pre>
      </div>
    )
  }
}
