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
