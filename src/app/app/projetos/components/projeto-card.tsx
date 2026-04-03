import Link from "next/link"

import type { ProjetoItem } from "@/types/projetos"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function ProjetoCard({ projeto }: { projeto: ProjetoItem }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="line-clamp-1">{projeto.nome}</CardTitle>
        <CardDescription>
          {projeto.ativo ? "Projeto ativo" : "Projeto inativo"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {projeto.descricao || "Sem descricao"}
        </p>

        <div className="flex flex-wrap gap-2">
          {projeto.equipe.length > 0 ? (
            projeto.equipe.map((membro) => (
              <Badge key={membro.id} variant="outline">
                {membro.name}
              </Badge>
            ))
          ) : (
            <Badge variant="secondary">Sem equipe</Badge>
          )}
        </div>

        <Link
          href={`/app/projetos/${projeto.id}`}
          className={buttonVariants({ className: "w-full" })}
        >
          Abrir projeto
        </Link>
      </CardContent>
    </Card>
  )
}
