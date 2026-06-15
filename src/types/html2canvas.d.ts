declare module "html2canvas" {
  interface Html2CanvasOptions {
    allowTaint?: boolean;
    backgroundColor?: string | null;
    canvas?: HTMLCanvasElement;
    CORS?: boolean;
    foreignObjectRendering?: boolean;
    height?: number;
    imageTimeout?: number;
    logging?: boolean;
    onclone?: (document: Document) => void;
    proxy?: string;
    removeContainer?: boolean;
    scale?: number;
    useCORS?: boolean;
    width?: number;
    windowWidth?: number;
    windowHeight?: number;
    x?: number;
    y?: number;
    scrollX?: number;
    scrollY?: number;
  }

  function html2canvas(element: HTMLElement, options?: Html2CanvasOptions): Promise<HTMLCanvasElement>;

  export default html2canvas;
}
