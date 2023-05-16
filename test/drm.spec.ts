import fs from 'fs-extra';

import {
  ChainedStorage, License, EnvStorage, FileStorage, DRM,
  MisingLicenseError, ILicenseStorage, OfflineValidator,
  LICENSE_ENV_VAR, NoLicenseError, PersistingLicenseError,
} from "../src";

const ISSUER_ID = 'cucer';
// const MACHINE_ID = 'l852qb';
// const VALID_UNTIL = new Date("Sep 2025");
const SIGNED_LICENSE = '6375636572-6c3835327162-68b4b7d0-3044022032de288bdfa6bd9975eb3fe119bdca2d1086ee00ef297ebb0fe193e95a04cb1602206588e0db8424c66a915c93458e4812d3048e37bac088f3ef433a8584148e58fa';
// const PRIVATE_KEY = '2eb389fcb71c7b2f43da2d81c203639b18f4f469ae7645e6c435fabe2bf09282';
const PUBLIC_KEY = '047c237e5dd2a2cb6d1d3176997e50240fcdaf40704b898eb46d22882c6048d8d77deafe1169c2dc6010241e3f7654a5a07a1cf22be38dd8907deafafa321e16ad';
const ISSUERS_MAPPING = new Map().set(ISSUER_ID, PUBLIC_KEY);

export class RandomLicenseError extends Error {
  constructor() {
    super();

    // 👇️ because we are extending a built-in class
    Object.setPrototypeOf(this, RandomLicenseError.prototype);
  }
}

class BrokenStorage implements ILicenseStorage {
  public load(throwRandom = false): License {
    if (throwRandom)
      throw new RandomLicenseError();
    throw new MisingLicenseError('License will never exist');
  }

  public store(_: License): boolean {
    return false;
  }
}

describe('drm-utils', () => {
  describe('Storage', () => {
    it('should properly load the license from ENV', async () => {
      const storage = new EnvStorage();

      expect(() => storage.load()).toThrowError(MisingLicenseError);

      process.env[LICENSE_ENV_VAR] = SIGNED_LICENSE;
      expect(storage.load().signedLicense).toStrictEqual(SIGNED_LICENSE);
      delete process.env[LICENSE_ENV_VAR];
    });

    it('should properly store the license to ENV', async () => {
      const storage = new EnvStorage();
      const license = License.fromSignedLicense(SIGNED_LICENSE);

      expect(storage.store(license)).toStrictEqual(true);
      expect(process.env[LICENSE_ENV_VAR]).toStrictEqual(SIGNED_LICENSE);
      delete process.env[LICENSE_ENV_VAR];
    });

    it('should properly load and store the license from ENV with custom name specified', async () => {
      const storage = new EnvStorage();
      const customName = 'mycustomenvvarforthelicense';

      expect(() => storage.load(customName)).toThrowError(MisingLicenseError);

      process.env[customName.toUpperCase()] = SIGNED_LICENSE;
      const license = storage.load(customName);
      expect(license.signedLicense).toStrictEqual(SIGNED_LICENSE);
      delete process.env[customName.toUpperCase()];

      expect(storage.store(license)).toStrictEqual(true);
      expect(process.env[customName.toUpperCase()]).toStrictEqual(SIGNED_LICENSE);
      delete process.env[customName.toUpperCase()];
    });

    it('should properly load the license from file', async () => {
      const storage = new FileStorage();

      expect(storage.load()).rejects.toThrowError(MisingLicenseError);

      await fs.writeFile(storage.filePath, SIGNED_LICENSE);
      expect((await storage.load()).signedLicense).toStrictEqual(SIGNED_LICENSE);
      await fs.remove(storage.filePath);
    });

    it('should properly store the license to file', async () => {
      const storage = new FileStorage();
      const license = License.fromSignedLicense(SIGNED_LICENSE);

      expect(await storage.store(license)).toStrictEqual(true);
      expect((await fs.readFile(storage.filePath)).toString()).toStrictEqual(SIGNED_LICENSE);
      await fs.remove(storage.filePath);
    });

    it('should properly load and store the license from file with custom name specified', async () => {
      const storage = new FileStorage();
      const customName = 'mycustomfileforthelicense.lic';

      expect(storage.load(customName)).rejects.toThrowError(MisingLicenseError);

      await fs.writeFile(storage.filePath, SIGNED_LICENSE);
      const license = await storage.load(customName);
      expect(license.signedLicense).toStrictEqual(SIGNED_LICENSE);
      await fs.remove(storage.filePath);

      expect(await storage.store(license)).toStrictEqual(true);
      expect((await fs.readFile(storage.filePath)).toString()).toStrictEqual(SIGNED_LICENSE);
      await fs.remove(storage.filePath);
    });

    it('should properly load the license from storage chain', async () => {
      const storage = ChainedStorage.create();

      expect(storage.load()).rejects.toThrowError(MisingLicenseError);
      
      process.env[LICENSE_ENV_VAR] = SIGNED_LICENSE;
      expect((await storage.load()).signedLicense).toStrictEqual(SIGNED_LICENSE);
      delete process.env[LICENSE_ENV_VAR];

      expect(storage.storage<FileStorage>(FileStorage)?.filePath).not.toBeUndefined();
      await fs.writeFile(storage.storage<FileStorage>(FileStorage)?.filePath as string, SIGNED_LICENSE);
      expect((await storage.load()).signedLicense).toStrictEqual(SIGNED_LICENSE);
      await fs.remove(storage.storage<FileStorage>(FileStorage)?.filePath as string);
    });

    it('should properly store the license to storage chain', async () => {
      const storage = ChainedStorage.create();
      const license = License.fromSignedLicense(SIGNED_LICENSE);

      expect(storage.load()).rejects.toThrowError(MisingLicenseError);

      expect(await storage.store(license)).toStrictEqual(true);
      expect(process.env[LICENSE_ENV_VAR]).toStrictEqual(SIGNED_LICENSE);
      expect((await fs.readFile(storage.storage<FileStorage>(FileStorage)?.filePath as string)).toString()).toStrictEqual(SIGNED_LICENSE);
      delete process.env[LICENSE_ENV_VAR];
      await fs.remove(storage.storage<FileStorage>(FileStorage)?.filePath as string);
    });

    it('should expectedly fail on storage chain errors', async () => {
      const storage = ChainedStorage.create(new BrokenStorage());
      const license = License.fromSignedLicense(SIGNED_LICENSE);

      expect(storage.load()).rejects.toThrowError(MisingLicenseError);
      expect(storage.load([true])).rejects.toThrowError(RandomLicenseError);
      expect(await storage.store(license)).toStrictEqual(false);
    });
  });

  describe('Validation', () => {
    it('should validate licenses using offline mapping', async () => {
      const validator = new OfflineValidator(ISSUERS_MAPPING);
      const emptyValidator = new OfflineValidator(new Map());
      const license = License.fromSignedLicense(SIGNED_LICENSE);

      expect(emptyValidator.validate(license)).toStrictEqual(false);
      expect(validator.validate(license)).toStrictEqual(true);
    });
  });

  describe('DRM', () => {
    it('should properly initialize defaults', async () => {
      const drm = DRM.create(ISSUERS_MAPPING);

      expect(() => DRM.create(new Map())).toThrowError(RangeError);

      expect(drm.license).toBeUndefined();
      expect(drm.hasLicense).toStrictEqual(false);

      expect(drm.loadLicense()).rejects.toThrowError(MisingLicenseError);
      expect(drm.validateLicense()).rejects.toThrowError(NoLicenseError);
      expect(drm.storeLicense()).rejects.toThrowError(NoLicenseError);

      expect(drm.setLicense(SIGNED_LICENSE).hasLicense).toStrictEqual(true);
      expect(drm.setLicense(License.fromSignedLicense(SIGNED_LICENSE)).hasLicense).toStrictEqual(true);
    });

    it('should properly load a license', async () => {
      const drm = DRM.create(ISSUERS_MAPPING, [new EnvStorage()]);
      const license = License.fromSignedLicense(SIGNED_LICENSE);

      process.env[LICENSE_ENV_VAR] = SIGNED_LICENSE;
      await drm.loadLicense();
      expect(drm.hasLicense).toStrictEqual(true);
      expect(drm.license).toStrictEqual(license);
      delete process.env[LICENSE_ENV_VAR];
    });

    it('should properly store a license', async () => {
      const drm = DRM.create(ISSUERS_MAPPING, [new EnvStorage()]);
      const brokenDrm = DRM.create(ISSUERS_MAPPING, [new BrokenStorage()]);

      expect(brokenDrm.storeLicense(SIGNED_LICENSE)).rejects.toThrowError(PersistingLicenseError);

      expect(drm.storeLicense(SIGNED_LICENSE)).resolves.not.toThrowError();
      expect(drm.hasLicense).toStrictEqual(true);
      expect(process.env[LICENSE_ENV_VAR]).toStrictEqual(SIGNED_LICENSE);
      delete process.env[LICENSE_ENV_VAR];
    });

    it('should properly validate a license', async () => {
      const license = License.fromSignedLicense(SIGNED_LICENSE);
      const drm = DRM.create(ISSUERS_MAPPING, [new BrokenStorage()]);

      expect(await drm.validateLicense(SIGNED_LICENSE)).toStrictEqual(true);
      expect(drm.hasLicense).toStrictEqual(true);
      expect(drm.license).toStrictEqual(license);
    });
  });
});
