import { Buffer } from "./deps.ts";
import { EncoderStream, DecoderStream } from "./type.d.ts";

const BOMChar = '\uFEFF';

export class PrependBOMWrapper {
  
  encoder: EncoderStream;
  addBOM: boolean;
  
  // deno-lint-ignore no-explicit-any
  constructor(encoder: EncoderStream, _options: any) {
    this.encoder = encoder;
    this.addBOM = true;
  }
  
  write(str: string) {
    if (this.addBOM) {
      str = BOMChar + str;
      this.addBOM = false;
    }
    return this.encoder.write(str);
  }
  
  end() {
    return this.encoder.end();
  }
  
}
export const PrependBOM = PrependBOMWrapper;

//------------------------------------------------------------------------------

export class StripBOMWrapper {
  
  decoder: DecoderStream;
  pass: boolean;
  options: {
    stripBOM?: boolean | (() => void);
  }
  
  constructor(
    decoder: DecoderStream,
    options?: {
      stripBOM?: boolean | (() => void);
    },
  ) {
    this.decoder = decoder;
    this.pass = false;
    this.options = options || {};
  }
  
  write(buf: Buffer) {
    let res = this.decoder.write(buf);
    if (this.pass || !res) {
      return res;
    }
    
    if (res[0] === BOMChar) {
      res = res.slice(1);
      if (typeof this.options?.stripBOM === 'function') {
        this.options.stripBOM();
      }
    }
    
    this.pass = true;
    return res;
  }
  
  end() {
    return this.decoder.end();
  }
  
}
export const StripBOM = StripBOMWrapper;
