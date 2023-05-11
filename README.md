# DRM Utils

[![npm package][npm-img]][npm-url]
[![Build Status][build-img]][build-url]
[![Downloads][downloads-img]][downloads-url]
[![Issues][issues-img]][issues-url]
[![Code Coverage][codecov-img]][codecov-url]
[![Commitizen Friendly][commitizen-img]][commitizen-url]
[![Semantic Release][semantic-release-img]][semantic-release-url]

> DRM Utils is a utility library made for Typescript indended to help licensing your NodeJS software (e.g. Electron).

## Install

```bash
npm install @syndika/drm-utils
```

## Multi-Strategy License Key (MSLK)

Multi-Strategy License Key consists of libraries and utils to create and operate offline and online license keys on machines (think Electron).

### Key Structure

License Key Standard: `{hex(key-issuer-id)}-{hex(murmur2(machine-id))}-{hex(valid-until)}-{hex-sig}`

- `key-issuer-id`- License Key Issuer ID, further mapped to the `secp256k1` public key to verify signature license key segment. It can be either offline (hardcoded onto config/env) or online (fetched from a license server).

- `murmur2()`- MurmurHash2 is a non-cryptographic hash function suitable for general hash-based lookup/validation. It is fast and small in size thus suitable for it's purpose of the local machine ID validation against the dedicated license key segment.

- `machine-id`- Local Machine ID generated crossplatform (for Win uses `MachineGuid` from the registry `HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Cryptography`, OXS- `IOPlatformUUID` and Linux- `/var/lib/dbus/machine-id`).

- `valid-until`- Timestamp the license key is valid until. If you want the key to be untlimited in time, simply use some `Number.MAX_SAFE_INTEGER` (e.g. max value of the signed UINT32).

- `hex-sig`- Signature is the main component used to validate the key. Details described below.

#### `hex-sig` Signature component

The signature is the hex representation of a secp256k1 signature following [BIP0340](https://github.com/bitcoin/bips/blob/master/bip-0340.mediawiki) derived from license segments parameters (`key-issuer-id`, `machine-id`, `machine-id`), hashed using sha256 standard as following:

```
deriv = sha256({hex(key-issuer-id)}-{hex(murmur2(machine-id))}-{hex(valid-until)})
sig = secp256k1.sign(deriv, privateKey) // privateKey- secp256k1 private key
hexSig = toHex(sig) // the generated hex-sig
```

The signature verifiable as following:

```
sig = fromHex(hexSig)
isValid = secp256k1.verify(sig, deriv, pubKey) // isValid - boolean, pubKey- public key derived from secp256k1 private key
```

> Note that the hex representation of signature might be normalized/humanized e.g. by adding dashes every 32 bytes to visually separate/enhance the signature look.

## Usage

```ts
import { myPackage } from '@syndika/drm-utils';

myPackage('hello');
//=> 'hello from my package'
```

## API

### myPackage(input, options?)

#### input

Type: `string`

Lorem ipsum.

#### options

Type: `object`

##### postfix

Type: `string`
Default: `rainbows`

Lorem ipsum.

[build-img]:https://github.com/Syndika-Corp/drm-utils/actions/workflows/release.yml/badge.svg
[build-url]:https://github.com/Syndika-Corp/drm-utils/actions/workflows/release.yml
[downloads-img]:https://img.shields.io/npm/dt/@syndika/drm-utils
[downloads-url]:https://www.npmtrends.com/@syndika/drm-utils
[npm-img]:https://img.shields.io/npm/v/@syndika/drm-utils
[npm-url]:https://www.npmjs.com/package/@syndika/drm-utils
[issues-img]:https://img.shields.io/github/issues/Syndika-Corp/drm-utils
[issues-url]:https://github.com/Syndika-Corp/drm-utils/issues
[codecov-img]:https://codecov.io/gh/Syndika-Corp/drm-utils/branch/main/graph/badge.svg
[codecov-url]:https://codecov.io/gh/Syndika-Corp/drm-utils
[semantic-release-img]:https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg
[semantic-release-url]:https://github.com/semantic-release/semantic-release
[commitizen-img]:https://img.shields.io/badge/commitizen-friendly-brightgreen.svg
[commitizen-url]:http://commitizen.github.io/cz-cli/
