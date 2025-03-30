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
import { useApontamentosContext } from "@/lib/context/ApontamentosContext"
import { DateRange } from "react-day-picker"

// Define a type for our form data
type ApontamentoFormData = {
  periodo: string;
  nivel: string;
  unidade: string;
  faturamento: string;
  recebimento: string;
  despesa: string;
  inadimplenciaPercentual: string;
  inadimplenciaValor: string;
};

export function AddApontamentoForm({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(false)
  const [dateRange, setDateRange] = useState<DateRange | undefined>()

  // Use the apontamentos context
  const { addApontamento } = useApontamentosContext();

  const niveis = ["I", "II", "III", "IV"]

  const unidades = ["Total", "Caieiras", "Francisco Morato", "Mairiporã", "SP - Perus", "Franco da Rocha"]

  // Initialize form state
  const [formData, setFormData] = useState<ApontamentoFormData>({
    periodo: '',
    nivel: '',
    unidade: '',
    faturamento: '',
    recebimento: '',
    despesa: '',
    inadimplenciaPercentual: '',
    inadimplenciaValor: '',
  });

  // Format currency as user types (BRL)
  const formatCurrencyInput = (value: string): string => {
    // Remove non-digit characters
    const digits = value.replace(/\D/g, '');
    
    if (!digits) return '';
    
    // Convert to number and format
    const numberValue = parseInt(digits) / 100;
    return numberValue.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };
  
  // Format percentage as user types
  const formatPercentageInput = (value: string): string => {
    // Remove percent sign and non-digit/non-decimal characters
    const cleaned = value.replace(/[^\d.,]/g, '').replace(/,/g, '.');
    
    // Handle empty or invalid input
    if (!cleaned) return '';
    
    // Only allow one decimal point
    const parts = cleaned.split('.');
    const formatted = parts[0] + (parts.length > 1 ? '.' + parts.slice(1).join('') : '');
    
    // Add percent sign
    return formatted + '%';
  };

  // Handle input changes with formatting
  const handleChange = (field: keyof ApontamentoFormData, value: string) => {
    let formattedValue = value;
    
    // Apply specific formatting based on field type
    if (field === 'faturamento' || field === 'recebimento' || field === 'despesa' || field === 'inadimplenciaValor') {
      formattedValue = formatCurrencyInput(value);
    } else if (field === 'inadimplenciaPercentual') {
      // Only format if not empty
      if (value) {
        formattedValue = formatPercentageInput(value);
      }
    }
    
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
      if (!formData.periodo || !formData.unidade || !formData.nivel) {
        throw new Error("Preencha todos os campos obrigatórios: Período, Unidade e Nível");
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
        nivel: formData.nivel,
        // Parse numeric values from formatted strings
        faturamento: Number(formData.faturamento.replace(/\./g, '').replace(',', '.')) || 0,
        recebimento: Number(formData.recebimento.replace(/\./g, '').replace(',', '.')) || 0,
        despesa: Number(formData.despesa.replace(/\./g, '').replace(',', '.')) || 0,
        inadimplenciaPercentual: Number(formData.inadimplenciaPercentual.replace(/%/g, '').replace(',', '.')) || 0,
        inadimplenciaValor: Number(formData.inadimplenciaValor.replace(/\./g, '').replace(',', '.')) || 0,
        // Add required fields for the API
        mes: monthName,
        ano: year,
        dataInicio: startDate.toISOString(),
        dataFim: endDate.toISOString()
      };

      // Use the context method for adding apontamento
      await addApontamento(payload);
      
      console.log('Apontamento criado com sucesso');
      
      // Close the dialog after success
      onClose();
    } catch (error) {
      // Handle error (show error message to user)
      console.error('Error creating apontamento:', error);
      alert(error instanceof Error ? error.message : 'Erro ao criar apontamento');
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
        <Label htmlFor="nivel">Nível da meta</Label>
        <Select
          value={formData.nivel}
          onValueChange={(value) => handleChange('nivel', value)}
        >
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="inadimplenciaPercentual">Inadimplência (%)</Label>
          <Input 
            id="inadimplenciaPercentual" 
            type="text" 
            placeholder="0%" 
            className="text-sm"
            value={formData.inadimplenciaPercentual}
            onChange={(e) => handleChange('inadimplenciaPercentual', e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="inadimplenciaValor">Inadimplência (R$)</Label>
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
            "Salvar"
          )}
        </Button>
      </DialogFooter>
    </form>
  )
}

