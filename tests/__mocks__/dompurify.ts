/**
 * DOMPurify mock for Node.js environment (Jest)
 * In real browser, DOMPurify removes all HTML tags
 */

const mockDOMPurify = {
  sanitize: (dirty: string, _config?: unknown): string => {
    // Simple sanitization: remove HTML tags, keep text content
    if (!dirty) return '';
    
    // Remove HTML tags
    let cleaned = dirty.replaceAll(/<[^>]*>/g, '');
    
    // Decode HTML entities
    cleaned = cleaned
      .replaceAll('&lt;', '<')
      .replaceAll('&gt;', '>')
      .replaceAll('&amp;', '&')
      .replaceAll('&quot;', '"')
      .replaceAll('&#x27;', "'");
    
    return cleaned.trim();
  },
};

export default mockDOMPurify;
