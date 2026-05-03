import prisma from "@/lib/prisma"
import ProblemForm from "../../components/ProblemForm"
import { updateProblem, deleteProblem } from "@/actions/admin"
import { notFound } from "next/navigation"

export default async function EditProblemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  const problem = await prisma.problem.findUnique({
    where: { id }
  })

  if (!problem) {
    notFound()
  }

  const handleUpdate = async (data: any) => {
    "use server"
    return updateProblem(id, data)
  }

  return (
    <div className="space-y-8">
      <ProblemForm initialData={problem} onSubmit={handleUpdate} isEditing />
      
      <div className="max-w-4xl pt-8 border-t border-[var(--border-color)]">
        <h3 className="text-sm font-bold text-rose-500 uppercase tracking-wider mb-4">Danger Zone</h3>
        <form action={async () => {
          "use server"
          await deleteProblem(id)
        }}>
          <button type="submit" className="px-6 py-2.5 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 rounded-xl text-sm font-semibold transition-colors">
            Delete Problem
          </button>
        </form>
      </div>
    </div>
  )
}
