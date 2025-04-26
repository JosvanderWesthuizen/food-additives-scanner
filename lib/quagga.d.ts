// Type definitions for QuaggaJS
declare module 'quagga' {
  interface QuaggaJSConfiguration {
    inputStream?: {
      name?: string;
      type?: string;
      target?: HTMLElement | string;
      constraints?: {
        width?: { min?: number; max?: number; ideal?: number };
        height?: { min?: number; max?: number; ideal?: number };
        facingMode?: string;
        aspectRatio?: { min?: number; max?: number };
        deviceId?: string;
      };
      area?: {
        top?: string | number;
        right?: string | number;
        left?: string | number;
        bottom?: string | number;
      };
      singleChannel?: boolean;
    };
    locator?: {
      patchSize?: 'x-small' | 'small' | 'medium' | 'large' | 'x-large';
      halfSample?: boolean;
    };
    numOfWorkers?: number;
    frequency?: number; // Scans per second (higher values = more frequent scanning)
    decoder?: {
      readers?: string[];
      debug?: boolean;
      multiple?: boolean;
    };
    locate?: boolean;
    src?: string | ArrayBuffer | Uint8Array;
  }

  interface QuaggaJSResultObject {
    codeResult?: {
      code?: string;
      format?: string;
    };
    line?: [{ x: number; y: number }, { x: number; y: number }];
    angle?: number;
    pattern?: number[];
    box?: [
      { x: number; y: number },
      { x: number; y: number },
      { x: number; y: number },
      { x: number; y: number }
    ];
  }

  function init(
    config: QuaggaJSConfiguration,
    callback?: (err: any) => void
  ): void;

  function start(): void;

  function stop(): void;

  function onDetected(callback: (result: QuaggaJSResultObject) => void): void;

  function offDetected(callback: (result: QuaggaJSResultObject) => void): void;

  function setReaders(readers: string[]): void;
}
