"use client"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pencil, Trash2 } from "lucide-react"
import { AddMetaForm } from "./add-meta-form"
import { PageHeader } from "@/components/ui/page-header"

// Define the Meta type to fix TypeScript errors
type Meta = {
  _id: string;
  mes: string;
  ano: number;
  unidade: string;
  faturamento: number;
  funcionarios: number;
  despesa: number;
  inadimplencia: number;
  nivel: string;
}

export default function DefinicaoMetas() {
  const [open, setOpen] = useState(false)
  const currentYear = new Date().getFullYear()
  const [selectedYear, setSelectedYear] = useState(currentYear.toString())
  const [metas, setMetas] = useState<Meta[]>([])

  // Format currency values (BRL)
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(value);
  }

  // Format percentage values
  const formatPercentage = (value: number) => {
    return `${value}%`;
  }

  useEffect(() => {
    const fetchMetas = async () => {
      try {
        const response = await fetch(`/api/metas/search?ano=${selectedYear}`);
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        const data = await response.json();
        setMetas(data); 
      } catch (error) {
        console.error('Failed to fetch metas:', error);
        return [];
      }
    };

    fetchMetas();    
  }, [selectedYear]);

  return (
    <div>
      <PageHeader title="Definição de metas" />

      <div className="container mx-auto space-y-6 px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="w-full sm:w-64">
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o ano" />
              </SelectTrigger>
              <SelectContent>
                {[currentYear - 2, currentYear - 1, currentYear, currentYear + 1, currentYear + 2].map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button className="bg-brand-blue hover:bg-brand-darkBlue text-white" onClick={() => setOpen(true)}>
            Adicionar meta
          </Button>
        </div>

        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-brand-blue bg-opacity-10">
                <TableHead>Mês</TableHead>
                <TableHead>Unidade</TableHead>
                <TableHead>Faturamento</TableHead>
                <TableHead>Funcionários</TableHead>
                <TableHead>Despesa</TableHead>
                <TableHead>Inadimplência</TableHead>
                <TableHead>Nível</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {metas.map((meta) => (
                <TableRow key={meta._id}>
                  <TableCell>{meta.mes}</TableCell>
                  <TableCell>{meta.unidade}</TableCell>
                  <TableCell>{formatCurrency(meta.faturamento)}</TableCell>
                  <TableCell>{meta.funcionarios}</TableCell>
                  <TableCell>{formatPercentage(meta.despesa)}</TableCell>
                  <TableCell>{formatPercentage(meta.inadimplencia)}</TableCell>
                  <TableCell>{meta.nivel}</TableCell>
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
              <DialogTitle>Adicionar meta</DialogTitle>
            </DialogHeader>
            <AddMetaForm onClose={() => setOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

