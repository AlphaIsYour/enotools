declare module "jsbarcode" {
  interface JsBarcodeOptions {
    format?: string;
    width?: number;
    height?: number;
    displayValue?: boolean;
    font?: string;
    fontSize?: number;
    textAlign?: string;
    textPosition?: string;
    textMargin?: number;
    background?: string;
    lineColor?: string;
    margin?: number;
    marginTop?: number;
    marginBottom?: number;
    marginLeft?: number;
    marginRight?: number;
    flat?: boolean;
    xmlDocument?: Document;
  }

  function JsBarcode(
    element: HTMLCanvasElement | SVGElement | string,
    value: string,
    options?: JsBarcodeOptions
  ): void;

  export default JsBarcode;
}
