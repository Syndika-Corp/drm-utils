import fs from 'fs-extra';
import path from 'path';

import { License } from '../../license/license';
import { ILicenseStorage } from '../interfaces';
import { LICENSE_FILE_NAME } from '../constants';
import { MisingLicenseError } from './errors/missing-license';

export class FileStorage implements ILicenseStorage {
  private _fileName: string = LICENSE_FILE_NAME;

  get filePath(): string {
    return path.resolve(process.cwd(), this._fileName);
  }

  /**
   * @inheritdoc
   * @param fileName The file name to load license from
   */
  public async load(fileName?: string): Promise<License> {
    if (typeof fileName !== 'undefined') {
      this._fileName = fileName;
    }

    if ((await fs.pathExists(this.filePath)) === false)
      throw new MisingLicenseError(
        `No such file "${this._fileName}" exists in working directory`
      );
    return License.fromSignedLicense(
      (await fs.readFile(this.filePath)).toString()
    );
  }

  /**
   * @inheritdoc
   */
  public async store(license: License): Promise<boolean> {
    try {
      await fs.ensureFile(this.filePath);
      await fs.writeFile(this.filePath, license.signedLicense);
      return true;
    } catch (_) {
      return false;
    }
  }
}
