"use client"

import type React from "react"

import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DialogFooter } from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"

export function AddMetaForm({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(false)
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth()

  const months = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ]

  const niveis = ["I", "II", "III", "IV", "V", "VI"]

  const unidades = ["Total", "Caieiras", "Francisco Morato", "Mairiporã", "SP - Perus", "Franco da Rocha"]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Simulate API call
    setTimeout(() => {
      setLoading(false)
      onClose()
    }, 1500)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="month">Período (Mês)</Label>
          <Select defaultValue={months[currentMonth]}>
            <SelectTrigger id="month" className="text-sm">
              <SelectValue placeholder="Selecione o mês" />
            </SelectTrigger>
            <SelectContent>
              {months.map((month) => (
                <SelectItem key={month} value={month}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="year">Período (Ano)</Label>
          <Select defaultValue={currentYear.toString()}>
            <SelectTrigger id="year" className="text-sm">
              <SelectValue placeholder="Selecione o ano" />
            </SelectTrigger>
            <SelectContent>
              {[currentYear - 1, currentYear, currentYear + 1, currentYear + 2].map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="nivel">Nível da meta</Label>
        <Select>
          <SelectTrigger id="nivel" className="text-sm">
            <SelectValue placeholder="Selecione o nível" />
          </SelectTrigger>
          <SelectContent>
            {niveis.map((nivel) => (
              <SelectItem key={nivel} value={nivel}>
                {nivel}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="unidade">Unidade ou total</Label>
        <Select>
          <SelectTrigger id="unidade" className="text-sm">
            <SelectValue placeholder="Selecione a unidade" />
          </SelectTrigger>
          <SelectContent>
            {unidades.map((unidade) => (
              <SelectItem key={unidade} value={unidade}>
                {unidade}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="faturamento">Faturamento (R$)</Label>
        <Input id="faturamento" type="text" placeholder="0,00" className="text-sm" />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="funcionarios">Quantidade de funcionários</Label>
        <Input id="funcionarios" type="number" min="0" placeholder="0" className="text-sm" />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="despesa">Despesa (%)</Label>
        <Input id="despesa" type="text" placeholder="0%" className="text-sm" />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="inadimplencia">Inadimplência (%)</Label>
        <Input id="inadimplencia" type="text" placeholder="0%" className="text-sm" />
      </div>

      <DialogFooter className="mt-4">
        <Button
          type="submit"
          className="bg-brand-blue hover:bg-brand-darkBlue text-white w-full sm:w-auto"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            "Salvar"
          )}
        </Button>
      </DialogFooter>
    </form>
  )
}

