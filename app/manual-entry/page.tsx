"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { ChevronLeft } from "lucide-react"
import { fetchProductData } from "@/lib/api"
import { saveToHistory } from "@/lib/storage"

export default function ManualEntryPage() {
  const [barcode, setBarcode] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!barcode.trim()) {
      toast({
        title: "Error",
        description: "Please enter a barcode",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const productData = await fetchProductData(barcode)
      if (productData) {
        // Save to history
        await saveToHistory(productData)
        // Navigate to product page
        router.push(`/product/${barcode}`)
      } else {
        toast({
          title: "Product Not Found",
          description: "This product was not found in the database.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching product data:", error)
      toast({
        title: "Error",
        description: "Failed to fetch product data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <div className="p-4 bg-background border-b flex items-center">
        <Button variant="ghost" className="p-2 h-auto mr-2" onClick={() => router.back()}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-medium">Manual Entry</h1>
      </div>

      <div className="p-4 flex-1">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="barcode" className="text-sm font-medium">
              Enter Barcode Number
            </label>
            <Input
              id="barcode"
              type="text"
              placeholder="e.g., 5449000000996"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              inputMode="numeric"
              pattern="[0-9]*"
            />
          </div>

          <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={loading}>
            {loading ? "Searching..." : "Search Product"}
          </Button>
        </form>

        <div className="mt-8">
          <h2 className="text-lg font-medium mb-4">Popular Barcodes</h2>
          <div className="space-y-2">
            {[
              { code: "3017620422003", name: "Nutella" },
              { code: "5449000000996", name: "Coca-Cola" },
              { code: "8000500310427", name: "Ferrero Rocher" },
              { code: "3168930010265", name: "Lay's Classic" },
            ].map((item) => (
              <Button
                key={item.code}
                variant="outline"
                className="w-full justify-between"
                onClick={() => setBarcode(item.code)}
              >
                <span>{item.name}</span>
                <span className="text-muted-foreground">{item.code}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
