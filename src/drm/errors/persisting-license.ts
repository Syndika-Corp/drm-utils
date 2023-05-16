export class PersistingLicenseError extends Error {
  constructor() {
    super('Unable to [properly] persist loaded license.');

    // 👇️ because we are extending a built-in class
    Object.setPrototypeOf(this, PersistingLicenseError.prototype);
  }
}
