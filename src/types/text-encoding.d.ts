declare module 'text-encoding' {
  export class TextEncoder {
    readonly encoding: string;
    constructor(encoding?: string, options?: { NONSTANDARD_allowLegacyEncoding?: boolean });
    encode(input?: string): Uint8Array;
  }

  export class TextDecoder {
    readonly encoding: string;
    readonly fatal: boolean;
    readonly ignoreBOM: boolean;
    constructor(label?: string, options?: { fatal?: boolean; ignoreBOM?: boolean });
    decode(input?: ArrayBuffer | ArrayBufferView): string;
  }
}
