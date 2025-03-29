"use client"

import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pencil, Trash2 } from "lucide-react"
import { AddApontamentoForm } from "./add-apontamento-form"
import { PageHeader } from "@/components/ui/page-header"

export default function ApontamentoResultados() {
  const [open, setOpen] = useState(false)
  const currentMonth = new Date().getMonth()
  const [selectedMonth, setSelectedMonth] = useState(currentMonth.toString())

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

  // Sample data for the table
  const apontamentos = [
    {
      id: 1,
      periodo: "01 a 15 de março",
      unidade: "Caieiras",
      faturamento: "R$ 60.000,00",
      recebimento: "R$ 55.000,00",
      despesa: "R$ 21.000,00",
      inadimplenciaPercentual: "8%",
      nivel: "II",
    },
    {
      id: 2,
      periodo: "16 a 31 de março",
      unidade: "Franco da Rocha",
      faturamento: "R$ 48.000,00",
      recebimento: "R$ 42.000,00",
      despesa: "R$ 15.360,00",
      inadimplenciaPercentual: "12%",
      nivel: "III",
    },
    {
      id: 3,
      periodo: "01 a 31 de março",
      unidade: "Mairiporã",
      faturamento: "R$ 110.000,00",
      recebimento: "R$ 98.000,00",
      despesa: "R$ 33.000,00",
      inadimplenciaPercentual: "11%",
      nivel: "IV",
    },
  ]

  return (
    <div>
      <PageHeader title="Apontamento de resultados" />

      <div className="container mx-auto space-y-6 px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="w-full sm:w-64">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
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
              {apontamentos.map((apontamento) => (
                <TableRow key={apontamento.id}>
                  <TableCell>{apontamento.periodo}</TableCell>
                  <TableCell>{apontamento.unidade}</TableCell>
                  <TableCell>{apontamento.faturamento}</TableCell>
                  <TableCell>{apontamento.recebimento}</TableCell>
                  <TableCell>{apontamento.despesa}</TableCell>
                  <TableCell>{apontamento.inadimplenciaPercentual}</TableCell>
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
              ))}
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

