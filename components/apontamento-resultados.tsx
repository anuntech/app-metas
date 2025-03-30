"use client"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pencil, Trash2 } from "lucide-react"
import { AddApontamentoForm } from "./add-apontamento-form"
import { PageHeader } from "@/components/ui/page-header"
import { useApontamentosContext, ApontamentoType } from "@/lib/context/ApontamentosContext"

export default function ApontamentoResultados() {
  const [open, setOpen] = useState(false)
  
  // Use the apontamentos context
  const { 
    apontamentos, 
    loading, 
    currentMonth, 
    setCurrentMonth,
    initializeData
  } = useApontamentosContext();

  // Initialize data fetching when component mounts
  useEffect(() => {
    initializeData();
  }, []);

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

  // Format currency values (BRL)
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  // Format percentage values
  const formatPercentage = (value: number) => {
    return `${value}%`
  }

  return (
    <div>
      <PageHeader title="Apontamento de resultados" />

      <div className="container mx-auto space-y-6 px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="w-full sm:w-64 relative">
            {loading && (
              <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
                <div className="h-4 w-4 border-2 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            <Select value={currentMonth.toString()} onValueChange={(value) => setCurrentMonth(parseInt(value))}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o mês" />
              </SelectTrigger>
              <SelectContent>
                {months.map((month, index) => (
                  <SelectItem key={index} value={index.toString()}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button className="bg-brand-blue hover:bg-brand-darkBlue text-white" onClick={() => setOpen(true)}>
            Adicionar apontamento
          </Button>
        </div>

        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-brand-blue bg-opacity-10">
                <TableHead>Período</TableHead>
                <TableHead>Unidade</TableHead>
                <TableHead>Faturamento</TableHead>
                <TableHead>Recebimento</TableHead>
                <TableHead>Despesa</TableHead>
                <TableHead>Inadimplência</TableHead>
                <TableHead>Nível</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                // Loading skeleton rows
                Array(5)
                  .fill(0)
                  .map((_, index) => (
                    <TableRow key={`skeleton-${index}`} className="animate-pulse">
                      <TableCell>
                        <div className="h-4 w-16 bg-gray-200 rounded"></div>
                      </TableCell>
                      <TableCell>
                        <div className="h-4 w-24 bg-gray-200 rounded"></div>
                      </TableCell>
                      <TableCell>
                        <div className="h-4 w-28 bg-gray-200 rounded"></div>
                      </TableCell>
                      <TableCell>
                        <div className="h-4 w-28 bg-gray-200 rounded"></div>
                      </TableCell>
                      <TableCell>
                        <div className="h-4 w-16 bg-gray-200 rounded"></div>
                      </TableCell>
                      <TableCell>
                        <div className="h-4 w-16 bg-gray-200 rounded"></div>
                      </TableCell>
                      <TableCell>
                        <div className="h-4 w-20 bg-gray-200 rounded"></div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <div className="h-8 w-8 bg-gray-200 rounded"></div>
                          <div className="h-8 w-8 bg-gray-200 rounded"></div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
              ) : apontamentos.length > 0 ? (
                apontamentos.map((apontamento: typeof ApontamentoType) => (
                  <TableRow key={apontamento._id} className="transition-opacity duration-300 ease-in-out">
                    <TableCell>{apontamento.periodo}</TableCell>
                    <TableCell>{apontamento.unidade}</TableCell>
                    <TableCell>{formatCurrency(apontamento.faturamento)}</TableCell>
                    <TableCell>{formatCurrency(apontamento.recebimento)}</TableCell>
                    <TableCell>{formatCurrency(apontamento.despesa)}</TableCell>
                    <TableCell>{formatPercentage(apontamento.inadimplenciaPercentual)}</TableCell>
                    <TableCell>{apontamento.nivel}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-brand-blue hover:text-brand-darkBlue hover:bg-brand-yellow hover:bg-opacity-20"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-100">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                    Nenhum apontamento encontrado para o mês selecionado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Adicionar apontamento</DialogTitle>
            </DialogHeader>
            <AddApontamentoForm onClose={() => setOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

