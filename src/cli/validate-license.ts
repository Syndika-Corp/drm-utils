import chalk from 'chalk';

import { License } from '../license/license';
import { daysBetweenSignedString } from './utils';

export function validateLicense(
  // eslint-disable-next-line
  this: any,
  licenseString: string
): void {
  // eslint-disable-next-line
  const { publicKey, skipDatecheck } = this.opts();

  const license =
    typeof publicKey === 'undefined'
      ? License.fromRawLicense(licenseString)
      : License.fromSignedLicense(licenseString);

  if (typeof publicKey === 'undefined' && skipDatecheck) {
    // eslint-disable-next-line
    this.error(
      'Only thing to validate for a NON signed license key is the date validity. Skipping...'
    );
    return;
  }

  console.log('License Issuer:', chalk.green(license.issuerId));
  console.log('License Machine ID:', chalk.green(license.machineId));
  console.log(
    'License Valid Until:',
    chalk.green(license.validUntil),
    chalk.blue(
      `[${daysBetweenSignedString(
        new Date(),
        license.validUntil
      )} days between]`
    ),
    '\n'
  );

  const isValid = skipDatecheck
    ? license.validateSignature(publicKey)
    : license.validate(publicKey);

  if (skipDatecheck)
    console.warn(chalk.underline.bgBlue('DATE VALIDATION SKIPPED!'));
  console.log(
    isValid ? chalk.green('LICENSE VALID') : chalk.red('LICENSE INVALID')
  );
}
