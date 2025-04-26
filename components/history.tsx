"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getHistory } from "@/lib/storage"
import type { Product } from "@/lib/types"
import { formatDistanceToNow } from "date-fns"
import { Button } from "@/components/ui/button"

export default function History() {
  const [history, setHistory] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const loadHistory = async () => {
      const historyData = await getHistory()
      setHistory(historyData)
      setLoading(false)
    }

    loadHistory()
  }, [])

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case "Excellent":
        return "bg-green-500"
      case "Good":
        return "bg-green-500"
      case "Poor":
        return "bg-orange-500"
      case "Bad":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getTimeAgo = (timestamp: number) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true })
    } catch (error) {
      return "recently"
    }
  }

  return (
    <div className="flex flex-col flex-1">
      <div className="p-4 bg-background border-b flex items-center justify-between">
        <h1 className="text-2xl font-bold">Food Additives Scanner</h1>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <p>Loading history...</p>
        </div>
      ) : history.length === 0 ? (
        <div className="flex-1 flex items-center justify-center p-4">
          <p className="text-muted-foreground text-center">No products scanned yet. Scan a product to see it here.</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto pb-16">
          {history.map((product) => (
            <div
              key={`${product.code}-${product.timestamp}`}
              className="border-b cursor-pointer"
              onClick={() => router.push(`/product/${product.code}`)}
            >
              <div className="flex items-center p-4 gap-3">
                <div className="w-16 h-16 bg-gray-100 rounded-md flex-shrink-0 overflow-hidden">
                  {product.image_url ? (
                    <img
                      src={product.image_url || "/placeholder.svg"}
                      alt={product.product_name}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">No image</div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">{product.product_name}</h3>
                  <p className="text-sm text-muted-foreground truncate">{product.brands}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`inline-block w-3 h-3 rounded-full ${getRatingColor(product.rating)}`}></span>
                    <span className="text-sm">{product.rating}</span>
                    <span className="text-xs text-muted-foreground ml-auto">{getTimeAgo(product.timestamp)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
