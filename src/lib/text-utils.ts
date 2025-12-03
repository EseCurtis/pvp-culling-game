/**
 * Text utility functions for truncation and word breaking
 */

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "…";
}

/**
 * Break long words to prevent overflow
 * Adds word-break CSS class handling
 */
export function shouldBreakWords(text: string): boolean {
  // Check if text contains words longer than 30 characters
  const words = text.split(/\s+/);
  return words.some((word) => word.length > 30);
}

/**
 * Truncate text with ellipsis and respect word boundaries when possible
 */
export function smartTruncate(text: string, maxLength: number): string {
  text = text ?? ""
  if (text.length <= maxLength) return text;
  
  // Try to truncate at word boundary
  const truncated = text.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");
  
  if (lastSpace > maxLength * 0.8) {
    // If we found a space reasonably close to the limit, use it
    return truncated.slice(0, lastSpace).trim() + "…";
  }
  
  return truncated.trim() + "…";
}

