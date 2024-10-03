const WEEK_DAY = 7;

export function getExpiryDate({
  week = 0,
  day = 0,
}: {
  week?: number;
  day?: number;
}): Date {
  const expiryDate = new Date();

  expiryDate.setDate(expiryDate.getDate() + week * WEEK_DAY + day);

  return expiryDate;
}
