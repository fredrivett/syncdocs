/** Convert a docPath (e.g. "src/checker/index/StaleChecker.md") to a URL path */
export function docPathToUrl(docPath: string): string {
  return `/docs/${docPath.replace(/\.md$/, '')}`;
}

/** Convert a URL pathname back to a docPath for the API */
export function urlToDocPath(pathname: string): string | null {
  const rest = pathname.replace(/^\/docs\/?/, '');
  if (!rest) return null;
  return `${rest}.md`;
}

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
