"use client"

import { ApontamentosProvider } from "@/lib/context/ApontamentosContext"
import ApontamentoResultados from "./apontamento-resultados"

export default function ApontamentoResultadosWrapper() {
  return (
    <ApontamentosProvider>
      <ApontamentoResultados />
    </ApontamentosProvider>
  )
} 