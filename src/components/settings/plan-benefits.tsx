"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export function ProjectFeatures() {
  const feature = {
    title: "Multiple Model Support",
    description: "Experience the power of AI with our comprehensive model support. Seamlessly integrate with Claude, GPT-4, and other leading AI models to enhance your conversations.",
  }

  return (
    <div className="w-full max-w-5xl mx-auto">
      <Card className="p-8 bg-white dark:bg-zinc-800">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          {feature.title}
        </h2>
        <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
          {feature.description}
        </p>
        <Button
          size="lg"
          className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900"
        >
          Get Started
        </Button>
      </Card>
    </div>
  )
}
