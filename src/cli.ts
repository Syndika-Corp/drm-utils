#!/usr/bin/env node

import { Command } from 'commander';

import { generatePK } from './cli/generate-pk';
import { signLicense } from './cli/sign-license';
import { validateLicense } from './cli/validate-license';
import { generateLicense } from './cli/generate-license';

const program = new Command();

async function main() {
  program
    .command('pk')
    .summary('Generate a secp256k1 operator private key')
    .action(generatePK);

  program
    .command('generate')
    .argument('<machineID>', 'A MachineID e.g. l852qb')
    .requiredOption('-i, --issuer-id <issuer>', 'Issuer ID (name) to be used')
    .option(
      '-v, --valid-until <date>',
      'Valid until date unless lifelong (e.g. "Sep 2025")'
    )
    .option(
      '-k, --private-key <key>',
      'Operator PRIVATE key for signing the license (never stored)'
    )
    .summary(
      'Generate a license key for a machine ID (optionally signed if pk passed)'
    )
    .action(generateLicense);

  program
    .command('validate')
    .argument(
      '<license>',
      'Validate a license key (either signed or NON signed), e.g. 616c6578-6c3835327162-7dba8218000 OR 616c6578-6c3835327162-7dba8218000-3045022100c915f5f698f840f2cae76c97cd319e8db522593a1dbd273305d332037f8960030220165e9c67349353d4fcc061b4cc0f7b5ab912d7bb92e7eba7db78c622c9039d25'
    )
    .option(
      '-p, --public-key <key>',
      'Operator PUBLIC key (for SIGNED licese only)'
    )
    .option(
      '-s, --skip-datecheck',
      'Skip validating time validity (signature only)'
    )
    .summary('Validate a license key')
    .action(validateLicense);

  program
    .command('sign')
    .argument(
      '<license>',
      'NON signed license key, e.g. 616c6578-6c3835327162-7dba8218000'
    )
    .requiredOption(
      '-k, --private-key <key>',
      'Operator PRIVATE key (never stored)'
    )
    .summary('Sign generated license using operator private key')
    .action(signLicense);

  await program.parseAsync(process.argv);
}

main().catch(e => program.error(e));
