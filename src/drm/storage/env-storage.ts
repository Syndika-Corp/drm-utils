import { License } from '../../license/license';
import { ILicenseStorage } from '../interfaces';
import { LICENSE_ENV_VAR } from '../constants';
import { MisingLicenseError } from './errors/missing-license';

export class EnvStorage implements ILicenseStorage {
  private _envVar: string = LICENSE_ENV_VAR;

  /**
   * @inheritdoc
   * @param envVar The ENV variable name to load license string from
   */
  public load(envVar?: string): License {
    if (typeof envVar !== 'undefined') {
      this._envVar = envVar.toUpperCase();
    }

    if (typeof process.env[this._envVar] === 'undefined')
      throw new MisingLicenseError(
        `No such environment variable "${this._envVar}"`
      );
    return License.fromSignedLicense(process.env[this._envVar] as string);
  }

  /**
   * @inheritdoc
   */
  public store(license: License): boolean {
    process.env[this._envVar] = license.signedLicense;
    return true;
  }
}
