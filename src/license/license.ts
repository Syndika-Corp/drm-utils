import { machineId as getMachineId } from 'node-machine-id';
import murmurHash from '@emotion/hash';
import { createHash } from 'crypto';
import * as Secp256k1 from '@dashincubator/secp256k1';

import { PrivateKey, PublicKey } from '../interfaces';
import {
  toHex,
  stringFromHex,
  decimalFromHex,
  toUnixTimestamp,
  fromUnixTimestamp,
  MAX_UNIX_TIMESTAMP,
} from '../utils';

import { MissingPublicKeyError } from './errors/missing-pubkey';
import { UnsignedLicenseError } from './errors/unsigned-license';
import { InvalidLicenseStringError } from './errors/invalid-license-string';

export class License {
  /**
   * @param _issuerId License issuer (e.g. "alex")
   * @param _machineId License Machine ID it's issued for (e.g. comp-1 or auto-id)
   * @param _validUntil License valid until date
   * @param _signature License secp256k1 signature to validate above parameters issued by certain issuer
   */
  constructor(
    private _issuerId: string,
    private _machineId: string,
    private _validUntil: Date,
    private _signature?: string | undefined
  ) {}

  /**
   * Get license issuer ID
   */
  public get issuerId(): string {
    return this._issuerId;
  }

  /**
   * Get license Machine ID
   */
  public get machineId(): string {
    return this._machineId;
  }

  /**
   * Get license valid until date
   */
  public get validUntil(): Date {
    return this._validUntil;
  }

  /**
   * Get license secp256k1 signature to validate against
   */
  public get signature(): string | undefined {
    return this._signature;
  }

  /**
   * Get raw license string (without secp256k1 signature)
   */
  public get rawLicense(): string {
    return `${toHex(this._issuerId)}-${toHex(this._machineId)}-${toHex(
      toUnixTimestamp(this._validUntil)
    )}`;
  }

  /**
   * Get raw license hash (mainly used internallly)
   */
  public get rawLicenseHash(): string {
    // Important: Secp256k1 sha256 function was broken
    const hash = createHash('sha256');
    hash.update(this.rawLicense);
    return hash.digest('hex');
  }

  /**
   * Get secp256k1 signed license string
   *
   * @throws UnsignedLicenseError if the license is unsigned
   */
  public get signedLicense(): string {
    if (typeof this._signature === 'undefined')
      throw new UnsignedLicenseError();
    return `${this.rawLicense}-${this._signature}`;
  }

  /**
   * Sign license using an issuer private key
   *
   * @param issuerPrivateKey Issuer private key (e.g. Secp256k1.utils.randomPrivateKey())
   * @returns Returns same License instance
   */
  public async sign(issuerPrivateKey: PrivateKey): Promise<License> {
    this._signature = toHex(
      // eslint-disable-next-line
      await Secp256k1.sign(this.rawLicenseHash, issuerPrivateKey)
    );
    return this;
  }

  /**
   * Validate secp256k1 signed license
   *
   * @param issuerPublicKey  Issuer public key (e.g. Secp256k1.getPublicKey(PRIVATE_KEY))
   * @returns Returns true if license has both valid signature (if applicable) and date
   * @throws MissingPublicKeyError if public key missing for a signed license
   * @throws UnsignedLicenseError if the license is unsigned
   */
  public validate(issuerPublicKey?: PublicKey): boolean {
    if (
      typeof this._signature !== 'undefined' &&
      typeof issuerPublicKey === 'undefined'
    ) {
      throw new MissingPublicKeyError();
    }

    if (
      typeof issuerPublicKey !== 'undefined' &&
      !this.validateSignature(issuerPublicKey)
    ) {
      return false;
    }

    return this._validUntil.getTime() > new Date().getTime();
  }

  /**
   * Validate secp256k1 signed license against an issuer public key
   *
   * @param issuerPublicKey Issuer public key (e.g. Secp256k1.getPublicKey(PRIVATE_KEY))
   * @returns Returns true if license has a valid signature generated by the passed issuer
   * @throws UnsignedLicenseError if the license is unsigned
   */
  public validateSignature(issuerPublicKey: PublicKey): boolean {
    if (typeof this._signature === 'undefined')
      throw new UnsignedLicenseError();
    // eslint-disable-next-line
    return Secp256k1.verify(
      this._signature,
      this.rawLicenseHash,
      issuerPublicKey
    );
  }

  /**
   * Restore a non signed (raw) license from license string
   *
   * @param license The raw license string
   * @returns a License instance with restored parameters
   * @throws InvalidLicenseStringError if raw signature is invalid
   */
  public static fromRawLicense(license: string): License {
    const parts = license.split('-').filter(Boolean);
    if (parts.length !== 3)
      throw new InvalidLicenseStringError(3, parts.length);

    return new License(
      stringFromHex(parts[0]),
      stringFromHex(parts[1]),
      fromUnixTimestamp(decimalFromHex(parts[2]))
    );
  }

  /**
   * Restore a non secp256k1 signed license from license string
   *
   * @param license The signed license string
   * @returns a License instance with restored parameters
   * @throws InvalidLicenseStringError if raw signature is invalid
   */
  public static fromSignedLicense(license: string): License {
    const parts = license.split('-').filter(Boolean);
    if (parts.length !== 4)
      throw new InvalidLicenseStringError(4, parts.length);

    return new License(
      stringFromHex(parts[0]),
      stringFromHex(parts[1]),
      fromUnixTimestamp(decimalFromHex(parts[2])),
      parts[3]
    );
  }

  /**
   * Creates a License instance with defaults if custom parameters skipped
   *
   * @param issuerId License issuer (e.g. "alex")
   * @param machineId License Machine ID it's issued for (e.g. comp-1 or auto-id)
   * @param validUntil License valid until date
   * @param signature License secp256k1 signature to validate above parameters issued by certain issuer
   * @returns a License instance initialized with either passed parameters or defaults
   */
  public static async create(
    issuerId: string,
    machineId?: string,
    validUntil?: Date,
    signature?: string | undefined
  ): Promise<License> {
    return new License(
      issuerId,
      typeof machineId !== 'undefined'
        ? machineId
        : await License.getCurrentMachineID(),
      typeof validUntil !== 'undefined'
        ? validUntil
        : new Date(MAX_UNIX_TIMESTAMP),
      signature
    );
  }

  /**
   * Generate a short ID for current machine (or container)
   *
   * @returns A small hashed machine ID
   */
  public static async getCurrentMachineID(): Promise<string> {
    return murmurHash(await getMachineId());
  }
}
