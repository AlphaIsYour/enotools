declare module "pdf-lib" {
  export class PDFDocument {
    static load(bytes: ArrayBuffer | Uint8Array, options?: { ignoreEncryption?: boolean; password?: string }): Promise<PDFDocument>;
    static create(): Promise<PDFDocument>;
    getPageCount(): number;
    getPageIndices(): number[];
    getPages(): PDFPage[];
    getPage(index: number): PDFPage;
    addPage(size?: [number, number] | PDFPage): PDFPage;
    removePage(index: number): void;
    embedJpg(jpgBytes: Uint8Array): Promise<PDFImage>;
    embedPng(pngBytes: Uint8Array | ArrayBuffer): Promise<PDFImage>;
    embedFont(fontBytes: string | Uint8Array): Promise<PDFFont>;
    copyPages(sourceDoc: PDFDocument, indices: number[]): Promise<PDFPage[]>;
    setTitle(title: string): void;
    setAuthor(author: string): void;
    setSubject(subject: string): void;
    setCreator(creator: string): void;
    setProducer(producer: string): void;
    save(options?: { useObjectStreams?: boolean }): Promise<Uint8Array>;
  }

  export class PDFPage {
    getSize(): { width: number; height: number };
    setSize(width: number, height: number): void;
    getRotation(): { angle: number; type: string };
    setRotation(rotation: number | { angle: number }): void;
    drawText(text: string, options?: {
      x?: number;
      y?: number;
      size?: number;
      font?: PDFFont;
      color?: RGB;
      opacity?: number;
      rotate?: number | { angle: number; type: string };
    }): void;
    drawImage(image: PDFImage, options?: {
      x?: number;
      y?: number;
      width?: number;
      height?: number;
      opacity?: number;
    }): void;
    drawRectangle(options?: {
      x?: number;
      y?: number;
      width?: number;
      height?: number;
      borderColor?: RGB;
      borderWidth?: number;
      color?: RGB;
      opacity?: number;
    }): void;
  }

  export class PDFImage {
    width: number;
    height: number;
    scale(factor: number): { width: number; height: number };
  }

  export class PDFFont {
    widthOfTextAtSize(text: string, size: number): number;
    heightAtSize(size: number): number;
  }

  export class RGB {
    constructor(red: number, green: number, blue: number);
  }

  export function rgb(red: number, green: number, blue: number): RGB;
  export function degrees(angle: number): { angle: number; type: string };
  export function grayscale(value: number): RGB;

  export const StandardFonts: {
    Helvetica: string;
    HelveticaBold: string;
    HelveticaOblique: string;
    HelveticaBoldOblique: string;
    TimesRoman: string;
    TimesRomanBold: string;
    TimesRomanItalic: string;
    TimesRomanBoldItalic: string;
    Courier: string;
    CourierBold: string;
    CourierOblique: string;
    CourierBoldOblique: string;
  };
}
