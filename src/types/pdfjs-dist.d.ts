declare module "pdfjs-dist" {
  export const GlobalWorkerOptions: {
    workerSrc: string;
  };

  export function getDocument(src: string | ArrayBuffer | Uint8Array | { data: ArrayBuffer | Uint8Array }): PDFDocumentLoadingTask;

  export interface PDFDocumentLoadingTask {
    promise: Promise<PDFDocumentProxy>;
  }

  export interface PDFDocumentProxy {
    numPages: number;
    getPage(pageNumber: number): Promise<PDFPageProxy>;
    destroy(): void;
  }

  export interface PDFPageProxy {
    getViewport(params: { scale: number; rotation?: number }): PDFPageViewport;
    render(params: { canvasContext: CanvasRenderingContext2D; viewport: PDFPageViewport }): PDFRenderTask;
  }

  export interface PDFPageViewport {
    width: number;
    height: number;
  }

  export interface PDFRenderTask {
    promise: Promise<void>;
  }

  export const version: string;
}
