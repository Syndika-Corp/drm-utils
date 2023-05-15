export const MAX_UNIX_TIMESTAMP = 8640000000000000;

export const toHex = (data: unknown): string =>
  typeof data === 'number'
    ? data.toString(16)
    : Buffer.from(data as any).toString('hex');

export const stringFromHex = (hexData: string): string =>
  Buffer.from(hexData, 'hex').toString('ascii');

export const decimalFromHex = (hexData: string): number =>
  parseInt(hexData, 16);

export const toUnixTimestamp = (date: Date): number =>
  Math.floor(date.getTime() / 1000);

export const fromUnixTimestamp = (timestamp: number | string): Date =>
  new Date(
    (typeof timestamp === 'number' ? timestamp : parseInt(timestamp, 10)) * 1000
  );
