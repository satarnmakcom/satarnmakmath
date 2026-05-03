import prisma from "@/lib/prisma"

export default async function AdminCurriculumPage() {
  try {
    const modules = await prisma.curriculumModule.findMany({
      include: {
        lessons: true
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
          <button className="btn-primary px-4 py-2 text-white rounded-xl text-sm font-semibold">
            + New Module
          </button>
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
                  <p className="text-sm text-[var(--text-secondary)] mt-1">{mod.description}</p>
                </div>
                <button className="text-sm font-semibold text-electric-400 hover:text-electric-300">
                  Edit Module
                </button>
              </div>

              <div className="pl-4 border-l-2 border-[var(--border-color)] space-y-2 mt-4">
                <h4 className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Lessons ({mod.lessons.length})</h4>
                {mod.lessons.map(lesson => (
                  <div key={lesson.id} className="flex justify-between items-center bg-[var(--bg-secondary)] p-3 rounded-xl">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 flex items-center justify-center rounded-md bg-[var(--bg-primary)] text-xs font-bold text-[var(--text-secondary)] border border-[var(--border-color)]">
                        {lesson.order}
                      </span>
                      <span className="text-sm font-semibold text-[var(--text-primary)]">{lesson.title}</span>
                    </div>
                    <button className="text-xs font-semibold text-violet-400 hover:text-violet-300">
                      Edit
                    </button>
                  </div>
                ))}
                <button className="mt-2 w-full py-2 border-2 border-dashed border-[var(--border-color)] hover:border-electric-500/50 rounded-xl text-sm font-semibold text-[var(--text-secondary)] hover:text-electric-400 transition-colors">
                  + Add Lesson
                </button>
              </div>
            </div>
          ))}

          {modules.length === 0 && (
            <div className="text-center py-12 card border border-[var(--border-color)] rounded-2xl text-[var(--text-secondary)]">
              No curriculum modules found.
            </div>
          )}
        </div>
      </div>
    )
  } catch (e: any) {
    return <div className="p-8 bg-red-100 text-red-900 border border-red-300 rounded-xl"><h1>Curriculum Page Error:</h1><pre className="whitespace-pre-wrap">{e.stack || e.message}</pre></div>
  }
}
