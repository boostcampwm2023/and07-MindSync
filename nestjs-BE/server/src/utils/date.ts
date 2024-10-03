import { REFRESH_TOKEN_EXPIRY_DAYS } from '../config/magic-number';

export function getExpiryDate(): Date {
  const currentDate = new Date();
  const expiryDate = new Date(currentDate);
  expiryDate.setDate(currentDate.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);
  return expiryDate;
}
