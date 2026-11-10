import sanitizeHtml from "sanitize-html";

export function sanitizePostHtml(dirtyHtml: string): string {
  if (!dirtyHtml) return "";

  return sanitizeHtml(dirtyHtml, {
    allowedTags: [
      "h1", "h2", "h3", "h4", "h5", "h6",
      "p", "a", "ul", "ol", "li", "b", "i", "strong", "em", "strike", "code", "hr", "br",
      "div", "table", "thead", "tbody", "tr", "th", "td", "pre", "blockquote",
      "img", "figure", "figcaption", "sub", "sup", "span"
    ],
    allowedAttributes: {
      a: ["href", "name", "target", "rel", "title", "class"],
      img: ["src", "alt", "title", "width", "height", "loading", "class", "style"],
      div: ["class", "style"],
      span: ["class", "style"],
      p: ["class", "style"],
      h1: ["id", "class"],
      h2: ["id", "class"],
      h3: ["id", "class"],
      h4: ["id", "class"],
      table: ["class", "style"],
      th: ["class", "style", "scope"],
      td: ["class", "style", "colspan", "rowspan"],
      blockquote: ["class", "style"],
      code: ["class"],
      pre: ["class"],
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    transformTags: {
      a: (tagName, attribs) => {
        // Automatically add noopener and noreferrer to external links
        const href = attribs.href || "";
        const isExternal = href.startsWith("http://") || href.startsWith("https://");
        return {
          tagName: "a",
          attribs: {
            ...attribs,
            ...(isExternal ? { rel: "noopener noreferrer", target: "_blank" } : {}),
          },
        };
      },
    },
  });
}
