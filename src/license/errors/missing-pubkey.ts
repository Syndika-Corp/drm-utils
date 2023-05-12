export class MissingPublicKeyError extends Error {
  constructor() {
    super('Missing public key to verify the signed license.');

    // 👇️ because we are extending a built-in class
    Object.setPrototypeOf(this, MissingPublicKeyError.prototype);
  }
}
