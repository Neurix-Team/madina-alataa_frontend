import DOMPurify from 'dompurify';

// Sanitize HTML string before inserting into the DOM.
// Usage: import { sanitizeHtml } from 'src/utils/sanitizeHtml';
export function sanitizeHtml(html) {
  if (!html) return '';
  return DOMPurify.sanitize(html, {USE_PROFILES: {html: true}});
}

export default sanitizeHtml;
