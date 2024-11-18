const WEEK_DAY = 7;

export function getExpiryDate({
  week = 0,
  day = 0,
  hour = 0,
}: {
  week?: number;
  day?: number;
  hour?: number;
}): Date {
  const expiryDate = new Date();

  expiryDate.setDate(expiryDate.getDate() + week * WEEK_DAY + day);
  expiryDate.setHours(expiryDate.getHours() + hour);

  return expiryDate;
}

export function checkExpiry(targetDate: Date) {
  const currentTimestamp = new Date();
  return targetDate < currentTimestamp ? true : false;
}
