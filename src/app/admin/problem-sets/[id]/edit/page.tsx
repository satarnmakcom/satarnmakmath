import prisma from "@/lib/prisma"
import ProblemSetForm from "@/app/admin/components/ProblemSetForm"
import { updateProblemSet, deleteProblemSet } from "@/actions/admin"
import { notFound } from "next/navigation"

export default async function EditProblemSetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  const problemSet = await prisma.problemSet.findUnique({
    where: { id },
    include: {
      items: {
        orderBy: { order: "asc" }
      }
    }
  })

  if (!problemSet) {
    notFound()
  }

  const handleUpdate = async (data: any) => {
    "use server"
    return updateProblemSet(id, data)
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-[var(--text-primary)]">Edit Problem Set</h1>
      <ProblemSetForm initialData={problemSet} onSubmit={handleUpdate} isEditing />
      
      <div className="max-w-4xl pt-8 border-t border-[var(--border-color)]">
        <h3 className="text-sm font-bold text-rose-500 uppercase tracking-wider mb-4">Danger Zone</h3>
        <form action={async () => {
          "use server"
          await deleteProblemSet(id)
        }}>
          <button type="submit" className="px-6 py-2.5 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 rounded-xl text-sm font-semibold transition-colors">
            Delete Problem Set
          </button>
        </form>
      </div>
    </div>
  )
}
