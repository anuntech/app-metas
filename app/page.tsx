"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, ClipboardList, LineChart } from "lucide-react"

export default function Home() {
  const router = useRouter()

  const navigateTo = (path: string) => {
    router.push(path)
  }

  return (
    <div className="min-h-screen bg-brand-darkBlue flex items-center justify-center">
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold text-white">Sistema de Gestão</h1>
            <p className="text-gray-200 text-lg">Selecione uma das opções abaixo para continuar</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Card className="flex flex-col">
              <CardHeader>
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-brand-yellow mb-2">
                  <ClipboardList className="w-6 h-6 text-brand-blue" />
                </div>
                <CardTitle>Definição de metas</CardTitle>
                <CardDescription>Defina e gerencie metas para cada unidade e período</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground">
                  Configure metas de faturamento, despesas, inadimplência e quantidade de funcionários para cada
                  unidade.
                </p>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full bg-brand-blue hover:bg-brand-darkBlue text-white"
                  onClick={() => navigateTo("/definicao-metas")}
                >
                  Acessar
                </Button>
              </CardFooter>
            </Card>

            <Card className="flex flex-col">
              <CardHeader>
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-brand-yellow mb-2">
                  <LineChart className="w-6 h-6 text-brand-blue" />
                </div>
                <CardTitle>Apontamento de resultados</CardTitle>
                <CardDescription>Registre os resultados obtidos em cada período</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground">
                  Registre os valores de faturamento, recebimento, despesas e inadimplência para cada unidade e período.
                </p>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full bg-brand-blue hover:bg-brand-darkBlue text-white"
                  onClick={() => navigateTo("/apontamento-resultados")}
                >
                  Acessar
                </Button>
              </CardFooter>
            </Card>

            <Card className="flex flex-col">
              <CardHeader>
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-brand-yellow mb-2">
                  <BarChart3 className="w-6 h-6 text-brand-blue" />
                </div>
                <CardTitle>Painel de resultados</CardTitle>
                <CardDescription>Visualize o desempenho em relação às metas</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground">
                  Acompanhe o progresso de cada unidade em relação às metas definidas, com indicadores visuais e
                  métricas detalhadas.
                </p>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full bg-brand-blue hover:bg-brand-darkBlue text-white"
                  onClick={() => navigateTo("/painel-resultados")}
                >
                  Acessar
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

