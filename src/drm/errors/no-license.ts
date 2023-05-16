export class NoLicenseError extends Error {
  constructor() {
    super('No license key found.');

    // 👇️ because we are extending a built-in class
    Object.setPrototypeOf(this, NoLicenseError.prototype);
  }
}
