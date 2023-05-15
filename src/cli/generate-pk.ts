import * as Secp256k1 from '@dashincubator/secp256k1';
import chalk from 'chalk';

import { toHex } from '../utils';

export async function generatePK(): Promise<void> {
  // eslint-disable-next-line
  const privateKey = await Secp256k1.utils.randomPrivateKey();

  // eslint-disable-next-line
  console.log('Public key HEX:', chalk.green(toHex(Secp256k1.getPublicKey(privateKey))), '\n');

  console.log(
    chalk.green('Please save the operator key below to a secure place and'),
    chalk.red('NEVER SHARE IT!')
  );
  console.log(toHex(privateKey));
}
