import { assertEquals } from "https://deno.land/std@0.139.0/testing/asserts.ts";
import { decode, encode } from "./mod.ts";

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
