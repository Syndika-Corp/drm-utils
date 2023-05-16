import { License } from '../license/license';

export interface ILicenseStorage {
  /**
   * Load license key
   * @param args Any parameters accepted
   * @throws MisingLicenseError
   */
  load(...args: any[]): License | Promise<License>;

  /**
   * Stores license. Optional implementation.
   * @param license
   */
  store(license: License): boolean | Promise<boolean>;
}

export interface ILicenseValidator {
  /**
   * Validates license
   * @param license
   */
  validate(license: License): boolean | Promise<boolean>;
}
