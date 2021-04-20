const { createCipheriv, createDecipheriv, randomBytes } = require("crypto");

/**
 * Holds cryptographic utility functions.
 */
class Crypt {
  /**
   * @param {object} options - Options for the cryptographic functions. 
   */
  constructor (options) {
    /**
     * The key used for the chiper and dechiper.
     * 
     * @type {Buffer}
     */
    this.key = options.key ? Buffer.from(options.key) : Buffer.from("tKYit86jnt6J8TN6b7h96TBHR6UN9h3s");

    /**
     * The algorithm used for encryption.
     * 
     * @type {string}
     */
    this.algorithm = options.algorithm || "aes-256-cbc";
  }

  /**
   * Encrypts a string.
   * 
   * @param {string} string - The string to encrypt. 
   * @returns {string} The encrypted value.
   */
  encrypt (string) {
    const iv = randomBytes(16);
    const chiper = createCipheriv(this.algorithm, this.key, iv);
    const crypted = Buffer.concat([
      Buffer.from(chiper.update(string)),
      chiper.final()
    ]);
    return this.atob(JSON.stringify({
      iv: iv.toString("hex"),
      data: crypted.toString("hex")
    }));
  }

  /**
   * Decrypts a string.
   * 
   * @param {string} string - The encoded string to decrypt.
   * @returns {string} The decrypted value.
   */
  decrypt (string) {
    let data = this.btoa(string);
    data = JSON.parse(data);
    data = {
      iv: Buffer.from(data.iv, "hex"),
      data: Buffer.from(data.data, "hex")
    };

    const dechiper = createDecipheriv(this.algorithm, this.key, data.iv);
    const decrypted = Buffer.concat([
      dechiper.update(data.data),
      dechiper.final()
    ]);
    
    return decrypted.toString();
  }

  /**
   * Encodes a string to hexadecimal.
   * 
   * @param {string} string - String to encode.
   * @returns {string} Encoded string.
   */
  atob (string) {
    return Buffer.from(string).toString("hex");
  }

  /**
   * Decodes a string from hexadecimal.
   * 
   * @param {string} string - String to decode.
   * @returns {string} Decoded string/
   */
  btoa (string) {
    return Buffer.from(string, "hex").toString();
  }
}

module.exports = Crypt;