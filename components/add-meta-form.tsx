"use client"

import type React from "react"

import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DialogFooter } from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"
import { useMetasContext } from "@/lib/context/MetasContext"

// Define a type for our form data
type MetaFormData = {
  mes: string;
  ano: string;
  nivel: string;
  unidade: string;
  faturamento: string;
  funcionarios: string;
  despesa: string;
  inadimplencia: string;
};

export function AddMetaForm({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(false)
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth()
  
  // Use the context instead of local API calls
  const { addMeta } = useMetasContext()

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

  const niveis = ["I", "II", "III", "IV"]

  const unidades = ["Total", "Caieiras", "Francisco Morato", "Mairiporã", "SP - Perus", "Franco da Rocha"]

  // Initialize form state
  const [formData, setFormData] = useState<MetaFormData>({
    mes: months[currentMonth],
    ano: currentYear.toString(),
    nivel: '',
    unidade: '',
    faturamento: '',
    funcionarios: '',
    despesa: '',
    inadimplencia: ''
  });

  // Handle input changes
  const handleChange = (field: keyof MetaFormData, value: string) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validate required fields before submission
      if (!formData.mes || !formData.ano || !formData.unidade || !formData.nivel) {
        throw new Error("Preencha todos os campos obrigatórios: Mês, Ano, Unidade e Nível");
      }
      
      // Prepare payload with proper data conversion
      const payload = {
        mes: formData.mes,
        ano: parseInt(formData.ano),
        unidade: formData.unidade,
        nivel: formData.nivel,
        // Use Number() with fallbacks for numeric fields
        faturamento: Number(formData.faturamento.replace(/\./g, '').replace(',', '.')) || 0,
        funcionarios: Number(formData.funcionarios) || 0,
        despesa: Number(formData.despesa.replace('%', '').replace(',', '.')) || 0,
        inadimplencia: Number(formData.inadimplencia.replace('%', '').replace(',', '.')) || 0
      };

      // Use the context method instead of direct API call
      await addMeta(payload);
      
      console.log('Meta criada com sucesso');
      
      // Close the dialog after success
      onClose();
    } catch (error) {
      // Handle error (show error message to user)
      console.error('Error creating meta:', error);
      alert(error instanceof Error ? error.message : 'Erro ao criar meta');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="month">Período (Mês)</Label>
          <Select 
            value={formData.mes} 
            onValueChange={(value) => handleChange('mes', value)}
          >
            <SelectTrigger id="month" className="text-sm">
              <SelectValue placeholder="Selecione o mês" />
            </SelectTrigger>
            <SelectContent>
              {months.map((month) => (
                <SelectItem key={month} value={month}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="year">Período (Ano)</Label>
          <Select 
            value={formData.ano}
            onValueChange={(value) => handleChange('ano', value)}
          >
            <SelectTrigger id="year" className="text-sm">
              <SelectValue placeholder="Selecione o ano" />
            </SelectTrigger>
            <SelectContent>
              {[currentYear - 1, currentYear, currentYear + 1, currentYear + 2].map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
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
        <Label htmlFor="funcionarios">Quantidade de funcionários</Label>
        <Input 
          id="funcionarios" 
          type="number" 
          min="0" 
          placeholder="0" 
          className="text-sm" 
          value={formData.funcionarios}
          onChange={(e) => handleChange('funcionarios', e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="despesa">Despesa (%)</Label>
        <Input 
          id="despesa" 
          type="text" 
          placeholder="0%" 
          className="text-sm" 
          value={formData.despesa}
          onChange={(e) => handleChange('despesa', e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="inadimplencia">Inadimplência (%)</Label>
        <Input 
          id="inadimplencia" 
          type="text" 
          placeholder="0%" 
          className="text-sm" 
          value={formData.inadimplencia}
          onChange={(e) => handleChange('inadimplencia', e.target.value)}
        />
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

