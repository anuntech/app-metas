"use client"

import type React from "react"

import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DialogFooter } from "@/components/ui/dialog"
import { Loader2, CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export function AddApontamentoForm({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(false)
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined
    to: Date | undefined
  }>({
    from: undefined,
    to: undefined,
  })

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
      <div className="space-y-1.5">
        <Label htmlFor="periodo">Período</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="periodo"
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal text-sm",
                !dateRange.from && "text-muted-foreground",
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "dd", { locale: ptBR })} a {format(dateRange.to, "dd", { locale: ptBR })} de{" "}
                    {format(dateRange.from, "MMMM", { locale: ptBR })}
                  </>
                ) : (
                  format(dateRange.from, "dd 'de' MMMM", { locale: ptBR })
                )
              ) : (
                "Selecione um período"
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange.from}
              selected={dateRange}
              onSelect={setDateRange}
              numberOfMonths={1}
              locale={ptBR}
            />
          </PopoverContent>
        </Popover>
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
        <Label htmlFor="recebimento">Recebimento (R$)</Label>
        <Input id="recebimento" type="text" placeholder="0,00" className="text-sm" />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="despesa">Despesa (R$)</Label>
        <Input id="despesa" type="text" placeholder="0,00" className="text-sm" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="inadimplenciaPercentual">Inadimplência (%)</Label>
          <Input id="inadimplenciaPercentual" type="text" placeholder="0%" className="text-sm" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="inadimplenciaValor">Inadimplência (R$)</Label>
          <Input id="inadimplenciaValor" type="text" placeholder="0,00" className="text-sm" />
        </div>
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

