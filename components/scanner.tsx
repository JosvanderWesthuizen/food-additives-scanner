"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { scanBarcode } from "@/lib/barcode-scanner"
import { fetchProductData } from "@/lib/api"
import { saveToHistory } from "@/lib/storage"

export default function Scanner() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [scanning, setScanning] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    let stream: MediaStream | null = null
    const animationFrameId: number | null = null
    let scanInterval: NodeJS.Timeout | null = null

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        })

        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
          setScanning(true)

          // Start scanning for barcodes
          scanInterval = setInterval(() => {
            if (videoRef.current && canvasRef.current && !loading) {
              const canvas = canvasRef.current
              const video = videoRef.current
              const ctx = canvas.getContext("2d")

              if (ctx) {
                canvas.width = video.videoWidth
                canvas.height = video.videoHeight
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
                const code = scanBarcode(imageData)

                if (code) {
                  handleBarcode(code)
                }
              }
            }
          }, 500) // Scan every 500ms
        }
      } catch (error) {
        console.error("Error accessing camera:", error)
        toast({
          title: "Camera Error",
          description: "Unable to access camera. Please check permissions.",
          variant: "destructive",
        })
      }
    }

    startCamera()

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
      if (scanInterval) {
        clearInterval(scanInterval)
      }
      setScanning(false)
    }
  }, [toast, loading])

  const handleBarcode = async (barcode: string) => {
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
    <div className="relative flex flex-col flex-1">
      <div className="p-4 bg-background border-b">
        <h1 className="text-2xl font-bold">Scan Barcode</h1>
        <p className="text-muted-foreground">Point camera at product barcode</p>
      </div>

      <div className="relative flex-1 bg-black">
        <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" playsInline muted />
        <canvas ref={canvasRef} className="hidden" />

        {/* Scanning overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4/5 h-1/4 border-2 border-green-500 rounded-lg"></div>
        </div>

        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-green-500" />
              <p className="text-white font-medium">Processing barcode...</p>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-background border-t">
        <Button variant="outline" className="w-full" onClick={() => router.push("/manual-entry")}>
          Enter barcode manually
        </Button>
      </div>
    </div>
  )
}
