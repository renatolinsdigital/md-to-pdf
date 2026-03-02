export const EXAMPLE_MARKDOWN = `# Markdown to PDF: A Complete Guide

Markdown is a **lightweight markup language** that maps beautifully to PDF. Every element you write translates directly into *polished, print-ready* output.

---

## Text Formatting

You can make text **bold**, *italic*, or ~~strikethrough~~ with simple syntax. Combine them for ***bold and italic*** emphasis. Need a splash of color? Use inline HTML:

- <span style="color: #ef4444">Red for warnings</span>
- <span style="color: #3b82f6">Blue for highlights</span>
- <span style="color: #10b981">Green for success</span>

## Headings Structure the Page

Headings create a clear visual hierarchy in your PDF. From large titles (\`#\`) to small subsections (\`###\`), they help readers navigate your document at a glance.

### Why Hierarchy Matters

A well-structured document is easier to scan, easier to print, and easier to share. Markdown gives you that structure with minimal effort.

## Lists Keep Things Organized

**Unordered lists** for general items:

- Write once in Markdown
- Export to a polished PDF
- Share with anyone, anywhere

<br><br><br>

**Ordered lists** for step-by-step processes:

1. Type or paste your Markdown
2. Customize settings to your liking
3. Download a ready-to-share PDF

## Links and References

Markdown links render cleanly in PDF: visit [Markdown Guide](https://www.markdownguide.org) for the full syntax reference, or link to your [project repository](https://github.com) for collaboration.

## Code: Inline and Blocks

Reference variables like \`fontSize\` or commands like \`npm install\` inline.

For longer snippets, use fenced code blocks:

\`\`\`javascript
function markdownToPdf(source) {
  const parsed = parseMarkdown(source);
  const styled = applyTheme(parsed);
  return renderPdf(styled);
}
\`\`\`

Code blocks preserve formatting and use a monospaced font, perfect for technical documentation.

## Tables Present Data Clearly

| Feature        | Markdown Syntax  | PDF Result          |
|----------------|------------------|---------------------|
| Bold           | \`**text**\`       | **Rendered bold**   |
| Italic         | \`*text*\`         | *Rendered italic*   |
| Strikethrough  | \`~~text~~\`       | ~~Rendered strike~~ |
| Inline Code    | \`\\\`code\\\`\`      | \`Rendered code\`     |
| Link           | \`[text](url)\`    | Clickable link      |

Tables are one of the most useful features. Data that would be hard to read as plain text becomes instantly clear.

## Blockquotes Add Emphasis

> Markdown is designed so that it can be converted to PDF and other formats
> without losing structure or meaning. What you write is what you get.

Use blockquotes to highlight important passages, testimonials, or callouts.

## Images

![Ocean view](https://images.unsplash.com/photo-1772306105684-4ec41e099a47?w=600&fm=jpg)
<p style="text-align: center"><em>Images are fetched, converted to JPEG, and embedded into the PDF.</em></p>

## Alignment Control

<div style="text-align: center">

**Centered content**, ideal for titles, images, or callouts that need visual prominence.

</div>

<div style="text-align: right">

*Right-aligned text*, useful for dates, signatures, or attributions.

</div>

## Horizontal Rules Separate Sections

Use a simple \`---\` to create a visual break between topics:

---

## Why Markdown for PDF?

1. **Portable**: plain text files work everywhere
2. **Version-friendly**: diffs are readable in Git
3. **Flexible**: one source, many output formats
4. **Fast**: no complex editors, just type and convert

Markdown bridges the gap between *writing* and *designing*. You focus on the content; the converter handles the layout.

---

*This example demonstrates every supported feature. Edit it, experiment, and make it yours!*
`;
