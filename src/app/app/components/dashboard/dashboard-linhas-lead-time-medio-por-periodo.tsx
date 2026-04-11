"use client"

import { useEffect, useState } from "react"
import { CartesianGrid, Line, LineChart, XAxis } from "recharts"
import { toast } from "sonner"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { buscarDashLinhasLeadTimeMedioPorPeriodo } from "@/lib/dash-api"
import type { DashFiltros, DashLinhaLeadTime } from "@/types/dash"

const chartConfig = {
  lead_time_horas: { label: "Lead time", color: "var(--primary)" },
} satisfies ChartConfig

export function DashboardLinhasLeadTimeMedioPorPeriodo({ filtros }: { filtros: DashFiltros }) {
  const [dados, setDados] = useState<DashLinhaLeadTime[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function carregar() {
      try {
        setIsLoading(true)
        setDados(await buscarDashLinhasLeadTimeMedioPorPeriodo(filtros))
      } catch {
        toast.error("Nao foi possivel carregar lead time medio por periodo.")
      } finally {
        setIsLoading(false)
      }
    }

    void carregar()
  }, [filtros])

  return (
    <Card>
      <CardHeader><CardTitle>Lead time medio por periodo</CardTitle></CardHeader>
      <CardContent>
        {isLoading ? <Skeleton className="h-[260px] w-full" /> : (
          <ChartContainer config={chartConfig} className="h-[260px] w-full">
            <LineChart data={dados}><CartesianGrid vertical={false} /><XAxis dataKey="periodo" tickLine={false} axisLine={false} tickMargin={8} /><ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} /><Line dataKey="lead_time_horas" type="monotone" stroke="var(--color-lead_time_horas)" strokeWidth={2} dot={false} /></LineChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
