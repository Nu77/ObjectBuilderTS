declare module 'lzma-native' {
  export function compress(buffer: Buffer, options?: any): Promise<Buffer>;
  export function decompress(buffer: Buffer, options?: any): Promise<Buffer>;
  export const FORMAT_ALONE: number;
}

