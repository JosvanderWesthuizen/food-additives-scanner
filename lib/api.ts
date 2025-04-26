import type { Product, Additive } from "./types"
import additivesData from "./additives.json"

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

// Common additives mapping with descriptive names
const commonAdditives: Record<string, string> = {
  "e100": "Curcumin (Turmeric)",
  "e101": "Riboflavin (Vitamin B2)",
  "e102": "Tartrazine",
  "e104": "Quinoline Yellow",
  "e110": "Sunset Yellow FCF",
  "e120": "Carmine (Cochineal)",
  "e122": "Carmoisine",
  "e123": "Amaranth",
  "e124": "Ponceau 4R",
  "e127": "Erythrosine",
  "e129": "Allura Red AC",
  "e131": "Patent Blue V",
  "e132": "Indigo Carmine",
  "e133": "Brilliant Blue FCF",
  "e140": "Chlorophylls",
  "e141": "Copper Complexes of Chlorophylls",
  "e142": "Green S",
  "e150a": "Plain Caramel",
  "e150b": "Caustic Sulphite Caramel",
  "e150c": "Ammonia Caramel",
  "e150d": "Sulphite Ammonia Caramel",
  "e151": "Brilliant Black BN",
  "e153": "Carbon Black",
  "e160a": "Alpha-carotene, Beta-carotene",
  "e160b": "Annatto, Bixin, Norbixin",
  "e160c": "Paprika Extract",
  "e160d": "Lycopene",
  "e160e": "Beta-apo-8′-carotenal",
  "e161b": "Lutein",
  "e162": "Beetroot Red",
  "e163": "Anthocyanins",
  "e170": "Calcium Carbonate",
  "e171": "Titanium Dioxide",
  "e172": "Iron Oxides and Hydroxides",
  "e173": "Aluminium",
  "e174": "Silver",
  "e175": "Gold",
  "e180": "Litholrubine BK",
  "e200": "Sorbic Acid",
  "e202": "Potassium Sorbate",
  "e203": "Calcium Sorbate",
  "e210": "Benzoic Acid",
  "e211": "Sodium Benzoate",
  "e212": "Potassium Benzoate",
  "e213": "Calcium Benzoate",
  "e214": "Ethyl Para-hydroxybenzoate",
  "e215": "Sodium Ethyl Para-hydroxybenzoate",
  "e218": "Methyl Para-hydroxybenzoate",
  "e219": "Sodium Methyl Para-hydroxybenzoate",
  "e220": "Sulphur Dioxide",
  "e221": "Sodium Sulphite",
  "e222": "Sodium Hydrogen Sulphite",
  "e223": "Sodium Metabisulphite",
  "e224": "Potassium Metabisulphite",
  "e226": "Calcium Sulphite",
  "e227": "Calcium Hydrogen Sulphite",
  "e228": "Potassium Hydrogen Sulphite",
  "e234": "Nisin",
  "e235": "Natamycin",
  "e239": "Hexamethylene Tetramine",
  "e242": "Dimethyl Dicarbonate",
  "e249": "Potassium Nitrite",
  "e250": "Sodium Nitrite",
  "e251": "Sodium Nitrate",
  "e252": "Potassium Nitrate",
  "e260": "Acetic Acid",
  "e261": "Potassium Acetate",
  "e262": "Sodium Acetates",
  "e263": "Calcium Acetate",
  "e270": "Lactic Acid",
  "e280": "Propionic Acid",
  "e281": "Sodium Propionate",
  "e282": "Calcium Propionate",
  "e283": "Potassium Propionate",
  "e290": "Carbon Dioxide",
  "e296": "Malic Acid",
  "e297": "Fumaric Acid",
  "e300": "Ascorbic Acid (Vitamin C)",
  "e301": "Sodium Ascorbate",
  "e302": "Calcium Ascorbate",
  "e304": "Fatty Acid Esters of Ascorbic Acid",
  "e306": "Tocopherol-rich Extract (Vitamin E)",
  "e307": "Alpha-tocopherol (Vitamin E)",
  "e308": "Gamma-tocopherol (Vitamin E)",
  "e309": "Delta-tocopherol (Vitamin E)",
  "e310": "Propyl Gallate",
  "e315": "Erythorbic Acid",
  "e316": "Sodium Erythorbate",
  "e319": "Tertiary-butyl Hydroquinone (TBHQ)",
  "e320": "Butylated Hydroxyanisole (BHA)",
  "e321": "Butylated Hydroxytoluene (BHT)",
  "e322": "Lecithins",
  "e325": "Sodium Lactate",
  "e326": "Potassium Lactate",
  "e327": "Calcium Lactate",
  "e330": "Citric Acid",
  "e331": "Sodium Citrates",
  "e332": "Potassium Citrates",
  "e333": "Calcium Citrates",
  "e334": "Tartaric Acid (L(+)-)",
  "e335": "Sodium Tartrates",
  "e336": "Potassium Tartrates",
  "e337": "Sodium Potassium Tartrate",
  "e338": "Phosphoric Acid",
  "e339": "Sodium Phosphates",
  "e340": "Potassium Phosphates",
  "e341": "Calcium Phosphates",
  "e343": "Magnesium Phosphates",
  "e350": "Sodium Malates",
  "e351": "Potassium Malate",
  "e352": "Calcium Malates",
  "e353": "Metatartaric Acid",
  "e354": "Calcium Tartrate",
  "e355": "Adipic Acid",
  "e356": "Sodium Adipate",
  "e357": "Potassium Adipate",
  "e363": "Succinic Acid",
  "e380": "Triammonium Citrate",
  "e385": "Calcium Disodium EDTA",
  "e392": "Rosemary Extract",
  "e400": "Alginic Acid",
  "e401": "Sodium Alginate",
  "e402": "Potassium Alginate",
  "e403": "Ammonium Alginate",
  "e404": "Calcium Alginate",
  "e405": "Propane-1,2-diol Alginate",
  "e406": "Agar",
  "e407": "Carrageenan",
  "e407a": "Processed Eucheuma Seaweed",
  "e410": "Locust Bean Gum",
  "e412": "Guar Gum",
  "e413": "Tragacanth",
  "e414": "Acacia Gum (Gum Arabic)",
  "e415": "Xanthan Gum",
  "e416": "Karaya Gum",
  "e417": "Tara Gum",
  "e418": "Gellan Gum",
  "e420": "Sorbitol",
  "e421": "Mannitol",
  "e422": "Glycerol",
  "e425": "Konjac",
  "e426": "Soybean Hemicellulose",
  "e427": "Cassia Gum",
  "e431": "Polyoxyethylene (40) Stearate",
  "e432": "Polyoxyethylene Sorbitan Monolaurate (Polysorbate 20)",
  "e433": "Polyoxyethylene Sorbitan Monooleate (Polysorbate 80)",
  "e434": "Polyoxyethylene Sorbitan Monopalmitate (Polysorbate 40)",
  "e435": "Polyoxyethylene Sorbitan Monostearate (Polysorbate 60)",
  "e436": "Polyoxyethylene Sorbitan Tristearate (Polysorbate 65)",
  "e440": "Pectins",
  "e442": "Ammonium Phosphatides",
  "e444": "Sucrose Acetate Isobutyrate",
  "e445": "Glycerol Esters of Wood Rosins",
  "e450": "Diphosphates",
  "e451": "Triphosphates",
  "e452": "Polyphosphates",
  "e459": "Beta-cyclodextrin",
  "e460": "Cellulose",
  "e461": "Methyl Cellulose",
  "e463": "Hydroxypropyl Cellulose",
  "e464": "Hydroxypropyl Methyl Cellulose",
  "e465": "Ethyl Methyl Cellulose",
  "e466": "Sodium Carboxy Methyl Cellulose",
  "e470a": "Sodium, Potassium and Calcium Salts of Fatty Acids",
  "e470b": "Magnesium Salts of Fatty Acids",
  "e471": "Mono- and Diglycerides of Fatty Acids",
  "e472a": "Acetic Acid Esters of Mono- and Diglycerides of Fatty Acids",
  "e472b": "Lactic Acid Esters of Mono- and Diglycerides of Fatty Acids",
  "e472c": "Citric Acid Esters of Mono- and Diglycerides of Fatty Acids",
  "e472d": "Tartaric Acid Esters of Mono- and Diglycerides of Fatty Acids",
  "e472e": "Mono- and Diacetyl Tartaric Acid Esters of Mono- and Diglycerides of Fatty Acids",
  "e472f": "Mixed Acetic and Tartaric Acid Esters of Mono- and Diglycerides of Fatty Acids",
  "e473": "Sucrose Esters of Fatty Acids",
  "e474": "Sucroglycerides",
  "e475": "Polyglycerol Esters of Fatty Acids",
  "e476": "Polyglycerol Polyricinoleate",
  "e477": "Propane-1,2-diol Esters of Fatty Acids",
  "e479b": "Thermally Oxidized Soya Bean Oil Interacted with Mono- and Diglycerides of Fatty Acids",
  "e481": "Sodium Stearoyl-2-lactylate",
  "e482": "Calcium Stearoyl-2-lactylate",
  "e483": "Stearyl Tartrate",
  "e491": "Sorbitan Monostearate",
  "e492": "Sorbitan Tristearate",
  "e493": "Sorbitan Monolaurate",
  "e494": "Sorbitan Monooleate",
  "e495": "Sorbitan Monopalmitate",
  "e500": "Sodium Carbonates",
  "e501": "Potassium Carbonates",
  "e503": "Ammonium Carbonates",
  "e504": "Magnesium Carbonates",
  "e507": "Hydrochloric Acid",
  "e508": "Potassium Chloride",
  "e509": "Calcium Chloride",
  "e511": "Magnesium Chloride",
  "e512": "Stannous Chloride",
  "e513": "Sulphuric Acid",
  "e514": "Sodium Sulphates",
  "e515": "Potassium Sulphates",
  "e516": "Calcium Sulphate",
  "e517": "Ammonium Sulphate",
  "e520": "Aluminium Sulphate",
  "e521": "Aluminium Sodium Sulphate",
  "e522": "Aluminium Potassium Sulphate",
  "e523": "Aluminium Ammonium Sulphate",
  "e524": "Sodium Hydroxide",
  "e525": "Potassium Hydroxide",
  "e526": "Calcium Hydroxide",
  "e527": "Ammonium Hydroxide",
  "e528": "Magnesium Hydroxide",
  "e529": "Calcium Oxide",
  "e530": "Magnesium Oxide",
  "e535": "Sodium Ferrocyanide",
  "e536": "Potassium Ferrocyanide",
  "e538": "Calcium Ferrocyanide",
  "e541": "Sodium Aluminium Phosphate",
  "e551": "Silicon Dioxide",
  "e552": "Calcium Silicate",
  "e553a": "Magnesium Silicate",
  "e553b": "Talc",
  "e554": "Sodium Aluminium Silicate",
  "e555": "Potassium Aluminium Silicate",
  "e556": "Calcium Aluminium Silicate",
  "e558": "Bentonite",
  "e559": "Aluminium Silicate (Kaolin)",
  "e570": "Fatty Acids",
  "e574": "Gluconic Acid",
  "e575": "Glucono-delta-lactone",
  "e576": "Sodium Gluconate",
  "e577": "Potassium Gluconate",
  "e578": "Calcium Gluconate",
  "e579": "Ferrous Gluconate",
  "e585": "Ferrous Lactate",
  "e620": "Glutamic Acid",
  "e621": "Monosodium Glutamate",
  "e622": "Monopotassium Glutamate",
  "e623": "Calcium Diglutamate",
  "e624": "Monoammonium Glutamate",
  "e625": "Magnesium Diglutamate",
  "e626": "Guanylic Acid",
  "e627": "Disodium Guanylate",
  "e628": "Dipotassium Guanylate",
  "e629": "Calcium Guanylate",
  "e630": "Inosinic Acid",
  "e631": "Disodium Inosinate",
  "e632": "Dipotassium Inosinate",
  "e633": "Calcium Inosinate",
  "e634": "Calcium 5'-ribonucleotides",
  "e635": "Disodium 5'-ribonucleotides",
  "e640": "Glycine and its Sodium Salt",
  "e650": "Zinc Acetate",
  "e900": "Dimethyl Polysiloxane",
  "e901": "Beeswax, White and Yellow",
  "e902": "Candelilla Wax",
  "e903": "Carnauba Wax",
  "e904": "Shellac",
  "e905": "Microcrystalline Wax",
  "e907": "Refined Microcrystalline Wax",
  "e912": "Montan Acid Esters",
  "e914": "Oxidized Polyethylene Wax",
  "e920": "L-cysteine",
  "e927b": "Carbamide",
  "e938": "Argon",
  "e939": "Helium",
  "e941": "Nitrogen",
  "e942": "Nitrous Oxide",
  "e943a": "Butane",
  "e943b": "Isobutane",
  "e944": "Propane",
  "e948": "Oxygen",
  "e949": "Hydrogen",
  "e950": "Acesulfame K",
  "e951": "Aspartame",
  "e952": "Cyclamates",
  "e953": "Isomalt",
  "e954": "Saccharin",
  "e955": "Sucralose",
  "e957": "Thaumatin",
  "e959": "Neohesperidine DC",
  "e960": "Steviol Glycosides",
  "e961": "Neotame",
  "e962": "Aspartame-Acesulfame Salt",
  "e965": "Maltitol",
  "e966": "Lactitol",
  "e967": "Xylitol",
  "e968": "Erythritol",
  "e969": "Advantame",
  "e999": "Quillaia Extract",
  "e1103": "Invertase",
  "e1105": "Lysozyme",
  "e1200": "Polydextrose",
  "e1201": "Polyvinylpyrrolidone",
  "e1202": "Polyvinylpolypyrrolidone",
  "e1203": "Polyvinyl Alcohol",
  "e1204": "Pullulan",
  "e1205": "Basic Methacrylate Copolymer",
  "e1206": "Neutral Methacrylate Copolymer",
  "e1207": "Anionic Methacrylate Copolymer",
  "e1208": "Polyvinylpyrrolidone-vinyl Acetate Copolymer",
  "e1209": "Polyvinyl Alcohol-polyethylene Glycol-graft-co-polymer",
  "e1404": "Oxidized Starch",
  "e1410": "Monostarch Phosphate",
  "e1412": "Distarch Phosphate",
  "e1413": "Phosphated Distarch Phosphate",
  "e1414": "Acetylated Distarch Phosphate",
  "e1420": "Acetylated Starch",
  "e1422": "Acetylated Distarch Adipate",
  "e1440": "Hydroxypropyl Starch",
  "e1442": "Hydroxypropyl Distarch Phosphate",
  "e1450": "Starch Sodium Octenyl Succinate",
  "e1451": "Acetylated Oxidized Starch",
  "e1452": "Starch Aluminium Octenyl Succinate",
  "e1505": "Triethyl Citrate",
  "e1518": "Glyceryl Triacetate (Triacetin)",
  "e1520": "Propylene Glycol"
};

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

    // Get additive name from our mapping or from additives_original_tags
    let name = code.toUpperCase()
    
    // First try to get the name from our mapping
    const normalizedCode = code.toLowerCase().replace(/^e/, "e")
    if (commonAdditives[normalizedCode]) {
      name = commonAdditives[normalizedCode]
    } 
    // If not in our mapping, try to get from additives_original_tags
    else if (productData.additives_original_tags) {
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
  // Use data from additives.json
  const lookupKey = `en:${code.toLowerCase()}`
  const additiveEntry = (additivesData as any)[lookupKey]

  let riskLevel = "medium" // Default risk level
  let additiveFunction = "Food additive" // Default function

  if (additiveEntry) {
    // Extract risk level
    const riskValue = additiveEntry.efsa_evaluation_overexposure_risk?.en
    if (riskValue) {
      const extractedRisk = riskValue.split(":").pop()?.toLowerCase()
      if (extractedRisk === "high" || extractedRisk === "medium" || extractedRisk === "low") {
        riskLevel = extractedRisk
      }
      // Add other potential risk mappings if needed from the JSON data structure
    }

    // Extract function (example: take the first class)
    const classValue =
      additiveEntry.mandatory_additive_class?.en || additiveEntry.additives_classes?.en
    if (classValue) {
      const firstClass = classValue.split(",")[0].split(":").pop()
      if (firstClass) {
        // Simple formatting: replace hyphens, capitalize
        additiveFunction = firstClass
          .replace(/-/g, " ")
          .replace(/\b\w/g, (l: string) => l.toUpperCase())
      }
    }
  } else {
    console.warn(`Additive info not found for code: ${code} (key: ${lookupKey})`)
  }

  return {
    function: additiveFunction,
    risk_level: riskLevel,
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

  // If not found in our mock database, check the common additives mapping
  const additiveCode = `e${normalizedCode}`;
  const { function: additiveFunction, risk_level } = getAdditiveInfo(additiveCode)
  
  // Use the common additives mapping for the name if available
  const descriptiveName = commonAdditives[additiveCode.toLowerCase()] || `E${normalizedCode.toUpperCase()}`;

  return {
    code: additiveCode,
    name: descriptiveName,
    function: additiveFunction,
    risk_level,
    description: "Detailed information about this additive is not available.",
  }
}
