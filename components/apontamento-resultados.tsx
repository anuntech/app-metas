"use client"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pencil, Trash2, Loader2 } from "lucide-react"
import { AddApontamentoForm } from "./add-apontamento-form"
import { EditApontamentoForm } from "./edit-apontamento-form"
import { useApontamentosContext, ApontamentoType } from "@/lib/context/ApontamentosContext"

export default function ApontamentoResultados() {
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedApontamentoId, setSelectedApontamentoId] = useState<string | null>(null)
  const [selectedApontamento, setSelectedApontamento] = useState<typeof ApontamentoType | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  
  // Use the apontamentos context
  const { 
    apontamentos, 
    loading, 
    currentMonth, 
    setCurrentMonth,
    initializeData,
    deleteApontamento
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

  // Open edit dialog
  const handleEdit = (apontamento: typeof ApontamentoType) => {
    setSelectedApontamento(apontamento);
    setSelectedApontamentoId(apontamento._id);
    setIsEditing(true);
    setEditDialogOpen(true);
  }

  // Open delete confirmation dialog
  const confirmDelete = (id: string) => {
    setSelectedApontamentoId(id);
    setDeleteDialogOpen(true);
  }

  // Handle delete button click
  const handleDelete = async () => {
    if (!selectedApontamentoId) return;
    
    setIsDeleting(true);
    try {
      await deleteApontamento(selectedApontamentoId);
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error("Failed to delete apontamento:", error);
      alert("Erro ao excluir apontamento");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="mt-10">
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

          <Button className="bg-brand-blue hover:bg-brand-darkBlue text-white" onClick={() => setAddDialogOpen(true)}>
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
                        <div className="flex space-x-2">
                          <div className="h-8 w-8 bg-gray-200 rounded"></div>
                          <div className="h-8 w-8 bg-gray-200 rounded"></div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
              ) : apontamentos.length > 0 ? (
                apontamentos.map((apontamento: typeof ApontamentoType) => (
                  <TableRow 
                    key={apontamento._id} 
                    className={`transition-all duration-300 ease-in-out ${
                      selectedApontamentoId === apontamento._id && (isDeleting || isEditing)
                        ? "opacity-50 bg-red-50"
                        : ""
                    } ${apontamento.isCalculated ? "bg-blue-50" : ""}`}
                  >
                    <TableCell>{apontamento.periodo}</TableCell>
                    <TableCell>
                      {apontamento.unidade}
                      {apontamento.isCalculated && (
                        <span className="ml-1 text-xs text-blue-600 font-medium">(Calculado)</span>
                      )}
                    </TableCell>
                    <TableCell>{formatCurrency(apontamento.faturamento)}</TableCell>
                    <TableCell>{formatCurrency(apontamento.recebimento)}</TableCell>
                    <TableCell>{formatCurrency(apontamento.despesa)}</TableCell>
                    <TableCell>{formatPercentage(apontamento.inadimplenciaPercentual)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        {!apontamento.isCalculated ? (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-brand-blue hover:text-brand-darkBlue hover:bg-brand-yellow hover:bg-opacity-20"
                              onClick={() => handleEdit(apontamento)}
                              disabled={isEditing && selectedApontamentoId === apontamento._id}
                            >
                              {isEditing && selectedApontamentoId === apontamento._id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Pencil className="h-4 w-4" />
                              )}
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-red-500 hover:text-red-700 hover:bg-red-100"
                              onClick={() => confirmDelete(apontamento._id)}
                              disabled={isDeleting && selectedApontamentoId === apontamento._id}
                            >
                              {isDeleting && selectedApontamentoId === apontamento._id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </>
                        ) : (
                          <span className="text-xs text-blue-600">Automático</span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                    Nenhum apontamento encontrado para o mês selecionado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Add Apontamento Dialog */}
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Adicionar apontamento</DialogTitle>
            </DialogHeader>
            <AddApontamentoForm onClose={() => setAddDialogOpen(false)} />
          </DialogContent>
        </Dialog>

        {/* Edit Apontamento Dialog */}
        <Dialog 
          open={editDialogOpen} 
          onOpenChange={(open) => {
            // Always allow the dialog to close
            setEditDialogOpen(open);
            
            // When closing, clear the selected apontamento and reset editing state
            if (!open) {
              setSelectedApontamento(null);
              setSelectedApontamentoId(null);
              setIsEditing(false);
            }
          }}
        >
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Editar apontamento</DialogTitle>
            </DialogHeader>
            {selectedApontamento && (
              <EditApontamentoForm 
                apontamento={selectedApontamento} 
                onClose={() => {
                  setEditDialogOpen(false);
                  setIsEditing(false);
                  setSelectedApontamento(null);
                  setSelectedApontamentoId(null);
                }}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={(open) => !isDeleting && setDeleteDialogOpen(open)}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Confirmar exclusão</DialogTitle>
              <DialogDescription>
                Tem certeza que deseja excluir este apontamento? Esta ação não pode ser desfeita.
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

