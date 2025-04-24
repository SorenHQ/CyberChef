/**
 * @author n1073645 [n1073645@gmail.com]
 * @copyright Crown Copyright 2020
 * @license Apache-2.0
 */

import Operation from "../Operation.js";
import Utils from "../Utils.js";
import Sm3 from "crypto-api/src/hasher/sm3.js";
import CryptoApi from "crypto-api/src/crypto-api.js";

/**
 * SM3 operation
 */
class SM3 extends Operation {
  /**
   * SM3 constructor
   */
  constructor() {
    super();

    this.name = "SM3";
    this.module = "Crypto";
    this.description =
      "SM3 is a cryptographic hash function used in the Chinese National Standard. SM3 is mainly used in digital signatures, message authentication codes, and pseudorandom number generators. The message digest algorithm consists, by default, of 64 rounds and length of 256.";
    this.infoURL = "https://wikipedia.org/wiki/SM3_(hash_function)";
    this.inputType = "ArrayBuffer";
    this.outputType = "string";
    this.args = [
      {
        name: "Length",
        type: "number",
        value: 256,
      },
      {
        name: "Rounds",
        type: "number",
        value: 64,
        min: 16,
      },
    ];
  }

  /**
   * @param {ArrayBuffer} input
   * @param {Object[]} args
   * @returns {string}
   */
  run(input, args) {
    const msg = Utils.arrayBufferToStr(input, false);
    const hasher = new Sm3({ length: args[0], rounds: args[1] });
    return CryptoApi.hash(hasher.finalize(), hasher, msg);
  }
}

export default SM3;
