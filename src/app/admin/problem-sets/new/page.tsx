import ProblemSetForm from "@/app/admin/components/ProblemSetForm"
import { createProblemSet } from "@/actions/admin"

export default function NewProblemSetPage() {
  const handleCreate = async (data: any) => {
    "use server"
    return createProblemSet(data)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[var(--text-primary)]">Create Problem Set</h1>
      <ProblemSetForm onSubmit={handleCreate} />
    </div>
  )
}
