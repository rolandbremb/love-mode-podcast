// "Cuéntamelo por email": shared by the form (in the browser) and the server

// What the paid email costs, in cents. Keep it in step with the price shown on the
// home page ("Cuéntamelo por email" in the Studio).
export const EMAIL_SESSION_PRICE_CENTS = 3500;

// The most a story can be, as promised on the home page
export const EMAIL_SESSION_MAX_WORDS = 600;

export function countWords(text: string) {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

// How long Andrea has to answer a paid email, as promised on the page
export const EMAIL_SESSION_REPLY_BUSINESS_DAYS = 3;

// The reply deadline: three business days (Monday to Friday) after payment, counted on
// Miami's calendar (the server runs on UTC, where a Friday evening is already Saturday).
// The result is midday in Miami, so it reads as the same date wherever it's shown.
export function replyDeadline(paidAt: Date | string) {
  const [year, month, day] = new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York" })
    .format(new Date(paidAt))
    .split("-")
    .map(Number);
  const date = new Date(Date.UTC(year, month - 1, day, 12));
  let left = EMAIL_SESSION_REPLY_BUSINESS_DAYS;
  while (left > 0) {
    date.setUTCDate(date.getUTCDate() + 1);
    if (date.getUTCDay() !== 0 && date.getUTCDay() !== 6) left--;
  }
  date.setUTCHours(17);
  return date;
}
