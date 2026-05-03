import LessonForm from '../../../components/LessonForm'
import { createLesson } from '@/actions/admin'

export default function NewLessonPage({ params }: { params: { moduleId: string } }) {
  const handleCreate = async (data: {
    title: string
    content: string
    order: number
    videoUrl?: string
  }) => {
    'use server'
    return createLesson({ ...data, moduleId: params.moduleId })
  }

  return <LessonForm onSubmit={handleCreate} backHref="/admin/curriculum" />
}
