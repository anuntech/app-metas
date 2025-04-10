"use client"

interface PageHeaderProps {
  title: string
}

export function PageHeader({ title }: PageHeaderProps) {
  return (
    <div className="mb-6">
      <div className="container mx-auto py-4">
        <h1 className="text-2xl font-bold">{title}</h1>
      </div>
    </div>
  )
}

