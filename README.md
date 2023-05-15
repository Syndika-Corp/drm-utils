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
npm install drm-utils
```

> In case you indend to use terminal command- kindly use `npm install drm-utils -g` instead, to install and register the binary globally.

## Library Usage

```ts
import { License } from 'drm-utils';

const PRIVATE_KEY = Secp256k1.utils.randomPrivateKey();
const PUBLIC_KEY = Secp256k1.getPublicKey(PRIVATE_KEY);

const license = await License.create('alex');
await license.sign(PRIVATE_KEY);

console.log("Your valid license key:", license.signedLicense); // 616c6578-6c3835327162-7dba8218000-3044022058abfe388905b2d3572b67bf6f0d10f3ef5787877ddbb80350733cb5c218ef26022045ba16a22a737cafe84552e54ccdccd545c6a70b486beabcfbab0f250967429f
console.log("Is license key valid?", license.validate(PUBLIC_KEY) ? 'YES' : 'NO'); // YES
```

## Terminal (CLI) Usage

- Help

```bash
drm-utils --help
```

- Generate Operator Key

```bash
Usage: drm-utils pk [options]

Options:
  -h, --help  display help for command
```

- Generate a license key

```bash
Usage: drm-utils generate [options] <machineID>

Arguments:
  machineID                 A MachineID e.g. l852qb

Options:
  -i, --issuer-id <issuer>  Issuer ID (name) to be used
  -v, --valid-until <date>  Valid until date unless lifelong (e.g. "Sep 2025")
  -k, --private-key <key>   Operator PRIVATE key for signing the license (never stored)
  -h, --help                display help for command
```

- Sign a generated raw license

```bash
Usage: drm-utils sign [options] <license>

Arguments:
  license                  NON signed license key, e.g. 616c6578-6c3835327162-7dba8218000

Options:
  -k, --private-key <key>  Operator PRIVATE key (never stored)
  -h, --help               display help for command
```

- Validate a license key (works with both signed and non-signed)

```bash
Usage: drm-utils validate [options] <license>

Arguments:
  license                 Validate a license key (either signed or NON signed), e.g. 616c6578-6c3835327162-7dba8218000 OR
                          616c6578-6c3835327162-7dba8218000-3045022100c915f5f698f840f2cae76c97cd319e8db522593a1dbd273305d332037f8960030220165e9c67349353d4fcc061b4cc0f7b5ab912d7bb92e7eba7db78c622c9039d25

Options:
  -p, --public-key <key>  Operator PUBLIC key (for SIGNED licese only)
  -s, --skip-datecheck    Skip validating time validity (signature only)
  -h, --help              display help for command
```

## Documentation

Multi-Strategy License Key consists of libraries and utils to create and operate offline and online license keys on machines (think Electron).

### License Key Structure

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

[build-img]:https://github.com/Syndika-Corp/drm-utils/actions/workflows/release.yml/badge.svg
[build-url]:https://github.com/Syndika-Corp/drm-utils/actions/workflows/release.yml
[downloads-img]:https://img.shields.io/npm/dt/drm-utils
[downloads-url]:https://www.npmtrends.com/drm-utils
[npm-img]:https://img.shields.io/npm/v/drm-utils
[npm-url]:https://www.npmjs.com/package/drm-utils
[issues-img]:https://img.shields.io/github/issues/Syndika-Corp/drm-utils
[issues-url]:https://github.com/Syndika-Corp/drm-utils/issues
[codecov-img]:https://codecov.io/gh/Syndika-Corp/drm-utils/branch/master/graph/badge.svg?token=uH3xJUIRvo
[codecov-url]:https://codecov.io/gh/Syndika-Corp/drm-utils
[semantic-release-img]:https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg
[semantic-release-url]:https://github.com/semantic-release/semantic-release
[commitizen-img]:https://img.shields.io/badge/commitizen-friendly-brightgreen.svg
[commitizen-url]:http://commitizen.github.io/cz-cli/
