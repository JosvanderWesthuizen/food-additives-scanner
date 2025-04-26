import type { Product } from "./types"

const HISTORY_KEY = "food-scanner-history"
const MAX_HISTORY_ITEMS = 100

// Function to save a product to scan history
export async function saveToHistory(product: Product): Promise<void> {
  try {
    // Get existing history
    const history = await getHistory()

    // Check if product already exists in history
    const existingIndex = history.findIndex((item) => item.code === product.code)

    if (existingIndex !== -1) {
      // Update existing entry with new timestamp
      history[existingIndex] = {
        ...product,
        timestamp: Date.now(),
      }
    } else {
      // Add new entry
      history.unshift({
        ...product,
        timestamp: Date.now(),
      })

      // Limit history size
      if (history.length > MAX_HISTORY_ITEMS) {
        history.pop()
      }
    }

    // Save updated history
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
  } catch (error) {
    console.error("Error saving to history:", error)
  }
}

// Function to get scan history
export async function getHistory(): Promise<Product[]> {
  try {
    const historyJson = localStorage.getItem(HISTORY_KEY)
    if (!historyJson) {
      return []
    }

    const history = JSON.parse(historyJson)

    // Ensure it's an array
    if (!Array.isArray(history)) {
      return []
    }

    // Sort by timestamp (newest first)
    return history.sort((a, b) => b.timestamp - a.timestamp)
  } catch (error) {
    console.error("Error getting history:", error)
    return []
  }
}

// Function to clear scan history
export async function clearHistory(): Promise<void> {
  try {
    localStorage.removeItem(HISTORY_KEY)
  } catch (error) {
    console.error("Error clearing history:", error)
  }
}

// Function to remove a specific item from history
export async function removeFromHistory(code: string): Promise<void> {
  try {
    const history = await getHistory()
    const updatedHistory = history.filter((item) => item.code !== code)
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory))
  } catch (error) {
    console.error("Error removing from history:", error)
  }
}
