export class MisingLicenseError extends Error {
  constructor(details?: string) {
    super(
      typeof details === 'undefined'
        ? 'Unable to load license key.'
        : `Unable to load license key: ${details}`
    );

    // 👇️ because we are extending a built-in class
    Object.setPrototypeOf(this, MisingLicenseError.prototype);
  }
}
