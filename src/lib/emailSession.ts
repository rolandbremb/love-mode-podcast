// "Cuéntamelo por email": shared by the form (in the browser) and the server

// What the paid email costs, in cents. Keep it in step with the price shown on the
// home page ("Cuéntamelo por email" in the Studio).
export const EMAIL_SESSION_PRICE_CENTS = 3500;

// The most a story can be, as promised on the home page
export const EMAIL_SESSION_MAX_WORDS = 600;

export function countWords(text: string) {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}
