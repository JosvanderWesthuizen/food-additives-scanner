// Implementation of a barcode scanner using QuaggaJS
import Quagga from 'quagga';

// Configuration options with defaults
export interface BarcodeOptions {
  debug?: boolean;
  patchSize?: 'x-small' | 'small' | 'medium' | 'large' | 'x-large';
  halfSample?: boolean;
  workers?: number;
  locate?: boolean;
  frequency?: number;
}

// Initialize Quagga with configuration
export function initBarcodeScanner(
  videoElement: HTMLVideoElement, 
  options: BarcodeOptions = {}
): Promise<void> {
  // Default options
  const {
    debug = false,
    patchSize = 'medium',
    halfSample = true,
    workers = navigator.hardwareConcurrency || 2,
    locate = true,
    frequency = 10 // Higher frequency for more scans per second
  } = options;

  console.log("Initializing barcode scanner with options:", {
    debug,
    patchSize,
    halfSample,
    workers,
    locate,
    frequency
  });

  return new Promise((resolve, reject) => {
    // Make sure any existing instance is stopped
    try {
      Quagga.stop();
      console.log("Stopped any existing Quagga instance");
    } catch (e) {
      // Ignore errors if Quagga wasn't running
    }

    Quagga.init({
      inputStream: {
        name: "Live",
        type: "LiveStream",
        target: videoElement,
        constraints: {
          width: { min: 640 },
          height: { min: 480 },
          facingMode: "environment", // Use the rear camera
          aspectRatio: { min: 1, max: 2 }
        },
      },
      locator: {
        patchSize,
        halfSample
      },
      numOfWorkers: workers,
      frequency: frequency,
      decoder: {
        readers: [
          "ean_reader", // EAN-13 and EAN-8 (most common for food products)
          "ean_8_reader",
          "upc_reader", // UPC-A and UPC-E
          "upc_e_reader",
          "code_128_reader", // Code 128
          "code_39_reader", // Code 39
        ],
        debug
      },
      locate
    }, (err) => {
      if (err) {
        console.error("Error initializing Quagga:", err);
        reject(err);
        return;
      }
      
      console.log("Quagga initialized successfully");
      resolve();
    });
  });
}

// Start the barcode scanner
export function startBarcodeScanner(): void {
  console.log("Starting barcode scanner");
  Quagga.start();
}

// Stop the barcode scanner
export function stopBarcodeScanner(): void {
  console.log("Stopping barcode scanner");
  try {
    Quagga.stop();
  } catch (e) {
    console.error("Error stopping Quagga:", e);
  }
}

// Add a detection event listener
export function onDetected(callback: (code: string) => void): void {
  console.log("Setting up barcode detection callback");
  
  // First remove any existing handlers to prevent duplicates
  try {
    Quagga.offDetected(() => {});
  } catch (e) {
    // Ignore errors
  }
  
  Quagga.onDetected((result) => {
    if (result && result.codeResult && result.codeResult.code) {
      const code = result.codeResult.code;
      const format = result.codeResult.format;
      
      console.log(`Barcode detected: ${code} (${format})`);
      
      // Call the callback with the detected code
      callback(code);
    } else {
      console.log("Barcode detection event fired but no valid code found");
    }
  });
}

// Remove event listeners (useful when component unmounts)
export function removeEventListeners(): void {
  console.log("Removing barcode scanner event listeners");
  // Remove all event listeners to prevent memory leaks
  try {
    Quagga.offDetected(() => {});
  } catch (e) {
    console.error("Error removing event listeners:", e);
  }
}

// Legacy function for compatibility with existing code
export function scanBarcode(imageData: ImageData): string | null {
  // This is now just a wrapper that always returns null
  // The actual scanning should use the event-based approach
  console.log("Legacy scanBarcode method called - this method is deprecated");
  return null;
}
