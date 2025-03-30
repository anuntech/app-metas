"use client"

import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pencil, Trash2, Loader2 } from "lucide-react"
import { AddMetaForm } from "./add-meta-form"
import { PageHeader } from "@/components/ui/page-header"
import { useMetasContext } from "@/lib/context/MetasContext"

export default function DefinicaoMetas() {
  const [open, setOpen] = useState(false)
  const currentYear = new Date().getFullYear()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingMetaId, setDeletingMetaId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Use the context instead of local state and API calls
  const { metas, loading, currentYear: contextYear, setCurrentYear, deleteMeta } = useMetasContext()

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

  // Handle delete button click
  const handleDelete = (id: string) => {
    setDeletingMetaId(id)
    setDeleteDialogOpen(true)
  }

  // Confirm deletion
  const confirmDelete = async () => {
    if (!deletingMetaId) return

    setIsDeleting(true)
    try {
      await deleteMeta(deletingMetaId)
      setDeleteDialogOpen(false)
    } catch (error) {
      console.error("Failed to delete meta:", error)
      alert("Erro ao excluir meta")
    } finally {
      setIsDeleting(false)
      setDeletingMetaId(null)
    }
  }

  return (
    <div>
      <PageHeader title="Definição de metas" />

      <div className="container mx-auto space-y-6 px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="w-full sm:w-64 relative">
            {loading && (
              <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
                <div className="h-4 w-4 border-2 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            <Select value={contextYear.toString()} onValueChange={(value) => setCurrentYear(Number.parseInt(value))}>
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
                        <div className="h-4 w-12 bg-gray-200 rounded"></div>
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
              ) : metas.length > 0 ? (
                metas.map((meta) => (
                  <TableRow key={meta._id} className="transition-opacity duration-300 ease-in-out">
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
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-700 hover:bg-red-100"
                          onClick={() => handleDelete(meta._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                    Nenhuma meta encontrada para o ano selecionado
                  </TableCell>
                </TableRow>
              )}
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

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Confirmar exclusão</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p>Tem certeza que deseja excluir esta meta?</p>
              <p className="text-sm text-muted-foreground mt-2">Esta ação não pode ser desfeita.</p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                Cancelar
              </Button>
              <Button
                type="button"
                className="bg-red-500 hover:bg-red-600 text-white"
                onClick={confirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Excluindo...
                  </>
                ) : (
                  "Excluir"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

