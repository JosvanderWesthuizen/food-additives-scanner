"use client"
import { useRouter } from "next/navigation"
import { ChevronRight } from "lucide-react"
import type { Additive } from "@/lib/types"

interface AdditivesListProps {
  additives: Additive[]
}

export default function AdditivesList({ additives }: AdditivesListProps) {
  const router = useRouter()

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "high":
        return "bg-red-500"
      case "medium":
        return "bg-yellow-500"
      case "low":
        return "bg-green-500"
      default:
        return "bg-gray-500"
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

  if (additives.length === 0) {
    return (
      <div className="p-4 text-center">
        <p>No additives information available for this product.</p>
      </div>
    )
  }

  // Count additives by risk level
  const highRiskCount = additives.filter((a) => a.risk_level === "high").length
  const mediumRiskCount = additives.filter((a) => a.risk_level === "medium").length
  const lowRiskCount = additives.filter((a) => a.risk_level === "low").length

  return (
    <div className="pb-16">
      <div className="p-4 border-b">
        <h3 className="text-lg font-medium">Additives</h3>
        <p className="text-muted-foreground">
          {additives.length > 0
            ? `Contains ${additives.length} additive${additives.length > 1 ? "s" : ""}`
            : "No additives found"}
        </p>

        <div className="mt-4 space-y-2">
          {highRiskCount > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-white text-sm">
                {highRiskCount}
              </div>
              <span>High-risk</span>
            </div>
          )}

          {mediumRiskCount > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-yellow-500 flex items-center justify-center text-white text-sm">
                {mediumRiskCount}
              </div>
              <span>Limited risk</span>
            </div>
          )}

          {lowRiskCount > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-sm">
                {lowRiskCount}
              </div>
              <span>Risk-free</span>
            </div>
          )}
        </div>
      </div>

      <div>
        <h3 className="p-4 font-medium">List of additives</h3>

        <div className="divide-y">
          {additives.map((additive) => (
            <div
              key={additive.code}
              className="flex items-center justify-between p-4 cursor-pointer"
              onClick={() => router.push(`/additive/${additive.code}`)}
            >
              <div className="flex-1">
                <h4 className="font-medium">{additive.name}</h4>
                <p className="text-sm text-muted-foreground">{additive.function}</p>
              </div>

              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${getRiskColor(additive.risk_level)}`}></div>
                <span className="text-sm mr-2">{getRiskLabel(additive.risk_level)}</span>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
