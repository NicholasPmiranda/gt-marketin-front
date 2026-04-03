import type { TarefaStatus } from "@/types/tarefas"

export function getTarefaStatusStyles(status: TarefaStatus) {
  if (status === "pendente") {
    return {
      coluna: "border-orange-500/60",
      chip: "bg-orange-500/10 text-orange-600 dark:text-orange-300",
      card: "border-l-2 border-l-orange-500",
    }
  }

  if (status === "em andamento") {
    return {
      coluna: "border-blue-500/60",
      chip: "bg-blue-500/10 text-blue-600 dark:text-blue-300",
      card: "border-l-2 border-l-blue-500",
    }
  }

  if (status === "revisao") {
    return {
      coluna: "border-violet-500/60",
      chip: "bg-violet-500/10 text-violet-600 dark:text-violet-300",
      card: "border-l-2 border-l-violet-500",
    }
  }

  return {
    coluna: "border-emerald-500/60",
    chip: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
    card: "border-l-2 border-l-emerald-500",
  }
}
