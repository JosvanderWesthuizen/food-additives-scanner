"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronLeft, Star } from "lucide-react"
import { fetchProductData } from "@/lib/api"
import type { Product } from "@/lib/types"
import AdditivesList from "@/components/additives-list"
import NutritionInfo from "@/components/nutrition-info"

export default function ProductPage() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadProduct = async () => {
      if (typeof params.code === "string") {
        try {
          const productData = await fetchProductData(params.code)
          setProduct(productData)
        } catch (error) {
          console.error("Error loading product:", error)
        } finally {
          setLoading(false)
        }
      }
    }

    loadProduct()
  }, [params.code])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading product information...</p>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="flex min-h-screen flex-col p-4">
        <Button variant="ghost" className="w-fit p-0 h-auto mb-4" onClick={() => router.back()}>
          <ChevronLeft className="h-5 w-5 mr-1" />
          Back
        </Button>
        <div className="flex-1 flex flex-col items-center justify-center">
          <p className="text-center mb-4">Product not found</p>
          <Button onClick={() => router.push("/")}>Return to Scanner</Button>
        </div>
      </div>
    )
  }

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case "Excellent":
        return "bg-green-500 text-white"
      case "Good":
        return "bg-green-500 text-white"
      case "Poor":
        return "bg-orange-500 text-white"
      case "Bad":
        return "bg-red-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  const getRatingScore = (rating: string) => {
    switch (rating) {
      case "Excellent":
        return "100/100"
      case "Good":
        return "75/100"
      case "Poor":
        return "40/100"
      case "Bad":
        return "10/100"
      default:
        return "N/A"
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="p-4 bg-background border-b flex items-center">
        <Button variant="ghost" className="p-2 h-auto mr-2" onClick={() => router.back()}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-medium truncate">{product.product_name}</h1>
        <Button variant="ghost" size="icon" className="ml-auto">
          <Star className="h-5 w-5" />
        </Button>
      </div>

      <div className="p-4 flex items-center gap-4 border-b">
        <div className="w-24 h-24 bg-gray-100 rounded-md flex-shrink-0 overflow-hidden">
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

        <div className="flex-1">
          <h2 className="font-medium">{product.product_name}</h2>
          <p className="text-sm text-muted-foreground">{product.brands}</p>

          <div className="flex items-center gap-2 mt-2">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${getRatingColor(product.rating)}`}>
              {getRatingScore(product.rating)}
            </div>
            <span className="text-sm font-medium">{product.rating}</span>
          </div>
        </div>
      </div>

      <Tabs defaultValue="additives" className="flex-1">
        <TabsList className="grid grid-cols-2 p-0 h-12">
          <TabsTrigger value="additives">Additives</TabsTrigger>
          <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
        </TabsList>

        <TabsContent value="additives" className="flex-1 p-0 mt-0">
          <AdditivesList additives={product.additives} />
        </TabsContent>

        <TabsContent value="nutrition" className="flex-1 p-0 mt-0">
          <NutritionInfo product={product} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
