import type { Product } from "@/lib/types"

interface NutritionInfoProps {
  product: Product
}

export default function NutritionInfo({ product }: NutritionInfoProps) {
  const { nutriments } = product

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case "good":
        return "bg-green-500"
      case "moderate":
        return "bg-yellow-500"
      case "poor":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  if (!nutriments || Object.keys(nutriments).length === 0) {
    return (
      <div className="p-4 text-center">
        <p>No nutritional information available for this product.</p>
      </div>
    )
  }

  return (
    <div className="pb-16">
      <div className="p-4 border-b">
        <h3 className="text-lg font-medium">Nutritional Information</h3>
        <p className="text-muted-foreground">Per 100g/100ml</p>
      </div>

      <div className="divide-y">
        {nutriments.energy && (
          <div className="flex items-center justify-between p-4">
            <div>
              <h4 className="font-medium">Energy</h4>
              <p className="text-sm text-muted-foreground">
                {nutriments.energy.level === "high"
                  ? "High energy content"
                  : nutriments.energy.level === "moderate"
                    ? "Moderate energy content"
                    : "Low energy content"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span>
                {nutriments.energy.value} {nutriments.energy.unit}
              </span>
              <div className={`w-3 h-3 rounded-full ${getRatingColor(nutriments.energy.level)}`}></div>
            </div>
          </div>
        )}

        {nutriments.fat && (
          <div className="flex items-center justify-between p-4">
            <div>
              <h4 className="font-medium">Fat</h4>
              <p className="text-sm text-muted-foreground">
                {nutriments.fat.level === "high"
                  ? "High fat content"
                  : nutriments.fat.level === "moderate"
                    ? "Moderate fat content"
                    : "Low fat content"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span>{nutriments.fat.value}g</span>
              <div className={`w-3 h-3 rounded-full ${getRatingColor(nutriments.fat.level)}`}></div>
            </div>
          </div>
        )}

        {nutriments.sugars && (
          <div className="flex items-center justify-between p-4">
            <div>
              <h4 className="font-medium">Sugar</h4>
              <p className="text-sm text-muted-foreground">
                {nutriments.sugars.level === "high"
                  ? "High sugar content"
                  : nutriments.sugars.level === "moderate"
                    ? "Moderate sugar content"
                    : "Low sugar content"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span>{nutriments.sugars.value}g</span>
              <div className={`w-3 h-3 rounded-full ${getRatingColor(nutriments.sugars.level)}`}></div>
            </div>
          </div>
        )}

        {nutriments.salt && (
          <div className="flex items-center justify-between p-4">
            <div>
              <h4 className="font-medium">Sodium</h4>
              <p className="text-sm text-muted-foreground">
                {nutriments.salt.level === "high"
                  ? "Too much sodium"
                  : nutriments.salt.level === "moderate"
                    ? "Moderate sodium content"
                    : "Low sodium content"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span>{nutriments.salt.value}g</span>
              <div className={`w-3 h-3 rounded-full ${getRatingColor(nutriments.salt.level)}`}></div>
            </div>
          </div>
        )}

        {/* Add more nutrients as needed */}
      </div>
    </div>
  )
}
