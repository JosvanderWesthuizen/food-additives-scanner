export interface Product {
  code: string
  product_name: string
  brands: string
  image_url?: string
  additives: Additive[]
  nutriments: {
    energy?: {
      value: number
      unit: string
      level: string
    }
    fat?: {
      value: number
      unit: string
      level: string
    }
    sugars?: {
      value: number
      unit: string
      level: string
    }
    salt?: {
      value: number
      unit: string
      level: string
    }
    [key: string]: any
  }
  rating: string
  rating_score: number
  timestamp: number
}

export interface Additive {
  code: string
  name: string
  function: string
  purpose?: string
  risk_level: string // "high", "medium", "low"
  description?: string
  health_risks?: {
    name: string
    icon: string
  }[]
}

export interface ScanHistoryItem {
  code: string
  timestamp: number
  product_name: string
  brands: string
  image_url?: string
  rating: string
}
