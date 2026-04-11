"use client"

import { useEffect, useState } from "react"
import { CartesianGrid, Line, LineChart, XAxis } from "recharts"
import { toast } from "sonner"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { buscarDashLinhasTaxaConclusaoPorPeriodo } from "@/lib/dash-api"
import type { DashFiltros, DashLinhaTaxaConclusao } from "@/types/dash"

const chartConfig = {
  taxa_conclusao: { label: "Taxa", color: "var(--primary)" },
} satisfies ChartConfig

export function DashboardLinhasTaxaConclusaoPorPeriodo({ filtros }: { filtros: DashFiltros }) {
  const [dados, setDados] = useState<DashLinhaTaxaConclusao[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function carregar() {
      try {
        setIsLoading(true)
        setDados(await buscarDashLinhasTaxaConclusaoPorPeriodo(filtros))
      } catch {
        toast.error("Nao foi possivel carregar taxa de conclusao por periodo.")
      } finally {
        setIsLoading(false)
      }
    }

    void carregar()
  }, [filtros])

  return (
    <Card>
      <CardHeader><CardTitle>Taxa de conclusao por periodo</CardTitle></CardHeader>
      <CardContent>
        {isLoading ? <Skeleton className="h-[260px] w-full" /> : (
          <ChartContainer config={chartConfig} className="h-[260px] w-full">
            <LineChart data={dados}><CartesianGrid vertical={false} /><XAxis dataKey="periodo" tickLine={false} axisLine={false} tickMargin={8} /><ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} /><Line dataKey="taxa_conclusao" type="monotone" stroke="var(--color-taxa_conclusao)" strokeWidth={2} dot={false} /></LineChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
