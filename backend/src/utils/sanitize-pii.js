const EMAIL_REGEX = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;

const PHONE_REGEX =
  /(?<!\d)(?:\+?\d{1,3}[\s.-]?)?(?:\(?\d{2,5}\)?[\s.-]?)?\d{3,5}[\s.-]?\d{3,5}(?!\d)/g;

const sanitizePii = (text) => {
  return text.replace(EMAIL_REGEX, "[EMAIL]").replace(PHONE_REGEX, "[PHONE]");
};

export { sanitizePii };
