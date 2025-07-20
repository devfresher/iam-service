export function capitalizeWords(text: string): string {
  return text
    .trim()
    .split(' ')
    .map((v) => v.charAt(0).toUpperCase() + v.slice(1).toLowerCase())
    .join(' ');
}
