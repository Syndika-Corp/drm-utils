import * as Secp256k1 from '@dashincubator/secp256k1';
import chalk from 'chalk';

import { License } from '../license/license';
import { toHex } from '../utils';
import { daysBetweenSignedString } from './utils';

export async function signLicense(
  // eslint-disable-next-line
  this: any,
  rawLicense: string
): Promise<void> {
  // eslint-disable-next-line
  const { privateKey } = this.opts();
  // eslint-disable-next-line
  const publicKey = toHex(Secp256k1.getPublicKey(privateKey));
  const license = License.fromRawLicense(rawLicense);

  console.log('Operator public key HEX:', chalk.green(publicKey), '\n');

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

  await license.sign(privateKey);
  console.log(chalk.green('Signed license key:'));
  console.log(license.signedLicense);
}
