const MERMAID_CDN_URL =
  "https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js";

async function ensureMermaidLoaded() {
  if (typeof window.mermaid !== "undefined") {
    return window.mermaid;
  }

  await new Promise((resolve, reject) => {
    const existing = document.querySelector(
      `script[data-mermaid-cdn="${MERMAID_CDN_URL}"]`,
    );
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error("Falha ao carregar Mermaid CDN.")),
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.src = MERMAID_CDN_URL;
    script.defer = true;
    script.setAttribute("data-mermaid-cdn", MERMAID_CDN_URL);
    script.addEventListener("load", () => resolve(), { once: true });
    script.addEventListener(
      "error",
      () => reject(new Error("Falha ao carregar Mermaid CDN.")),
      { once: true },
    );
    document.head.appendChild(script);
  });

  return window.mermaid;
}

function convertMermaidCodeBlocks(container) {
  const mermaidCodeBlocks = container.querySelectorAll(
    "pre code.language-mermaid, pre code.lang-mermaid",
  );

  mermaidCodeBlocks.forEach((codeBlock) => {
    const pre = codeBlock.closest("pre");
    if (!pre) {
      return;
    }

    const mermaidNode = document.createElement("div");
    mermaidNode.className = "mermaid";
    mermaidNode.textContent = codeBlock.textContent || "";
    pre.replaceWith(mermaidNode);
  });
}

async function renderMermaidDiagrams(container) {
  const nodes = container.querySelectorAll(".mermaid");
  if (!nodes.length) {
    return;
  }

  const mermaid = await ensureMermaidLoaded();
  if (!mermaid) {
    return;
  }

  mermaid.initialize({
    startOnLoad: false,
    securityLevel: "strict",
  });

  await mermaid.run({ nodes });
}

/**
 * Syntax highlighting for fenced code blocks (Highlight.js via CDN).
 * Runs after Mermaid conversion so diagram code is not highlighted as text.
 */
function highlightArticleCodeBlocks(container) {
  if (typeof hljs === "undefined") {
    return;
  }

  container.querySelectorAll("pre code").forEach((codeEl) => {
    try {
      hljs.highlightElement(codeEl);
    } catch (err) {
      console.warn("Highlight.js nao aplicou neste bloco:", err);
    }
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  const article = document.querySelector("article[data-md]");
  const container = document.querySelector(".article-content");

  if (!article || !container) {
    return;
  }

  const markdownPath = article.getAttribute("data-md");
  if (!markdownPath) {
    container.innerHTML =
      '<p class="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">Nao foi possivel carregar o artigo: caminho de Markdown ausente.</p>';
    return;
  }

  if (typeof marked === "undefined" || typeof DOMPurify === "undefined") {
    container.innerHTML =
      '<p class="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">Nao foi possivel carregar o artigo: dependencias de renderizacao indisponiveis.</p>';
    return;
  }

  marked.setOptions({
    gfm: true,
    breaks: false,
    headerIds: true,
    mangle: false,
  });

  try {
    const response = await fetch(markdownPath, { cache: "no-cache" });
    if (!response.ok) {
      throw new Error(`Falha ao carregar Markdown (${response.status})`);
    }

    const markdown = await response.text();
    const parsedHtml = marked.parse(markdown);
    const safeHtml = DOMPurify.sanitize(parsedHtml, {
      USE_PROFILES: { html: true },
    });

    container.innerHTML = safeHtml;
    convertMermaidCodeBlocks(container);
    highlightArticleCodeBlocks(container);
    await renderMermaidDiagrams(container);

    if (typeof renderMathInElement === "function") {
      renderMathInElement(container, {
        delimiters: [
          { left: "$$", right: "$$", display: true },
          { left: "\\[", right: "\\]", display: true },
          { left: "$", right: "$", display: false },
          { left: "\\(", right: "\\)", display: false },
        ],
        throwOnError: false,
      });
    }
  } catch (error) {
    container.innerHTML =
      '<p class="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">Nao foi possivel carregar o conteudo deste artigo no momento.</p>';
    console.error("Erro ao renderizar markdown do artigo:", error);
  }
});
