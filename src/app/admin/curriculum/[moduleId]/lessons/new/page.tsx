import LessonForm from '../../../components/LessonForm'
import { createLesson } from '@/actions/admin'

export default async function NewLessonPage({ params }: { params: Promise<{ moduleId: string }> }) {
  const { moduleId } = await params
  
  const handleCreate = async (data: {
    title: string
    content: string
    order: number
    videoUrl?: string
  }) => {
    'use server'
    return createLesson({ ...data, moduleId })
  }

  return <LessonForm onSubmit={handleCreate} backHref="/admin/curriculum" />
}
