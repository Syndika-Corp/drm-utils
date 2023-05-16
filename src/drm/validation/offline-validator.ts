import { PublicKey } from '../../license/interfaces';
import { License } from '../../license/license';
import { ILicenseValidator } from '../interfaces';

export class OfflineValidator implements ILicenseValidator {
  /**
   * @param issuers Issuers mapping ID => PublicKey
   */
  constructor(public readonly issuers: Map<string, PublicKey>) {}

  /**
   * @inheritdoc
   */
  public validate(license: License): boolean {
    return (
      this.issuers.has(license.issuerId) &&
      license.validate(this.issuers.get(license.issuerId))
    );
  }
}
