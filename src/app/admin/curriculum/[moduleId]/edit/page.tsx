import prisma from '@/lib/prisma'
import ModuleForm from '../../components/ModuleForm'
import { updateModule, deleteModule } from '@/actions/admin'
import { notFound, redirect } from 'next/navigation'
import { CompetitionLevel } from '@prisma/client'

export default async function EditModulePage({ params }: { params: Promise<{ moduleId: string }> }) {
  const { moduleId } = await params
  
  const mod = await prisma.curriculumModule.findUnique({
    where: { id: moduleId }
  })

  if (!mod) notFound()

  const handleUpdate = async (data: {
    title: string
    description?: string
    level: CompetitionLevel
    order: number
  }) => {
    'use server'
    return updateModule(moduleId, data)
  }

  return (
    <div className="space-y-8">
      <ModuleForm initialData={mod} onSubmit={handleUpdate} backHref="/admin/curriculum" isEditing />

      {/* Danger Zone */}
      <div className="max-w-2xl pt-8 border-t border-[var(--border-color)]">
        <h3 className="text-sm font-bold text-rose-500 uppercase tracking-wider mb-4">Danger Zone</h3>
        <form action={async () => {
          'use server'
          await deleteModule(moduleId)
          redirect('/admin/curriculum')
        }}>
          <button
            type="submit"
            className="px-6 py-2.5 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 rounded-xl text-sm font-semibold transition-colors"
          >
            Delete Module & All Lessons
          </button>
        </form>
      </div>
    </div>
  )
}
