export class UnsignedLicenseError extends Error {
  constructor() {
    super('This license is unsigned! Use sign() method first.');

    // 👇️ because we are extending a built-in class
    Object.setPrototypeOf(this, UnsignedLicenseError.prototype);
  }
}
