import { marked } from 'marked';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { docPathToUrl, escapeHtml, urlToDocPath } from '../docs-utils';

interface DocData {
  name: string;
  sourcePath: string;
  markdown: string;
  syncdocsVersion?: string;
  generated?: string;
  dependencyGraph?: string;
  related?: Array<{ name: string; docPath: string | null }>;
}

async function renderMermaidDiagrams(container: HTMLElement) {
  const hasMermaid =
    container.querySelector('.mermaid') || container.querySelector('pre code.language-mermaid');
  if (!hasMermaid) return;

  const mermaid = (await import('mermaid')).default;
  mermaid.initialize({
    startOnLoad: false,
    theme: 'default',
    securityLevel: 'loose',
    flowchart: { useMaxWidth: true, htmlLabels: true },
  });

  // Convert code blocks to mermaid divs
  container.querySelectorAll('pre code.language-mermaid').forEach((codeEl) => {
    const pre = codeEl.parentElement;
    if (!pre) return;
    const div = document.createElement('div');
    div.className = 'mermaid';
    div.textContent = codeEl.textContent;
    pre.replaceWith(div);
  });

  const allMermaid = container.querySelectorAll('.mermaid');
  for (let i = 0; i < allMermaid.length; i++) {
    const el = allMermaid[i] as HTMLElement;
    const id = `mermaid-${Date.now()}-${i}`;
    try {
      const { svg } = await mermaid.render(id, el.textContent?.trim() ?? '');
      el.innerHTML = svg;
    } catch {
      // Mermaid render errors are expected for some diagram types
    }
  }
}

function makeRelatedLinksClickable(
  container: HTMLElement,
  related: DocData['related'],
  navigate: (path: string) => void,
) {
  if (!related || related.length === 0) return;
  const relatedMap = new Map(
    related.filter((r) => r.docPath).map((r) => [r.name, r.docPath as string]),
  );

  container.querySelectorAll('#doc-content code').forEach((codeEl) => {
    const text = codeEl.textContent?.replace(/\(\)$/, '') ?? '';
    const docPath = relatedMap.get(text);
    if (docPath) {
      const link = document.createElement('a');
      link.className = 'related-link';
      const url = docPathToUrl(docPath);
      link.href = url;
      link.textContent = codeEl.textContent ?? '';
      link.addEventListener('click', (e) => {
        e.preventDefault();
        navigate(url);
      });
      codeEl.replaceWith(link);
    }
  });
}

export function DocsViewer() {
  const [doc, setDoc] = useState<DocData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const docPath = useMemo(() => urlToDocPath(location.pathname), [location.pathname]);

  useEffect(() => {
    if (!docPath) {
      setDoc(null);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    fetch(`/api/doc?path=${encodeURIComponent(docPath)}`)
      .then((res) => {
        if (!res.ok) throw new Error('Document not found');
        return res.json();
      })
      .then((data: DocData) => {
        setDoc(data);
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setLoading(false);
      });
  }, [docPath]);

  // Render mermaid and related links after HTML is set
  useEffect(() => {
    if (!containerRef.current || !doc) return;
    const container = containerRef.current;

    renderMermaidDiagrams(container);
    makeRelatedLinksClickable(container, doc.related, navigate);

    // Auto-expand the Visual Flow details section
    container.querySelectorAll('#doc-content details > summary').forEach((summary) => {
      if (summary.textContent?.trim() === 'Visual Flow') {
        summary.parentElement?.setAttribute('open', '');
      }
    });

    // Scroll to top
    mainRef.current?.scrollTo(0, 0);
  }, [doc, navigate]);

  // Intercept clicks on internal doc links for SPA navigation
  const handleContentClick = useCallback(
    (e: React.MouseEvent) => {
      const link = (e.target as HTMLElement).closest('a[href^="/docs/"]');
      if (!link) return;
      const href = (link as HTMLAnchorElement).getAttribute('href');
      if (!href) return;
      e.preventDefault();
      navigate(href);
    },
    [navigate],
  );

  if (!docPath) {
    return (
      <div className="flex flex-col items-center justify-center h-full font-sans text-gray-500 gap-2">
        <div className="font-semibold text-base">syncdocs viewer</div>
        <div className="text-sm">Select a symbol from the sidebar to view its documentation.</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-sm text-gray-400">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full font-sans text-gray-500 gap-2">
        <div className="font-semibold text-base">Document not found</div>
        <div className="text-sm">
          Run <code className="bg-gray-100 px-1.5 rounded">syncdocs sync</code> to generate
          documentation.
        </div>
      </div>
    );
  }

  if (!doc) return null;

  // Build the HTML content
  const renderedMarkdown = marked.parse(doc.markdown, { async: false }) as string;

  let html = '';
  html += `<h1>${escapeHtml(doc.name)}</h1>`;
  if (doc.sourcePath) {
    html += `<div class="source-path">${escapeHtml(doc.sourcePath)}</div>`;
  }

  const metaParts: string[] = [];
  metaParts.push(
    `<span>syncdocs v${doc.syncdocsVersion ? escapeHtml(doc.syncdocsVersion) : ': unknown'}</span>`,
  );
  if (doc.generated) {
    const date = new Date(doc.generated);
    const formatted = `${date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })} ${date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}`;
    metaParts.push(`<span>Generated ${formatted}</span>`);
  }
  html += `<div class="doc-meta">${metaParts.join('')}</div>`;

  if (doc.dependencyGraph) {
    html += '<div class="dep-graph">';
    html += '<h3>Dependencies</h3>';
    html += `<div class="mermaid">${escapeHtml(doc.dependencyGraph)}</div>`;
    html += '</div>';
  }

  html += `<div id="doc-content">${renderedMarkdown}</div>`;

  return (
    <div ref={mainRef} className="doc-viewer h-full overflow-y-auto">
      {/* biome-ignore lint/a11y/noStaticElementInteractions: click handler delegates to internal doc links */}
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: links inside rendered HTML are keyboard-accessible */}
      <div
        ref={containerRef}
        className="doc-view px-12 py-8 max-w-[900px]"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: rendered from markdown via marked
        dangerouslySetInnerHTML={{ __html: html }}
        onClick={handleContentClick}
      />
    </div>
  );
}
