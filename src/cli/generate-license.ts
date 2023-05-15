import * as Secp256k1 from '@dashincubator/secp256k1';
import chalk from 'chalk';

import { License } from '../license/license';
import { toHex, daysBetweenSignedString } from '../utils';

export async function generateLicense(
  // eslint-disable-next-line
  this: any,
  machineID: string
): Promise<void> {
  // eslint-disable-next-line
  const { privateKey, issuerId, validUntil } = this.opts();

  if (typeof issuerId === 'undefined') {
    // eslint-disable-next-line
    this.error('Issuer ID (name) must be provided to generate a license.');
    return;
  }

  // eslint-disable-next-line
  const publicKey = typeof privateKey === 'undefined' ? undefined : toHex(Secp256k1.getPublicKey(privateKey));
  const license = await License.create(
    issuerId,
    machineID,
    validUntil ? new Date(validUntil) : validUntil
  );

  if (publicKey) {
    console.log('Operator public key HEX:', chalk.green(publicKey), '\n');
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

  if (publicKey) {
    await license.sign(privateKey);
    console.log(chalk.green('Signed license key:'));
    console.log(license.signedLicense);
  } else {
    console.log(chalk.green('Non-signed (RAW) license key:'));
    console.log(license.rawLicense);
  }
}
