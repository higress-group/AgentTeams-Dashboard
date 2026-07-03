import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import DOMPurify from "isomorphic-dompurify"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const HTML_ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

export function escapeHtml(input: string): string {
  return input.replace(/[&<>"']/g, (ch) => HTML_ESCAPE_MAP[ch]);
}

const MATRIX_PURIFY_CONFIG = {
  ALLOWED_TAGS: [
    'b', 'strong', 'i', 'em', 'u', 's', 'del', 'code', 'pre',
    'p', 'br', 'hr', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'blockquote', 'a', 'span', 'div', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'sub', 'sup', 'details', 'summary',
  ],
  ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'id', 'title'],
  ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  ADD_ATTR: ['target', 'rel'],
};

export function sanitizeHtml(html: string): string {
  if (!html) return '';
  try {
    const clean = DOMPurify.sanitize(html, MATRIX_PURIFY_CONFIG) as string;
    return clean.replace(/<a\s/gi, '<a rel="noopener noreferrer" target="_blank" ');
  } catch {
    return escapeHtml(html);
  }
}
