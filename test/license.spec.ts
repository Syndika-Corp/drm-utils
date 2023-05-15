import * as Secp256k1 from '@dashincubator/secp256k1';

import {
  License,
  MAX_UNIX_TIMESTAMP,
  MissingPublicKeyError,
  UnsignedLicenseError,
  InvalidLicenseStringError,
} from '../src';

const ISSUER_ID = 'alex';
// eslint-disable-next-line
const PRIVATE_KEY = Secp256k1.utils.randomPrivateKey();
// eslint-disable-next-line
const PUBLIC_KEY = Secp256k1.getPublicKey(PRIVATE_KEY);
// eslint-disable-next-line
const PUBLIC_KEY_WRONG = Secp256k1.getPublicKey(Secp256k1.utils.randomPrivateKey());

describe('index', () => {
  describe('License', () => {
    it('should properly initialize the License instance defaults', async () => {
      const license = await License.create(ISSUER_ID);
      const currentMachineID = await License.getCurrentMachineID();

      expect(license.issuerId).toStrictEqual(ISSUER_ID);
      expect(license.validUntil).toStrictEqual(new Date(MAX_UNIX_TIMESTAMP));
      expect(currentMachineID.length).toBeGreaterThan(0);
      expect(license.machineId).toStrictEqual(currentMachineID);
      expect(license.signature).toStrictEqual(undefined);
      expect(() => license.signedLicense).toThrowError(UnsignedLicenseError);
    });

    it('should properly initialize the License instance with custom settings', async () => {
      const customMachineId = await License.getCurrentMachineID();
      const customValidUntil = new Date(Date.now() - 86400000); // yesterday

      const license = await License.create(
        ISSUER_ID,
        customMachineId,
        customValidUntil
      );

      expect(license.issuerId).toStrictEqual(ISSUER_ID);
      expect(license.validUntil).toStrictEqual(customValidUntil);
      expect(license.machineId).toStrictEqual(customMachineId);
      expect(license.signature).toStrictEqual(undefined);

      expect(license.validate()).toStrictEqual(false); // due to passed date
      expect(() => license.validate(PUBLIC_KEY)).toThrowError(
        UnsignedLicenseError
      );
    });

    it('should generate valid license key', async () => {
      const license = await License.create(ISSUER_ID);
      await license.sign(PRIVATE_KEY);

      expect(license.signature?.length).toBeGreaterThan(0);
      expect(license.validate(PUBLIC_KEY)).toStrictEqual(true);
      expect(() => license.validate()).toThrowError(MissingPublicKeyError);
    });

    it('should not validate against a wrong public key', async () => {
      const license = await License.create(ISSUER_ID);
      await license.sign(PRIVATE_KEY);

      expect(license.signature?.length).toBeGreaterThan(0);
      expect(license.validate(PUBLIC_KEY_WRONG)).toStrictEqual(false);
      expect(() => license.validate()).toThrowError(MissingPublicKeyError);
    });

    it('should be able to restore and validate a non signed license string', async () => {
      const license = await License.create(ISSUER_ID);
      const licenseString = license.rawLicense;
      const toCheck = License.fromRawLicense(licenseString);

      expect(() => License.fromSignedLicense(licenseString)).toThrowError(
        InvalidLicenseStringError
      );

      expect(license.issuerId).toStrictEqual(toCheck.issuerId);
      expect(license.validUntil).toStrictEqual(toCheck.validUntil);
      expect(license.machineId).toStrictEqual(toCheck.machineId);

      expect(license.validate()).toStrictEqual(true);
      expect(() => license.validate(PUBLIC_KEY)).toThrowError(
        UnsignedLicenseError
      );
    });

    it('should be able to restore and validate a signed license string', async () => {
      const license = await License.create(ISSUER_ID);
      await license.sign(PRIVATE_KEY);
      const licenseString = license.signedLicense;
      const toCheck = License.fromSignedLicense(licenseString);

      expect(() => License.fromRawLicense(licenseString)).toThrowError(
        InvalidLicenseStringError
      );

      expect(license.issuerId).toStrictEqual(toCheck.issuerId);
      expect(license.validUntil).toStrictEqual(toCheck.validUntil);
      expect(license.machineId).toStrictEqual(toCheck.machineId);
      expect(license.signature).toStrictEqual(toCheck.signature);

      expect(license.validate(PUBLIC_KEY)).toStrictEqual(true);
      expect(() => license.validate()).toThrowError(MissingPublicKeyError);
    });
  });
});
