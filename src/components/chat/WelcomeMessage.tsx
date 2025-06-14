"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { useUser } from "@clerk/nextjs"
import { Sparkles, Code, GraduationCap } from "lucide-react"

interface WelcomeMessageProps {
  setInput: (input: string) => void
}

export default function WelcomeMessage({ setInput }: WelcomeMessageProps) {
  const [activeTab, setActiveTab] = useState("create")
  const { user, isLoaded } = useUser()

  const displayName = isLoaded && user ? user.firstName || user.username || "there" : "there"

  const suggestions = {
    create: [
      "Generate a creative story about space exploration",
      "Create a detailed business plan for a startup",
      "Design a marketing campaign for a new product",
    ],
    code: [
      "Best practices for error handling in async/await",
      "How to implement authentication in a React application",
      "Explain design patterns for scalable backend architecture",
    ],
    learn: [
      "Explain quantum computing in simple terms",
      "What are the key principles of machine learning?",
      "How does blockchain technology work?",
    ],
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion)
  }

  const tabConfig = {
    create: { icon: Sparkles, label: "Create" },
    code: { icon: Code, label: "Code" },
    learn: { icon: GraduationCap, label: "Learn" },
  }

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-xl mx-auto py-16 px-6">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-semibold text-foreground mb-3">Hi {displayName}! 👋</h1>
        <p className="text-muted-foreground text-lg">What would you like to explore today?</p>
      </div>

      <Tabs defaultValue="create" className="w-full" onValueChange={setActiveTab} value={activeTab}>
        <TabsList className="grid grid-cols-3 mb-8 h-12 w-full bg-muted/20 rounded-xl">
          {Object.entries(tabConfig).map(([key, { icon: Icon, label }]) => (
            <TabsTrigger
              key={key}
              value={key}
              className="flex items-center gap-2 text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg"
            >
              <Icon className="h-4 w-4" />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.entries(suggestions).map(([key, items]) => (
          <TabsContent key={key} value={key} className="w-full">
            <div className="space-y-2">
              {items.map((suggestion, index) => (
                <Card
                  key={index}
                  className="cursor-pointer hover:shadow-lg transition-all duration-300 border-0 bg-muted/30 hover:bg-muted/50 group"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <CardContent className="px-4 py-3">
                    <p className="text-sm leading-relaxed group-hover:text-foreground transition-colors duration-200">
                      {suggestion}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
