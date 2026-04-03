import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function Page({
  params,
}: {
  params: Promise<{ tarefaId: string }>
}) {
  const { tarefaId } = await params

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6">
      <Card>
        <CardHeader>
          <CardTitle>Detalhe da tarefa #{tarefaId}</CardTitle>
          <CardDescription>
            Tela de detalhe da tarefa criada. A implementacao completa sera adicionada na proxima etapa.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Aqui entrarao os dados completos da tarefa, comentarios e historico.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
