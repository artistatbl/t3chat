"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export function ProjectFeatures() {
  const features = [
    {
      title: "Multiple Model Support",
      description: "Compatible with various AI models including Claude, GPT-4, and more!",
    },
    {
      title: "Flexible Usage",
      description: "Configure your own usage limits based on your API provider settings.",
    },
    {
      title: "Community Support",
      description: "Get help from our active open source community through GitHub issues and discussions!",
    },
  ]

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-16">
      {/* Header Section */}
      <div className="text-center space-y-4 mb-12">
        <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white">Project Features</h2>
        <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
          Discover what makes our platform special
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {features.map((feature, index) => (
          <Card key={index} className="p-6 border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800">
            <div className="space-y-4">
              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{index + 1}</span>
              </div>

              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{feature.title}</h3>

              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{feature.description}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* CTA Section */}
      <div className="text-center space-y-4">
        <Button
          size="lg"
          className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-3 text-base font-medium"
        >
          Get Started
        </Button>

        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          *Some features may require API keys from third-party providers.
        </p>
      </div>
    </div>
  )
}
