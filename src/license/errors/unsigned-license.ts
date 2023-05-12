export class UnsignedLicenseError extends Error {
  constructor() {
    super(
      'This license is unsigned and can not be verifier against a public key'
    );

    // 👇️ because we are extending a built-in class
    Object.setPrototypeOf(this, UnsignedLicenseError.prototype);
  }
}
