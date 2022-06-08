# iconv_lite

Pure JS character encoding conversion

## usage
```ts
import { assertEquals } from "https://deno.land/std@0.142.0/testing/asserts.ts";
import { decode, encode } from "https://deno.land/x/iconv_lite@v1.0.0/mod.ts";

const testString = "Hello123!";

Deno.test("utf8", function() {
  const enc = "utf8";
  const s = decode(encode(testString, enc).toString(enc), enc);
  assertEquals(testString, s);
});

Deno.test("UTF-8", function() {
  const enc = "UTF-8";
  const s = decode(encode(testString, enc).toString(enc), enc);
  assertEquals(testString, s);
});

// Deno.test("gbk", function() {
//   const enc = "gbk";
//   const s = decode(encode(testString, enc).toString(enc), enc);
//   assertEquals(testString, s);
// });
```
