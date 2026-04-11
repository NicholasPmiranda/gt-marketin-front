"use client"

import { Dispatch, SetStateAction } from "react"

import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { DashFiltros, DashPeriodo } from "@/types/dash"

type DashboardFiltrosProps = {
  filtros: DashFiltros
  setFiltros: Dispatch<SetStateAction<DashFiltros>>
}

export function DashboardFiltros({ filtros, setFiltros }: DashboardFiltrosProps) {
  function atualizarCampo<K extends keyof DashFiltros>(campo: K, valor: DashFiltros[K]) {
    setFiltros((prev) => ({ ...prev, [campo]: valor }))
  }

  return (
    <div className="grid grid-cols-1 gap-3 px-4 lg:grid-cols-6 lg:px-6">
      <Input
        placeholder="Projeto ID"
        type="number"
        value={filtros.projetoId ?? ""}
        onChange={(event) => {
          const value = Number(event.target.value)
          atualizarCampo("projetoId", Number.isNaN(value) || value <= 0 ? undefined : value)
        }}
      />
      <Input
        placeholder="Setor ID"
        type="number"
        value={filtros.setorId ?? ""}
        onChange={(event) => {
          const value = Number(event.target.value)
          atualizarCampo("setorId", Number.isNaN(value) || value <= 0 ? undefined : value)
        }}
      />
      <Input
        placeholder="Data inicio"
        type="date"
        value={filtros.dataInicio ?? ""}
        onChange={(event) => atualizarCampo("dataInicio", event.target.value || undefined)}
      />
      <Input
        placeholder="Data fim"
        type="date"
        value={filtros.dataFim ?? ""}
        onChange={(event) => atualizarCampo("dataFim", event.target.value || undefined)}
      />
      <Select
        value={filtros.periodo ?? "mes"}
        onValueChange={(value) => atualizarCampo("periodo", (value as DashPeriodo) ?? "mes")}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Periodo" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="dia">Dia</SelectItem>
            <SelectItem value="semana">Semana</SelectItem>
            <SelectItem value="mes">Mes</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
      <Input
        placeholder="Limite"
        type="number"
        value={filtros.limite ?? ""}
        onChange={(event) => {
          const value = Number(event.target.value)
          if (Number.isNaN(value) || value <= 0) {
            atualizarCampo("limite", undefined)
            return
          }

          atualizarCampo("limite", Math.min(20, value))
        }}
      />
    </div>
  )
}
