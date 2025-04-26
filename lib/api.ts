import type { Product, Additive } from "./types"

// Function to fetch product data from Open Food Facts API
export async function fetchProductData(barcode: string): Promise<Product | null> {
  try {
    const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`)

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`)
    }

    const data = await response.json()

    if (data.status !== 1 || !data.product) {
      console.log("Product not found or invalid response", data)
      return null
    }

    // Extract additives from the product data
    const additives = extractAdditives(data.product)

    // Calculate rating based on additives
    const { rating, rating_score } = calculateRating(additives)

    // Extract nutriments
    const nutriments = extractNutriments(data.product)

    // Create a standardized product object
    const product: Product = {
      code: data.product.code,
      product_name: data.product.product_name || "Unknown Product",
      brands: data.product.brands || "Unknown Brand",
      image_url: data.product.image_url,
      additives,
      nutriments,
      rating,
      rating_score,
      timestamp: Date.now(),
    }

    return product
  } catch (error) {
    console.error("Error fetching product data:", error)
    throw error
  }
}

// Function to extract additives from product data
function extractAdditives(productData: any): Additive[] {
  const additives: Additive[] = []

  // Check if additives_tags exists
  if (!productData.additives_tags || !Array.isArray(productData.additives_tags)) {
    return additives
  }

  // Process each additive
  for (const tag of productData.additives_tags) {
    // Extract the additive code (e.g., "en:e330" -> "e330")
    const code = tag.split(":").pop()

    if (!code) continue

    // Get additive name from additives_original_tags or additives_tags
    let name = code.toUpperCase()
    if (productData.additives_original_tags) {
      const originalTag = productData.additives_original_tags.find((t: string) =>
        t.toLowerCase().includes(code.toLowerCase()),
      )
      if (originalTag) {
        name = originalTag.split(":").pop() || name
      }
    }

    // Determine additive function and risk level
    const { function: additiveFunction, risk_level } = getAdditiveInfo(code)

    additives.push({
      code,
      name,
      function: additiveFunction,
      risk_level,
    })
  }

  return additives
}

// Function to get additive information (function and risk level)
function getAdditiveInfo(code: string): { function: string; risk_level: string } {
  // This is a simplified version. In a real app, you would have a comprehensive database
  // of additives with their functions and risk levels.

  // Example mapping of some common additives
  const additivesInfo: Record<string, { function: string; risk_level: string }> = {
    // Colors
    e100: { function: "Food coloring", risk_level: "low" },
    e101: { function: "Food coloring", risk_level: "low" },
    e102: { function: "Food coloring", risk_level: "high" },
    e104: { function: "Food coloring", risk_level: "high" },

    // Preservatives
    e200: { function: "Preservative", risk_level: "medium" },
    e210: { function: "Preservative", risk_level: "high" },
    e220: { function: "Preservative", risk_level: "high" },

    // Antioxidants
    e300: { function: "Antioxidant", risk_level: "low" },
    e301: { function: "Antioxidant", risk_level: "low" },
    e310: { function: "Antioxidant", risk_level: "medium" },

    // Thickeners
    e400: { function: "Thickener", risk_level: "low" },
    e407: { function: "Thickener", risk_level: "medium" },

    // Flavor enhancers
    e620: { function: "Flavor enhancer", risk_level: "medium" },
    e621: { function: "Flavor enhancer", risk_level: "high" }, // MSG

    // Sweeteners
    e950: { function: "Sweetener", risk_level: "medium" },
    e951: { function: "Sweetener", risk_level: "medium" }, // Aspartame

    // Anticaking agents
    e551: { function: "Anticaking agent", risk_level: "high" }, // Silicon dioxide
  }

  // Normalize code to lowercase without 'e' prefix if it exists
  const normalizedCode = code.toLowerCase().replace(/^e/, "")

  // Check if we have info for this additive
  const eCode = `e${normalizedCode}`
  if (additivesInfo[eCode]) {
    return additivesInfo[eCode]
  }

  // Default values if not found
  return {
    function: "Food additive",
    risk_level: "medium", // Default to medium if unknown
  }
}

// Function to calculate product rating based on additives
function calculateRating(additives: Additive[]): { rating: string; rating_score: number } {
  if (additives.length === 0) {
    return { rating: "Excellent", rating_score: 100 }
  }

  // Count additives by risk level
  const highRiskCount = additives.filter((a) => a.risk_level === "high").length
  const mediumRiskCount = additives.filter((a) => a.risk_level === "medium").length
  const lowRiskCount = additives.filter((a) => a.risk_level === "low").length

  // Calculate score (simplified version)
  // High risk: -30 points each
  // Medium risk: -10 points each
  // Low risk: -2 points each
  let score = 100 - highRiskCount * 30 - mediumRiskCount * 10 - lowRiskCount * 2

  // Ensure score is between 0 and 100
  score = Math.max(0, Math.min(100, score))

  // Determine rating based on score
  let rating: string
  if (score >= 80) {
    rating = "Excellent"
  } else if (score >= 60) {
    rating = "Good"
  } else if (score >= 40) {
    rating = "Poor"
  } else {
    rating = "Bad"
  }

  return { rating, rating_score: score }
}

// Function to extract nutriments from product data
function extractNutriments(productData: any) {
  const nutriments: any = {}

  if (!productData.nutriments) {
    return nutriments
  }

  // Energy
  if (productData.nutriments.energy_100g) {
    nutriments.energy = {
      value: Math.round(productData.nutriments.energy_100g),
      unit: "kcal",
      level: getNutrimentLevel("energy", productData.nutriments.energy_100g),
    }
  }

  // Fat
  if (productData.nutriments.fat_100g !== undefined) {
    nutriments.fat = {
      value: productData.nutriments.fat_100g,
      unit: "g",
      level: getNutrimentLevel("fat", productData.nutriments.fat_100g),
    }
  }

  // Sugars
  if (productData.nutriments.sugars_100g !== undefined) {
    nutriments.sugars = {
      value: productData.nutriments.sugars_100g,
      unit: "g",
      level: getNutrimentLevel("sugars", productData.nutriments.sugars_100g),
    }
  }

  // Salt
  if (productData.nutriments.salt_100g !== undefined) {
    nutriments.salt = {
      value: productData.nutriments.salt_100g,
      unit: "g",
      level: getNutrimentLevel("salt", productData.nutriments.salt_100g),
    }
  }

  return nutriments
}

// Function to determine nutriment level (high, moderate, low)
function getNutrimentLevel(nutriment: string, value: number): string {
  // Thresholds based on general nutritional guidelines
  // These should be adjusted based on specific requirements
  const thresholds: Record<string, { high: number; moderate: number }> = {
    energy: { high: 400, moderate: 200 },
    fat: { high: 17.5, moderate: 3 },
    saturated_fat: { high: 5, moderate: 1.5 },
    sugars: { high: 22.5, moderate: 5 },
    salt: { high: 1.5, moderate: 0.3 },
  }

  if (!thresholds[nutriment]) {
    return "moderate"
  }

  if (value >= thresholds[nutriment].high) {
    return "high"
  } else if (value >= thresholds[nutriment].moderate) {
    return "moderate"
  } else {
    return "low"
  }
}

// Function to get detailed information about an additive
export async function getAdditiveDetails(code: string): Promise<Additive | null> {
  // In a real app, this would fetch from a database or API
  // For this example, we'll return mock data

  // Normalize code
  const normalizedCode = code.toLowerCase().replace(/^e/, "")

  // Mock data for a few additives
  const additiveDetails: Record<string, Additive> = {
    "551": {
      code: "e551",
      name: "Silicon dioxide",
      function: "Anticaking agent",
      purpose: "Ensures the fluidity of a powdered product by limiting the agglutination of the particles",
      risk_level: "high",
      description:
        "This additive may contain nanoparticles, small molecules capable of crossing the intestinal barrier, accumulating in organs, and disrupting the gut microbiota, potentially leading to inflammatory bowel diseases. By disturbing the immune response, it could, in particular, promote the onset of celiac disease in certain individuals.",
      health_risks: [
        {
          name: "Adverse effects on the liver",
          icon: "🔵",
        },
        {
          name: "Adverse effects on the kidneys",
          icon: "🔵",
        },
      ],
    },
    "621": {
      code: "e621",
      name: "Monosodium glutamate",
      function: "Flavor enhancer",
      purpose: "Enhances the taste and aroma of food",
      risk_level: "high",
      description:
        "Monosodium glutamate (MSG) is a flavor enhancer commonly added to Chinese food, canned vegetables, soups, and processed meats. Some people report adverse reactions to MSG, including headache, flushing, sweating, facial pressure, numbness, heart palpitations, chest pain, nausea, and weakness.",
      health_risks: [
        {
          name: "Headaches",
          icon: "🔵",
        },
        {
          name: "Allergic reactions",
          icon: "🔵",
        },
      ],
    },
    "300": {
      code: "e300",
      name: "Ascorbic acid (Vitamin C)",
      function: "Antioxidant",
      purpose: "Prevents food from oxidizing and changing color",
      risk_level: "low",
      description:
        "Ascorbic acid, also known as Vitamin C, is a natural antioxidant that helps prevent food from browning and protects against oxidation. It is considered safe and has health benefits as an essential vitamin.",
      health_risks: [],
    },
  }

  // Return the additive details if found
  if (additiveDetails[normalizedCode]) {
    return additiveDetails[normalizedCode]
  }

  // If not found in our mock database, create a generic entry
  const { function: additiveFunction, risk_level } = getAdditiveInfo(`e${normalizedCode}`)

  return {
    code: `e${normalizedCode}`,
    name: `E${normalizedCode.toUpperCase()}`,
    function: additiveFunction,
    risk_level,
    description: "Detailed information about this additive is not available.",
  }
}
