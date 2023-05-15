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

export const daysBetween = (date1: Date, date2: Date): number => {
  // One day in milliseconds
  const oneDay = 1000 * 60 * 60 * 24;
  // Calculating the time difference between two dates
  const diffInTime = date2.getTime() - date1.getTime();
  // Calculating the no. of days between two dates
  const diffInDays = Math.round(diffInTime / oneDay);

  return diffInDays;
};

export const daysBetweenSignedString = (date1: Date, date2: Date): string => {
  const value = daysBetween(date1, date2);
  return value >= 0 ? `+${value}` : `${value}`;
};
