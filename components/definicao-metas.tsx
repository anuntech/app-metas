"use client"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pencil, Trash2, Loader2 } from "lucide-react"
import { AddMetaForm } from "./add-meta-form"
import { EditMetaForm } from "./edit-meta-form"
import { useMetasContext } from "@/lib/context/MetasContext"
import type { Meta } from "@/lib/context/MetasContext"

export default function DefinicaoMetas() {
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedMeta, setSelectedMeta] = useState<Meta | null>(null)
  const [selectedMetaId, setSelectedMetaId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const currentYear = new Date().getFullYear()
  
  // Use the context instead of local state and API calls
  const { 
    metas, 
    loading, 
    currentYear: contextYear, 
    setCurrentYear, 
    deleteMeta,
    initializeData 
  } = useMetasContext()

  // Initialize data fetching when component mounts
  useEffect(() => {
    initializeData();
  }, []);

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

  // Handle edit button click
  const handleEdit = (meta: Meta) => {
    setSelectedMeta(meta);
    setEditDialogOpen(true);
  };

  // Open delete confirmation dialog
  const confirmDelete = (id: string) => {
    setSelectedMetaId(id);
    setDeleteDialogOpen(true);
  }

  // Handle delete button click
  const handleDelete = async () => {
    if (!selectedMetaId) return;
    
    setIsDeleting(true);
    try {
      await deleteMeta(selectedMetaId);
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error("Failed to delete meta:", error);
      alert("Erro ao excluir meta");
    } finally {
      setIsDeleting(false);
      setSelectedMetaId(null);
    }
  }

  return (
    <div>
      <div className="container mx-auto py-4 mb-6">
        <h1 className="text-2xl font-bold">Definição de metas</h1>
      </div>

      <div className="container mx-auto space-y-6 px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="w-full sm:w-64 relative">
            {loading && (
              <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
                <div className="h-4 w-4 border-2 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            <Select 
              value={contextYear.toString()} 
              onValueChange={(value) => setCurrentYear(parseInt(value))}
            >
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

          <Button className="bg-brand-blue hover:bg-brand-darkBlue text-white" onClick={() => setAddDialogOpen(true)}>
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
                  <TableRow key={meta._id} className={`transition-all duration-300 ease-in-out ${
                    selectedMetaId === meta._id && isDeleting ? "opacity-50 bg-red-50" : ""
                  }`}>
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
                          onClick={() => handleEdit(meta)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-700 hover:bg-red-100"
                          onClick={() => confirmDelete(meta._id)}
                          disabled={isDeleting && selectedMetaId === meta._id}
                        >
                          {isDeleting && selectedMetaId === meta._id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
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

        {/* Add Meta Dialog */}
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Adicionar meta</DialogTitle>
            </DialogHeader>
            <AddMetaForm onClose={() => setAddDialogOpen(false)} />
          </DialogContent>
        </Dialog>

        {/* Edit Meta Dialog */}
        {selectedMeta && (
          <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Editar meta</DialogTitle>
              </DialogHeader>
              <EditMetaForm 
                meta={selectedMeta} 
                onClose={() => {
                  setEditDialogOpen(false);
                  setSelectedMeta(null);
                }} 
              />
            </DialogContent>
          </Dialog>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={(open) => !isDeleting && setDeleteDialogOpen(open)}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Confirmar exclusão</DialogTitle>
              <DialogDescription>
                Tem certeza que deseja excluir esta meta? Esta ação não pode ser desfeita.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex space-x-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setDeleteDialogOpen(false)}
                className="flex-1"
                disabled={isDeleting}
              >
                Cancelar
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDelete}
                className="flex-1 bg-red-600 hover:bg-red-700"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Excluindo...
                  </>
                ) : (
                  'Excluir'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

