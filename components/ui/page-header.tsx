"use client"

import { Home } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

interface PageHeaderProps {
  title: string
}

export function PageHeader({ title }: PageHeaderProps) {
  const router = useRouter()

  return (
    <div className="bg-brand-blue border-b border-brand-yellow mb-6">
      <div className="container mx-auto py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">{title}</h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/")}
          title="Voltar para a página inicial"
          className="text-white hover:bg-brand-darkBlue"
        >
          <Home className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}

