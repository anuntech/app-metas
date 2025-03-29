"use client"

import { useState } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ProgressCard } from "./progress-card"
import { UnitCard } from "./unit-card"
import { PageHeader } from "@/components/ui/page-header"

export default function PainelResultados() {
  const [dateRange, setDateRange] = useState<{
    from: Date
    to: Date
  }>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
  })

  // Sample data for the summary cards
  const summaryData = {
    faturamento: {
      atual: 850000,
      meta: 1000000,
      restante: 150000,
      progresso: 85,
    },
    faturamentoPorFuncionario: {
      atual: 42500,
      meta: 50000,
      restante: 7500,
      progresso: 85,
    },
    despesa: {
      atual: 32,
      meta: 30,
      restante: -2,
      progresso: 94, // Lower is better for expenses
    },
    inadimplencia: {
      atual: 8,
      meta: 5,
      restante: -3,
      progresso: 63, // Lower is better for default
      valorReais: 68000,
    },
  }

  // Sample data for unit cards
  const unidades = [
    {
      nome: "Caieiras",
      faturamento: {
        atual: 220000,
        meta: 250000,
        progresso: 88,
      },
      despesa: {
        atual: 28,
        meta: 30,
        progresso: 93, // Lower is better
      },
      inadimplencia: {
        atual: 6,
        meta: 5,
        progresso: 83, // Lower is better
        valorReais: 13200,
      },
    },
    {
      nome: "Francisco Morato",
      faturamento: {
        atual: 180000,
        meta: 200000,
        progresso: 90,
      },
      despesa: {
        atual: 31,
        meta: 30,
        progresso: 97, // Lower is better
      },
      inadimplencia: {
        atual: 9,
        meta: 5,
        progresso: 56, // Lower is better
        valorReais: 16200,
      },
    },
    {
      nome: "Mairiporã",
      faturamento: {
        atual: 195000,
        meta: 220000,
        progresso: 89,
      },
      despesa: {
        atual: 29,
        meta: 30,
        progresso: 97, // Lower is better
      },
      inadimplencia: {
        atual: 7,
        meta: 5,
        progresso: 71, // Lower is better
        valorReais: 13650,
      },
    },
    {
      nome: "SP - Perus",
      faturamento: {
        atual: 155000,
        meta: 180000,
        progresso: 86,
      },
      despesa: {
        atual: 33,
        meta: 30,
        progresso: 91, // Lower is better
      },
      inadimplencia: {
        atual: 10,
        meta: 5,
        progresso: 50, // Lower is better
        valorReais: 15500,
      },
    },
    {
      nome: "Franco da Rocha",
      faturamento: {
        atual: 100000,
        meta: 150000,
        progresso: 67,
      },
      despesa: {
        atual: 35,
        meta: 30,
        progresso: 86, // Lower is better
      },
      inadimplencia: {
        atual: 8,
        meta: 5,
        progresso: 63, // Lower is better
        valorReais: 8000,
      },
    },
  ]

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const formatPeriod = (from: Date, to: Date) => {
    if (from.getMonth() === to.getMonth()) {
      return `${format(from, "dd", { locale: ptBR })} a ${format(to, "dd", { locale: ptBR })} de ${format(from, "MMMM", { locale: ptBR })}`
    } else {
      return `${format(from, "dd 'de' MMMM", { locale: ptBR })} a ${format(to, "dd 'de' MMMM", { locale: ptBR })}`
    }
  }

  return (
    <div>
      <PageHeader title="Painel de resultados" />

      <div className="container mx-auto space-y-8 px-4 sm:px-6">
        {/* Total Summary Section */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-semibold">Resumo total</h2>
              <p className="text-muted-foreground">Período: {formatPeriod(dateRange.from, dateRange.to)}</p>
            </div>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className="justify-start text-left font-normal text-brand-blue border-brand-blue text-sm"
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-brand-blue" />
                  {formatPeriod(dateRange.from, dateRange.to)}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange.from}
                  selected={dateRange}
                  onSelect={setDateRange as any}
                  numberOfMonths={1}
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Faturamento Card */}
            <ProgressCard
              title="Faturamento"
              value={formatCurrency(summaryData.faturamento.atual)}
              target={formatCurrency(summaryData.faturamento.meta)}
              progress={summaryData.faturamento.progresso}
              remaining={`${formatCurrency(summaryData.faturamento.restante)} para a meta`}
              isNegative={false}
            />

            {/* Faturamento por funcionário Card */}
            <ProgressCard
              title="Faturamento por funcionário"
              value={formatCurrency(summaryData.faturamentoPorFuncionario.atual)}
              target={formatCurrency(summaryData.faturamentoPorFuncionario.meta)}
              progress={summaryData.faturamentoPorFuncionario.progresso}
              remaining={`${formatCurrency(summaryData.faturamentoPorFuncionario.restante)} para a meta`}
              isNegative={false}
            />

            {/* Despesa Card */}
            <ProgressCard
              title="Despesa"
              value={`${summaryData.despesa.atual}%`}
              target={`Meta: ${summaryData.despesa.meta}%`}
              progress={summaryData.despesa.progresso}
              remaining={`${Math.abs(summaryData.despesa.restante)}% ${summaryData.despesa.restante < 0 ? "acima" : "abaixo"} da meta`}
              isNegative={summaryData.despesa.restante < 0}
            />

            {/* Inadimplência Card */}
            <ProgressCard
              title="Inadimplência"
              value={`${summaryData.inadimplencia.atual}%`}
              target={`Meta: ${summaryData.inadimplencia.meta}%`}
              progress={summaryData.inadimplencia.progresso}
              remaining={`${Math.abs(summaryData.inadimplencia.restante)}% ${summaryData.inadimplencia.restante < 0 ? "acima" : "abaixo"} da meta`}
              secondaryText={formatCurrency(summaryData.inadimplencia.valorReais)}
              isNegative={summaryData.inadimplencia.restante < 0}
            />
          </div>
        </div>

        {/* Units Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Unidades</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {unidades.map((unidade, index) => (
              <UnitCard
                key={index}
                name={unidade.nome}
                faturamento={{
                  atual: formatCurrency(unidade.faturamento.atual),
                  meta: formatCurrency(unidade.faturamento.meta),
                  progresso: unidade.faturamento.progresso,
                }}
                despesa={{
                  atual: `${unidade.despesa.atual}%`,
                  meta: `${unidade.despesa.meta}%`,
                  progresso: unidade.despesa.progresso,
                  isNegative: unidade.despesa.atual > unidade.despesa.meta,
                }}
                inadimplencia={{
                  atual: `${unidade.inadimplencia.atual}%`,
                  meta: `${unidade.inadimplencia.meta}%`,
                  progresso: unidade.inadimplencia.progresso,
                  valorReais: formatCurrency(unidade.inadimplencia.valorReais),
                  isNegative: unidade.inadimplencia.atual > unidade.inadimplencia.meta,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

