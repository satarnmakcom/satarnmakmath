import ModuleForm from '../components/ModuleForm'
import { createModule } from '@/actions/admin'
import { CompetitionLevel } from '@prisma/client'

export default function NewModulePage() {
  const handleCreate = async (data: {
    title: string
    description?: string
    level: CompetitionLevel
    order: number
  }) => {
    'use server'
    return createModule(data)
  }

  return <ModuleForm onSubmit={handleCreate} backHref="/admin/curriculum" />
}
