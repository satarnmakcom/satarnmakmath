import ProblemForm from "../components/ProblemForm"
import { createProblem } from "@/actions/admin"

export default function NewProblemPage() {
  return <ProblemForm onSubmit={createProblem} />
}
