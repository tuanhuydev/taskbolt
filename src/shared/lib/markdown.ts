// Simple markdown to HTML converter
export function renderMarkdown(markdown: string): string {
  if (!markdown) return "";

  const html = markdown
    // Headers
    .replace(/^### (.*$)/gim, "<h3>$1</h3>")
    .replace(/^## (.*$)/gim, "<h2>$1</h2>")
    .replace(/^# (.*$)/gim, "<h1>$1</h1>")
    // Bold
    .replace(/\*\*(.*?)\*\*/gim, "<strong>$1</strong>")
    // Italic
    .replace(/\*(.*?)\*/gim, "<em>$1</em>")
    // Code inline
    .replace(/`([^`]+)`/gim, "<code>$1</code>")
    // Links
    .replace(
      /\[([^\]]+)\]\(([^)]+)\)/gim,
      '<a href="$2" target="_blank">$1</a>',
    )
    // Line breaks
    .replace(/\n\n/gim, "</p><p>")
    .replace(/\n/gim, "<br>");

  return `<p>${html}</p>`;
}
