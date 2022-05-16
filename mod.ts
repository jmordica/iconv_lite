import { Buffer } from "./deps.ts";

import { PrependBOM, StripBOM } from "./bom_handling.ts";

// All codecs and aliases are kept here, keyed by encoding name/alias.
import * as encodings from "./encodings/mod.ts";

// Characters emitted in case of error.
const defaultCharUnicode = '�';
const defaultCharSingleByte = '?';

export function encode(str: string, encoding: string, options?: {
  addBOM?: boolean;
}) {
  str = "" + (str || ""); // Ensure string.

  const encoder = getEncoder(encoding, options);

  const res = encoder.write(str);
  const trail = encoder.end();
  
  return (trail && trail.length > 0) ? Buffer.concat([res, trail]) : res;
}

export function decode(buf: Buffer, encoding: string, options?: {
  stripBOM?: boolean | (() => void);
}): string {
  if (typeof buf === 'string') {
    buf = Buffer.from("" + (buf || ""), "binary"); // Ensure buffer.
  }

  const decoder = getDecoder(encoding, options);

  const res = decoder.write(buf);
  const trail = decoder.end();

  return trail ? (res + trail) : res;
}

export function encodingExists(encoding: string) {
  try {
    getCodec(encoding);
    return true;
  } catch (_e) {
    return false;
  }
}

export const toEncoding = encode;
export const fromEncoding = decode;

// deno-lint-ignore no-explicit-any
const _codecDataCache: {[key: string]: any} = {};

export function getCodec(encoding: string) {
  // Canonicalize encoding name: strip all non-alphanumeric chars and appended year.
  let enc = _canonicalizeEncoding(encoding);

  // Traverse iconv.encodings to find actual codec.
  // deno-lint-ignore no-explicit-any
  const codecOptions: any = { };
  while (true) {
    let codec = _codecDataCache[enc];
    if (codec) {
      return codec;
    }

    // deno-lint-ignore no-explicit-any
    const codecDef = (encodings as any)[enc];

    switch (typeof codecDef) {
      case "string": // Direct alias to other encoding.
        enc = codecDef;
        break;

      case "object": // Alias with options. Can be layered.
        for (const key in codecDef) {
          codecOptions[key] = codecDef[key];
        }

        if (!codecOptions.encodingName) {
          codecOptions.encodingName = enc;
        }
        
        enc = codecDef.type;
        break;

      case "function": // Codec itself.
        if (!codecOptions.encodingName) {
          codecOptions.encodingName = enc;
        }

        // The codec function must load all tables and return object with .encoder and .decoder methods.
        // It'll be called only once (for each different options object).
        codec = new codecDef(codecOptions, {
          defaultCharUnicode,
          defaultCharSingleByte,
        });

        _codecDataCache[codecOptions.encodingName] = codec; // Save it to be reused later.
        return codec;

      default:
        throw new Error("Encoding not recognized: '" + encoding + "' (searched as: '"+enc+"')");
    }
  }
}

function _canonicalizeEncoding(encoding: string) {
  // Canonicalize encoding name: strip all non-alphanumeric chars and appended year.
  return (''+encoding).toLowerCase().replace(/:\d{4}$|[^0-9a-z]/g, "");
}

export function getEncoder(encoding: string, options?: {
  addBOM?: boolean;
}) {
  const codec = getCodec(encoding);
  let encoder = new codec.encoder(options, codec);

  if (codec.bomAware && options && options.addBOM) {
    encoder = new PrependBOM(encoder, options);
  }
  return encoder;
}

export function getDecoder(encoding: string, options?: {
  stripBOM?: boolean | (() => void);
}) {
  const codec = getCodec(encoding);
  let decoder = new codec.decoder(options, codec);

  if (codec.bomAware && !(options && options.stripBOM === false)) {
    decoder = new StripBOM(decoder, options);
  }
  
  return decoder;
}
