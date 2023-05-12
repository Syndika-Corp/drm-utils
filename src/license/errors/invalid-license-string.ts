export class InvalidLicenseStringError extends Error {
  constructor(expected: number, parsed: number) {
    super(
      `Invalid License string. Expected ${expected} components, parsed ${parsed}.`
    );

    // 👇️ because we are extending a built-in class
    Object.setPrototypeOf(this, InvalidLicenseStringError.prototype);
  }
}
