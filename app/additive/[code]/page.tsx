"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import { getAdditiveDetails } from "@/lib/api"
import type { Additive } from "@/lib/types"

export default function AdditivePage() {
  const params = useParams()
  const router = useRouter()
  const [additive, setAdditive] = useState<Additive | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadAdditive = async () => {
      if (typeof params.code === "string") {
        try {
          const additiveData = await getAdditiveDetails(params.code)
          setAdditive(additiveData)
        } catch (error) {
          console.error("Error loading additive:", error)
        } finally {
          setLoading(false)
        }
      }
    }

    loadAdditive()
  }, [params.code])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading additive information...</p>
      </div>
    )
  }

  if (!additive) {
    return (
      <div className="flex min-h-screen flex-col p-4">
        <Button variant="ghost" className="w-fit p-0 h-auto mb-4" onClick={() => router.back()}>
          <ChevronLeft className="h-5 w-5 mr-1" />
          Back
        </Button>
        <div className="flex-1 flex flex-col items-center justify-center">
          <p className="text-center mb-4">Additive not found</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    )
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "high":
        return "bg-red-500 text-white"
      case "medium":
        return "bg-yellow-500 text-white"
      case "low":
        return "bg-green-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  const getRiskLabel = (risk: string) => {
    switch (risk) {
      case "high":
        return "High-risk"
      case "medium":
        return "Limited risk"
      case "low":
        return "Risk-free"
      default:
        return "Unknown risk"
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="p-4 bg-background border-b flex items-center">
        <Button variant="ghost" className="p-2 h-auto mr-2" onClick={() => router.back()}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-medium">Additive</h1>
      </div>

      <div className="p-4">
        <h2 className="text-2xl font-bold">{additive.name}</h2>
        <div
          className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 ${getRiskColor(additive.risk_level)}`}
        >
          {getRiskLabel(additive.risk_level)}
        </div>
      </div>

      <div className="p-4 border-t border-b">
        <div className="bg-blue-50 rounded-lg p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
            <span className="text-xl font-bold">i</span>
          </div>
          <div>
            <h3 className="font-medium">{additive.function}</h3>
            <p className="text-sm text-muted-foreground">{additive.purpose}</p>
          </div>
        </div>
      </div>

      {additive.health_risks && additive.health_risks.length > 0 && (
        <div className="p-4">
          <h3 className="font-medium mb-3">Potential associated risks</h3>
          <div className="grid grid-cols-2 gap-3">
            {additive.health_risks.map((risk, index) => (
              <div key={index} className="border rounded-lg p-3 flex flex-col items-center text-center">
                <div className="w-10 h-10 mb-2 flex items-center justify-center">{risk.icon}</div>
                <span className="text-sm">{risk.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {additive.description && (
        <div className="p-4 border-t">
          <p className="text-sm leading-relaxed">{additive.description}</p>

          <div className="flex gap-3 mt-6">
            <Button variant="outline" className="flex-1 text-green-600 border-green-600">
              Learn more
            </Button>
            <Button variant="outline" className="flex-1">
              Scientific sources
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
