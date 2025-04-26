"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showInstallButton, setShowInstallButton] = useState(false)

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault()
      // Stash the event so it can be triggered later
      setDeferredPrompt(e)
      // Update UI to notify the user they can install the PWA
      setShowInstallButton(true)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = () => {
    // Hide the app provided install promotion
    setShowInstallButton(false)
    // Show the install prompt
    deferredPrompt.prompt()
    // Wait for the user to respond to the prompt
    deferredPrompt.userChoice.then((choiceResult: { outcome: string }) => {
      if (choiceResult.outcome === "accepted") {
        console.log("User accepted the install prompt")
      } else {
        console.log("User dismissed the install prompt")
      }
      // We no longer need the prompt. Clear it up.
      setDeferredPrompt(null)
    })
  }

  if (!showInstallButton) {
    return null
  }

  return (
    <div className="fixed bottom-20 left-0 right-0 p-4 bg-background border-t z-40">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">Install App</h3>
          <p className="text-sm text-muted-foreground">Add to home screen for offline use</p>
        </div>
        <Button onClick={handleInstallClick} className="bg-green-600 hover:bg-green-700">
          Install
        </Button>
      </div>
    </div>
  )
}
