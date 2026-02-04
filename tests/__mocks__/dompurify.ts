/**
 * DOMPurify mock for Node.js environment (Jest)
 * In real browser, DOMPurify removes all HTML tags
 */

const mockDOMPurify = {
  sanitize: (dirty: string, config?: any): string => {
    // Simple sanitization: remove HTML tags, keep text content
    if (!dirty) return '';
    
    // Remove HTML tags
    let cleaned = dirty.replace(/<[^>]*>/g, '');
    
    // Decode HTML entities
    cleaned = cleaned
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#x27;/g, "'");
    
    return cleaned.trim();
  },
};

export default mockDOMPurify;
