import { machineId as getMachineId } from 'node-machine-id';
import murmurHash from '@emotion/hash';
import { createHash } from 'crypto';
import * as Secp256k1 from '@dashincubator/secp256k1';

import { PrivateKey, PublicKey } from '../interfaces';
import {
  toHex, stringFromHex, decimalFromHex, toUnixTimestamp, fromUnixTimestamp,
  MAX_UNIX_TIMESTAMP,
} from '../utils';
import { UnsignedLicenseError } from './errors/unsigned-license';

export class License {
  constructor(
    private _issuerId: string,
    private _machineId: string,
    private _validUntil: Date,
    private _signature?: string | undefined,
  ) {}

  public get issuerId(): string {
    return this._issuerId;
  }

  public get machineId(): string {
    return this._machineId;
  }

  public get validUntil(): Date {
    return this._validUntil;
  }

  public get signature(): string | undefined {
    return this._signature;
  }

  public get rawLicense(): string {
    /*
      hex(key-issuer-id)-murmur2(machine-id)-hex(valid-until)
    */
    return `${ toHex(this._issuerId) }-${ toHex(this._machineId) }-${ toHex(toUnixTimestamp(this._validUntil)) }`;
  }

  public get rawLicenseHash(): string {
    // Important: Secp256k1 sha256 function was broken
    const hash = createHash('sha256');
    hash.update(this.rawLicense);
    return hash.digest('hex');
  }

  public get signedLicense(): string {
    if (typeof this._signature === 'undefined') throw new UnsignedLicenseError();
    return `${ this.rawLicense }-${ this._signature }`;
  }

  public async sign(issuerPrivateKey: PrivateKey): Promise<License> {
    /*
      deriv = sha256({hex(key-issuer-id)}-{murmur2(machine-id)}-{hex(valid-until)})
      sig = schnorr.sign(deriv, privateKey) // privateKey- secp256k1 private key
      hexSig = toHex(sig) // the generated hex-sig
    */
    this._signature = toHex(await Secp256k1.sign(this.rawLicenseHash, issuerPrivateKey));
    return this;
  }

  public verify(issuerPublicKey: PublicKey): Promise<boolean> {
    if (typeof this._signature === 'undefined') throw new UnsignedLicenseError();
    return Secp256k1.verify(this._signature, this.rawLicenseHash, issuerPublicKey);
  }

  public static fromRawLicense(license: string): License {
    const [ issuerId, machineId, validUntil ] = license.split('-');
    return new License(
      stringFromHex(issuerId),
      stringFromHex(machineId),
      fromUnixTimestamp(decimalFromHex(validUntil))
    );
  }

  // public static fromSignedLicense(license: string, dasheizeSeqLength?: number): License {
  //   return new License();
  // }

  public static async create(
    issuerId: string,
    machineId?: string,
    validUntil?: Date,
    signature?: string | undefined
  ): Promise<License> {
    return new License(
      issuerId,
      typeof machineId !== 'undefined' ? machineId : murmurHash(await getMachineId()), // make ID small enough
      typeof validUntil !== 'undefined' ? validUntil : new Date(MAX_UNIX_TIMESTAMP),
      signature
    );
  }
}
