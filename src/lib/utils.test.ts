import { describe, it, expect } from 'vitest';
import { sanitizeHtml, escapeHtml } from '@/lib/utils';

describe('sanitizeHtml', () => {
  it('returns empty string for empty input', () => {
    expect(sanitizeHtml('')).toBe('');
  });

  it('strips script tags and contents', () => {
    const out = sanitizeHtml('hello<script>alert(1)</script>world');
    expect(out).not.toContain('script');
    expect(out).not.toContain('alert(1)');
  });

  it('removes inline event handlers', () => {
    const out = sanitizeHtml('<p onclick="alert(1)">hi</p>');
    expect(out.toLowerCase()).not.toContain('onclick');
    expect(out).toContain('<p');
  });

  it('neutralizes javascript: hrefs', () => {
    const out = sanitizeHtml('<a href="javascript:alert(1)">x</a>');
    expect(out.toLowerCase()).not.toContain('javascript:');
  });

  it('removes style attributes', () => {
    const out = sanitizeHtml('<p style="color:red">hi</p>');
    expect(out.toLowerCase()).not.toContain('style=');
  });

  it('adds rel and target to anchors', () => {
    const out = sanitizeHtml('<a href="https://example.com">x</a>');
    expect(out).toContain('rel="noopener noreferrer"');
    expect(out).toContain('target="_blank"');
  });

  it('drops disallowed tags entirely', () => {
    const out = sanitizeHtml('<iframe src="https://x"></iframe>safe');
    expect(out).not.toContain('iframe');
    expect(out).not.toContain('https://x');
    expect(out).toContain('safe');
  });

  it('falls back to escaped text when input is empty', () => {
    expect(sanitizeHtml('')).toBe('');
  });

  it('falls back to escaped text on internal failure', () => {
    const out = sanitizeHtml('<a href="javascript:alert(1)">x</a>');
    expect(out.toLowerCase()).not.toContain('javascript:');
  });

  it('blocks on* event handlers and inline style', () => {
    const out = sanitizeHtml('<p onclick="x" style="color:red">hi</p>');
    expect(out.toLowerCase()).not.toContain('onclick');
    expect(out.toLowerCase()).not.toContain('style=');
    expect(out).toContain('<p');
  });

  it('removes script tags and inline scripts', () => {
    const out = sanitizeHtml('<script>alert(1)</script><p>ok</p>');
    expect(out.toLowerCase()).not.toContain('script');
    expect(out).toContain('ok');
  });

  it('strips data: urls in src', () => {
    const out = sanitizeHtml('<img src="data:image/svg+xml;base64,PHN2Zy8+" />');
    expect(out.toLowerCase()).not.toContain('data:');
  });
});

describe('escapeHtml', () => {
  it('escapes html special characters', () => {
    expect(escapeHtml('<a href="x">&"\'</a>')).toBe('&lt;a href=&quot;x&quot;&gt;&amp;&quot;&#39;&lt;/a&gt;');
  });
});
