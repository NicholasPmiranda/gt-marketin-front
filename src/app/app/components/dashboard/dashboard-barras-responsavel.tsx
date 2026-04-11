"use client"

import { useEffect, useState } from "react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import { toast } from "sonner"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { buscarDashBarrasResponsavel } from "@/lib/dash-api"
import type { DashBarraResponsavel, DashFiltros } from "@/types/dash"

const chartConfig = { total: { label: "Total", color: "var(--primary)" } } satisfies ChartConfig

export function DashboardBarrasResponsavel({ filtros }: { filtros: DashFiltros }) {
  const [dados, setDados] = useState<DashBarraResponsavel[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function carregar() {
      try {
        setIsLoading(true)
        setDados(await buscarDashBarrasResponsavel(filtros))
      } catch {
        toast.error("Nao foi possivel carregar o grafico por responsavel.")
      } finally {
        setIsLoading(false)
      }
    }

    void carregar()
  }, [filtros])

  return (
    <Card>
      <CardHeader><CardTitle>Ranking por responsavel</CardTitle></CardHeader>
      <CardContent>
        {isLoading ? <Skeleton className="h-[260px] w-full" /> : (
          <ChartContainer config={chartConfig} className="h-[260px] w-full">
            <BarChart data={dados}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="responsavel_nome" tickLine={false} axisLine={false} tickMargin={8} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
              <Bar dataKey="total" fill="var(--color-total)" radius={8} />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
