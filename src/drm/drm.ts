import { PublicKey } from '../license/interfaces';
import { License } from '../license/license';
import { ILicenseStorage, ILicenseValidator } from './interfaces';
import { ChainedStorage } from './storage/chained-storage';
import { OfflineValidator } from './validation/offline-validator';
import { NoLicenseError } from './errors/no-license';
import { PersistingLicenseError } from './errors/persisting-license';

export class DRM {
  /**
   * @param storage License storage implementation
   * @param validator License validator implementation
   * @param license The loaded license
   */
  constructor(
    public readonly storage: ILicenseStorage,
    public readonly validator: ILicenseValidator,
    public license?: License | undefined
  ) {}

  /**
   * Check if the license is available
   */
  public get hasLicense(): boolean {
    return typeof this.license !== 'undefined';
  }

  /**
   * Sets a signed license to be used
   *
   * @param license The license object or string
   * @returns
   */
  public setLicense(license: License | string): DRM {
    this.license =
      license instanceof License ? license : License.fromSignedLicense(license);
    return this;
  }

  /**
   * Try loading license using the storage implementation
   *
   * @param ...args Arguments to be passed to the storage.load() method
   * @throws MisingLicenseError If license can not be loaded
   */
  public async loadLicense(...args: any[]): Promise<DRM> {
    this.license = await this.storage.load(...args);
    return this;
  }

  /**
   * Validate either loaded or provided license
   *
   * @throws NoLicenseError If no license to store
   * @throws PersistingLicenseError If license unable to be persisted
   */
  public async storeLicense(license?: License | string): Promise<DRM> {
    if (typeof license !== 'undefined') this.setLicense(license);
    if (!this.hasLicense) throw new NoLicenseError();
    if ((await this.storage.store(this.license as License)) === false)
      throw new PersistingLicenseError();
    return this;
  }

  /**
   * Validate either loaded or provided license
   *
   * @param license Optional license to validate
   * @throws NoLicenseError If no license to validate
   */
  public async validateLicense(license?: License | string): Promise<boolean> {
    if (typeof license !== 'undefined') this.setLicense(license);
    if (!this.hasLicense) throw new NoLicenseError();
    return this.validator.validate(this.license as License);
  }

  /**
   * Create DRM instance with offline license validation
   *
   * @param issuers Issuers mapping ID => PublicKey
   * @param storages Storages to use, defaults: EnvStorage, FileStorage
   * @param license License to set, if any
   */
  public static create(
    issuers: Map<string, PublicKey>,
    storages?: ILicenseStorage[],
    license?: License
  ): DRM {
    if (issuers.size <= 0)
      throw new RangeError(
        'Issuers mapping must NOT be empty, otherwise expect any license to be invalid!'
      );

    return new DRM(
      ChainedStorage.create(...(storages ?? [])),
      new OfflineValidator(issuers),
      license
    );
  }
}
