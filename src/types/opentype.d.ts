declare module "opentype.js" {
  interface PathCommand {
    type: string;
    x?: number;
    y?: number;
    x1?: number;
    y1?: number;
    x2?: number;
    y2?: number;
  }

  interface Path {
    commands: PathCommand[];
    toSVG(decimalPlaces?: number): string;
    toPathData(decimalPlaces?: number): string;
  }

  interface Glyph {
    index: number;
    name: string;
    unicode: number | undefined;
    unicodes: number[];
    path: Path;
    advanceWidth: number;
    getBoundingBox(): { x1: number; y1: number; x2: number; y2: number };
    getPath(x?: number, y?: number, fontSize?: number): Path;
    toSVG(decimalPlaces?: number): string;
  }

  interface FontNames {
    fontFamily: { en: string };
    fontSubfamily: { en: string };
    fullName: { en: string };
    version: { en: string };
    designer?: { en: string };
    license?: { en: string };
  }

  interface Font {
    names: FontNames;
    numGlyphs: number;
    unitsPerEm: number;
    glyphs: {
      length: number;
      get(index: number): Glyph;
      forEach(callback: (glyph: Glyph, index: number) => void): void;
    };
    download(): void;
    draw(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, fontSize: number): void;
    getPaths(text: string, x: number, y: number, fontSize: number): Path[];
    stringToGlyphs(text: string): Glyph[];
  }

  function parse(buffer: ArrayBuffer): Font;
  function load(url: string, callback?: (err: Error | null, font?: Font) => void): Promise<Font>;

  export default {
    parse,
    load,
  };
}
