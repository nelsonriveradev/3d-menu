declare namespace JSX {
  interface IntrinsicElements {
    "model-viewer": React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement>,
      HTMLElement
    > & {
      invalidProp?: string;
      src?: string;
      iosSrc?: string;
      alt?: string;
      "camera-controls"?: boolean;
      ar?: boolean;
      "ar-modes"?: string;
    };
  }
}
