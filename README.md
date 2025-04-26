# Food Additives Scanner

A progressive web app that lets users scan food product barcodes to identify and assess the risks associated with additives in food products. This app is designed to help consumers make more informed choices about the food they consume by providing clear information about potentially harmful additives.

## 🔍 Overview

Food Additives Scanner is similar to apps like Yuka, but with a specific focus on food additives and their potential health risks. It uses the [Open Food Facts](https://world.openfoodfacts.org/) database to retrieve product information and provides a risk assessment based on the additives present in the product.

## ✨ Key Features

- **Barcode Scanning**: Quickly scan product barcodes using your device's camera
- **Additive Risk Assessment**: View detailed information about additives and their risk levels
- **Product Rating**: Get an overall product rating based on the additives it contains
- **Nutritional Information**: View basic nutritional information for scanned products
- **Offline History**: Access your previously scanned products even without an internet connection
- **Manual Barcode Entry**: Enter barcodes manually when scanning isn't possible
- **Product Search**: Search for products by name or barcode

## 📱 Screenshots

[Screenshots to be added]

## 🛠️ How It Works

1. **Scan a Barcode**: The app uses the device's camera to scan a product barcode
2. **Fetch Product Data**: The app queries the Open Food Facts API to retrieve product information
3. **Extract Additives**: The app identifies additives in the product and assesses their risk levels
4. **Calculate Rating**: Based on the additives and their risk levels, the app calculates an overall product rating
5. **Display Results**: The app presents the product information, additives list, and risk assessment in an easy-to-understand format

## 🧪 Additive Risk Assessment

Additives are categorized into three risk levels:

- **High Risk** (Red): Additives with known potential health concerns
- **Limited Risk** (Yellow): Additives with some concerns or limited evidence of harm
- **Risk-Free** (Green): Additives generally recognized as safe

The overall product rating is calculated based on the number and risk level of additives present:
- High-risk additives significantly reduce the score (-30 points each)
- Medium-risk additives moderately reduce the score (-10 points each)
- Low-risk additives slightly reduce the score (-2 points each)

## 🚀 Technologies Used

- **Next.js**: React framework for building the web application
- **TypeScript**: For type-safe code
- **Tailwind CSS**: For styling
- **Quagga.js**: For barcode scanning
- **Open Food Facts API**: For product data

## 🔧 Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or pnpm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/food-additives-scanner.git
   cd food-additives-scanner
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   pnpm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the app.

### Building for Production

```bash
npm run build
# or
pnpm build
```

## 📊 Data Sources

The additive risk data is sourced from Open Food Facts:
- [Additives Taxonomy](https://static.openfoodfacts.org/data/taxonomies/additives.json)

## 🤝 Contributing

Contributions are welcome! Here's how you can contribute:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style and patterns
- Write clear commit messages
- Add tests for new features when possible
- Update documentation as needed

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- [Open Food Facts](https://world.openfoodfacts.org/) for providing the product database
- [Quagga.js](https://github.com/serratus/quaggaJS) for the barcode scanning functionality
- All contributors who have helped improve this project
