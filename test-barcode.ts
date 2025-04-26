// Simple test script to fetch data for a specific barcode
import { fetchProductData } from './lib/api';

const barcode = '602652433986';

async function testBarcode() {
  try {
    console.log(`Fetching data for barcode: ${barcode}...`);
    const product = await fetchProductData(barcode);
    
    if (!product) {
      console.log('Product not found');
      return;
    }
    
    console.log('\nProduct information:');
    console.log(`Name: ${product.product_name}`);
    console.log(`Brand: ${product.brands}`);
    console.log(`Rating: ${product.rating} (${product.rating_score})`);
    
    console.log('\nAdditives:');
    if (product.additives.length === 0) {
      console.log('No additives found');
    } else {
      product.additives.forEach(additive => {
        console.log(`- ${additive.name} (${additive.code})`);
        console.log(`  Function: ${additive.function}`);
        console.log(`  Risk level: ${additive.risk_level}`);
      });
    }
    
    console.log('\nNutriments:');
    Object.entries(product.nutriments).forEach(([key, value]) => {
      console.log(`- ${key}: ${value.value}${value.unit} (${value.level})`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testBarcode(); 