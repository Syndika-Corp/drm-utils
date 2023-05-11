import { machineId } from 'node-machine-id';
import * as Secp256k1 from '@dashincubator/secp256k1';
import murmurHash from '@emotion/hash';

import { License, MAX_UNIX_TIMESTAMP, toHex } from '../src';

const ISSUER_ID = 'alex';
const PRIVATE_KEY = Secp256k1.utils.randomPrivateKey();
const PUBLIC_KEY = Secp256k1.getPublicKey(PRIVATE_KEY);

describe('index', () => {
  describe('License', () => {
    it('should properly initialize the License instance defaults', async () => {
      const license = await License.create(ISSUER_ID);

      expect(license.issuerId).toStrictEqual(ISSUER_ID);
      expect(license.validUntil).toStrictEqual(new Date(MAX_UNIX_TIMESTAMP));
      expect(license.machineId).toStrictEqual(murmurHash(await machineId()));
      expect(license.signature).toStrictEqual(undefined);
    });

    it('should be able to restore from raw license string', async () => {
      const license = await License.create(ISSUER_ID);
      const licenseString = license.rawLicense;
      const toCheck = License.fromRawLicense(licenseString);

      expect(license.issuerId).toStrictEqual(toCheck.issuerId);
      expect(license.validUntil).toStrictEqual(toCheck.validUntil);
      expect(license.machineId).toStrictEqual(toCheck.machineId);
    });

    it('should generate valid license key', async () => {
      const license = await License.create(ISSUER_ID);
      await license.sign(PRIVATE_KEY);

      console.log('license.signature', license.signature)
      console.log('license.rawLicense', license.rawLicense)
      console.log('license.signedLicense', license.signedLicense)

      expect(license.signature?.length).toBeGreaterThan(0);
      expect(license.verify(PUBLIC_KEY)).toStrictEqual(true);
    });
  });
});
