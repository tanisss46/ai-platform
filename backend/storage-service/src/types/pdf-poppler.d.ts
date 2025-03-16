declare module 'pdf-poppler' {
  export interface PopplerOptions {
    format?: string;
    out_dir?: string;
    out_prefix?: string;
    page?: number | number[];
    scale?: number;
    scale_to?: {
      width?: number;
      height?: number;
    };
  }

  export function info(pdfPath: string): Promise<{
    pages: number;
    encrypted: boolean;
    pageSize: {
      width: number;
      height: number;
    };
    size: number;
  }>;

  export function convert(pdfPath: string, options: PopplerOptions): Promise<string[]>;
}
