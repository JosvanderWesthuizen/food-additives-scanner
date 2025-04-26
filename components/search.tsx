"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { fetchProductData } from "@/lib/api"
import { saveToHistory } from "@/lib/storage"

export default function Search() {
  const [barcode, setBarcode] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSearch = async (e: React.FormEvent) => {
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
    <div className="flex flex-col flex-1">
      <div className="p-4 bg-background border-b">
        <h1 className="text-2xl font-bold">Search</h1>
        <p className="text-muted-foreground">Enter a barcode to search</p>
      </div>

      <div className="p-4">
        <form onSubmit={handleSearch} className="space-y-4">
          <Input
            type="text"
            placeholder="Enter barcode number"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            inputMode="numeric"
            pattern="[0-9]*"
          />
          <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={loading}>
            {loading ? "Searching..." : "Search"}
          </Button>
        </form>
      </div>
    </div>
  )
}
