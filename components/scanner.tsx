"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { 
  initBarcodeScanner, 
  startBarcodeScanner, 
  stopBarcodeScanner, 
  onDetected,
  removeEventListeners
} from "@/lib/barcode-scanner"
import { fetchProductData } from "@/lib/api"
import { saveToHistory } from "@/lib/storage"

export default function Scanner() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [scanning, setScanning] = useState(false)
  const [loading, setLoading] = useState(false)
  const scannerInitializedRef = useRef(false)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    let stream: MediaStream | null = null

    // Only initialize the scanner once
    if (scannerInitializedRef.current) return;

    const startCamera = async () => {
      try {
        // Get camera stream
        stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: "environment",
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
        })

        if (videoRef.current) {
          // Set video source to camera stream
          videoRef.current.srcObject = stream
          
          // Wait for video to be ready
          videoRef.current.onloadedmetadata = async () => {
            try {
              if (videoRef.current) {
                // Play the video
                await videoRef.current.play()
                
                console.log("Video is playing, initializing barcode scanner")
                
                // Initialize the barcode scanner
                await initBarcodeScanner(videoRef.current, {
                  debug: true, // Enable debug for troubleshooting
                  patchSize: 'medium',
                  halfSample: true,
                  locate: true
                })
                
                // Set up barcode detection callback
                onDetected((code) => {
                  console.log("Barcode detected in callback:", code)
                  if (!loading) {
                    handleBarcode(code)
                  }
                })
                
                // Start the scanner
                startBarcodeScanner()
                setScanning(true)
                scannerInitializedRef.current = true
                console.log("Barcode scanner started successfully")
              }
            } catch (playError) {
              console.error("Error playing video:", playError)
              toast({
                title: "Video Error",
                description: "Unable to play camera stream. Please try again.",
                variant: "destructive",
              })
            }
          }
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

    // Cleanup function
    return () => {
      console.log("Cleaning up scanner component")
      
      // Stop the scanner
      if (scanning) {
        stopBarcodeScanner()
        removeEventListeners()
        console.log("Barcode scanner stopped")
      }
      
      // Stop the camera stream
      if (stream) {
        stream.getTracks().forEach((track) => {
          track.stop()
          console.log("Camera track stopped")
        })
      }
      
      setScanning(false)
      scannerInitializedRef.current = false
    }
  }, [toast]) // Only depend on toast, not on scanning or loading

  const handleBarcode = async (barcode: string) => {
    console.log("Processing barcode:", barcode)
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
        setLoading(false)
      }
    } catch (error) {
      console.error("Error fetching product data:", error)
      toast({
        title: "Error",
        description: "Failed to fetch product data. Please try again.",
        variant: "destructive",
      })
      setLoading(false)
    }
  }

  return (
    <div className="relative flex flex-col flex-1">
      <div className="p-4 bg-background border-b">
        <h1 className="text-2xl font-bold">Scan Barcode</h1>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${scanning ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <p className="text-muted-foreground">
            {scanning 
              ? "Scanner active - point at product barcode" 
              : "Starting camera..."}
          </p>
        </div>
      </div>

      <div className="relative flex-1 bg-black">
        <video 
          ref={videoRef} 
          className="absolute inset-0 w-full h-full object-cover" 
          playsInline 
          muted 
          autoPlay
        />

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
