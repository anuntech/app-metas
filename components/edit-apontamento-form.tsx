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
import { useApontamentosContext, ApontamentoType } from "@/lib/context/ApontamentosContext"
import { DateRange } from "react-day-picker"

// Define a type for our form data
type ApontamentoFormData = {
  periodo: string;
  unidade: string;
  faturamento: string;
  recebimento: string;
  despesa: string;
  inadimplenciaPercentual: string;
  inadimplenciaValor: string;
  quantidadeContratos: string;
};

type EditApontamentoFormProps = {
  apontamento: typeof ApontamentoType;
  onClose: () => void;
}

export function EditApontamentoForm({ apontamento, onClose }: EditApontamentoFormProps) {
  const [loading, setLoading] = useState(false)
  
  // Parse the date strings
  const startDate = apontamento.dataInicio ? new Date(apontamento.dataInicio) : new Date();
  const endDate = apontamento.dataFim ? new Date(apontamento.dataFim) : new Date();
  
  // For date picker
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startDate,
    to: endDate
  });

  // Use the apontamentos context
  const { updateApontamento } = useApontamentosContext();

  // Removed "Total" since it will be calculated automatically
  const unidades = ["Caieiras", "Francisco Morato", "Mairiporã", "SP - Perus", "Franco da Rocha"]

  // Initialize form state with the apontamento data
  const [formData, setFormData] = useState<ApontamentoFormData>({
    periodo: apontamento.periodo,
    unidade: apontamento.unidade,
    faturamento: formatCurrencyForInput(apontamento.faturamento),
    recebimento: formatCurrencyForInput(apontamento.recebimento),
    despesa: formatCurrencyForInput(apontamento.despesa),
    inadimplenciaPercentual: formatPercentageForInput(apontamento.inadimplenciaPercentual),
    inadimplenciaValor: formatCurrencyForInput(apontamento.inadimplenciaValor),
    quantidadeContratos: (apontamento.quantidadeContratos || 0).toString()
  });

  // Format currency as user types (BRL)
  function formatCurrencyForInput(value: number | string): string {
    // Convert to string if it's a number
    const stringValue = typeof value === 'number' ? value.toString() : value;
    
    // Remove non-digit characters
    const digits = stringValue.replace(/\D/g, '');
    
    if (!digits) return '';
    
    // Convert to number and format
    const numberValue = parseInt(digits) / 100;
    return numberValue.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }
  
  // Format percentage as user types
  function formatPercentageForInput(value: number | string): string {
    // Convert to string if it's a number
    const stringValue = typeof value === 'number' ? value.toString() : value;
    
    // If it already has %, just return the value
    if (stringValue.includes('%')) return stringValue;
    
    // Remove percent sign and non-digit/non-decimal characters
    const cleaned = stringValue.replace(/[^\d.,]/g, '').replace(/,/g, '.');
    
    // Handle empty or invalid input
    if (!cleaned) return '';
    
    // Only allow one decimal point
    const parts = cleaned.split('.');
    const formatted = parts[0] + (parts.length > 1 ? '.' + parts.slice(1).join('') : '');
    
    // Add percent sign
    return formatted + '%';
  }

  // Handle input changes with formatting
  const handleChange = (field: keyof ApontamentoFormData, value: string) => {
    let formattedValue = value;
    
    // Apply specific formatting based on field type
    if (field === 'faturamento' || field === 'recebimento' || field === 'despesa' || field === 'inadimplenciaValor') {
      formattedValue = formatCurrencyForInput(value);
    } else if (field === 'inadimplenciaPercentual') {
      // Only format if not empty
      if (value) {
        formattedValue = formatPercentageForInput(value);
      }
    }
    
    // Update just the single field
    setFormData({
      ...formData,
      [field]: formattedValue
    });
  };

  // Handle date range selection
  const handleDateRangeSelect = (range: DateRange | undefined) => {
    setDateRange(range);
    
    // Update the periodo field with formatted date range
    if (range?.from) {
      let periodoText = '';
      if (range.to) {
        periodoText = `${format(range.from, "dd", { locale: ptBR })} a ${format(range.to, "dd", { locale: ptBR })} de ${format(range.from, "MMMM", { locale: ptBR })}`;
      } else {
        periodoText = format(range.from, "dd 'de' MMMM", { locale: ptBR });
      }
      
      setFormData({
        ...formData,
        periodo: periodoText
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validate required fields before submission
      if (!formData.periodo || !formData.unidade || !formData.faturamento || !formData.inadimplenciaPercentual) {
        throw new Error("Preencha todos os campos obrigatórios: Período, Unidade, Faturamento e Inadimplência (%)");
      }
      
      // Validate that dateRange has necessary values
      if (!dateRange?.from) {
        throw new Error("É necessário selecionar uma data");
      }
      
      // Get month and year from selected date
      const startDate = dateRange.from;
      const endDate = dateRange.to || startDate;
      
      // Get month name in Portuguese
      const months = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
      ];
      const monthName = months[startDate.getMonth()];
      const year = startDate.getFullYear();
      
      // Prepare payload with proper data conversion
      const payload = {
        periodo: formData.periodo,
        unidade: formData.unidade,
        faturamento: Number(formData.faturamento.replace(/\./g, '').replace(',', '.')) || 0,
        recebimento: Number(formData.recebimento.replace(/\./g, '').replace(',', '.')) || 0,
        despesa: Number(formData.despesa.replace(/\./g, '').replace(',', '.')) || 0,
        inadimplenciaPercentual: Number(formData.inadimplenciaPercentual.replace(/%/g, '').replace(',', '.')) || 0,
        inadimplenciaValor: Number(formData.inadimplenciaValor.replace(/\./g, '').replace(',', '.')) || 0,
        quantidadeContratos: Number(formData.quantidadeContratos) || 0,
        mes: monthName,
        ano: year,
        dataInicio: startDate.toISOString(),
        dataFim: endDate.toISOString()
      };

      // Use the context method to update the apontamento
      await updateApontamento(apontamento._id, payload);
      
      console.log('Apontamento atualizado com sucesso');
      
      // Close the dialog after success
      onClose();
    } catch (error) {
      // Handle error (show error message to user)
      console.error('Error updating apontamento:', error);
      alert(error instanceof Error ? error.message : 'Erro ao atualizar apontamento');
    } finally {
      setLoading(false);
    }
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
                !dateRange?.from && "text-muted-foreground",
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {formData.periodo ? formData.periodo : "Selecione um período"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={handleDateRangeSelect}
              numberOfMonths={1}
              locale={ptBR}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="unidade">Unidade ou total</Label>
        <Select
          value={formData.unidade}
          onValueChange={(value) => handleChange('unidade', value)}
        >
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
        <Input 
          id="faturamento" 
          type="text" 
          placeholder="0,00" 
          className="text-sm"
          value={formData.faturamento}
          onChange={(e) => handleChange('faturamento', e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="recebimento">Recebimento (R$)</Label>
        <Input 
          id="recebimento" 
          type="text" 
          placeholder="0,00" 
          className="text-sm"
          value={formData.recebimento}
          onChange={(e) => handleChange('recebimento', e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="despesa">Despesa (R$)</Label>
        <Input 
          id="despesa" 
          type="text" 
          placeholder="0,00" 
          className="text-sm"
          value={formData.despesa}
          onChange={(e) => handleChange('despesa', e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="quantidadeContratos">Quantidade de contratos</Label>
        <Input 
          id="quantidadeContratos" 
          type="number" 
          min="0" 
          placeholder="0" 
          className="text-sm" 
          value={formData.quantidadeContratos}
          onChange={(e) => handleChange('quantidadeContratos', e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="inadimplenciaPercentual">Inadimplência (%) *</Label>
          <Input 
            id="inadimplenciaPercentual" 
            type="text" 
            placeholder="0%" 
            className="text-sm"
            value={formData.inadimplenciaPercentual}
            onChange={(e) => handleChange('inadimplenciaPercentual', e.target.value)}
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="inadimplenciaValor">Inadimplência (R$) (opcional)</Label>
          <Input 
            id="inadimplenciaValor" 
            type="text" 
            placeholder="0,00" 
            className="text-sm"
            value={formData.inadimplenciaValor}
            onChange={(e) => handleChange('inadimplenciaValor', e.target.value)}
          />
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
            "Atualizar"
          )}
        </Button>
      </DialogFooter>
    </form>
  )
} 