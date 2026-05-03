import prisma from '@/lib/prisma'
import LessonForm from '../../../../components/LessonForm'
import { updateLesson, deleteLesson } from '@/actions/admin'
import { notFound, redirect } from 'next/navigation'

export default async function EditLessonPage({ params }: { params: { moduleId: string; lessonId: string } }) {
  const lesson = await prisma.lesson.findUnique({
    where: { id: params.lessonId }
  })

  if (!lesson) notFound()

  const handleUpdate = async (data: {
    title: string
    content: string
    order: number
    videoUrl?: string
  }) => {
    'use server'
    return updateLesson(params.lessonId, data)
  }

  return (
    <div className="space-y-8">
      <LessonForm initialData={lesson} onSubmit={handleUpdate} backHref="/admin/curriculum" isEditing />

      {/* Danger Zone */}
      <div className="max-w-4xl pt-8 border-t border-[var(--border-color)]">
        <h3 className="text-sm font-bold text-rose-500 uppercase tracking-wider mb-4">Danger Zone</h3>
        <form action={async () => {
          'use server'
          await deleteLesson(params.lessonId)
          redirect('/admin/curriculum')
        }}>
          <button
            type="submit"
            className="px-6 py-2.5 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 rounded-xl text-sm font-semibold transition-colors"
          >
            Delete This Lesson
          </button>
        </form>
      </div>
    </div>
  )
}
