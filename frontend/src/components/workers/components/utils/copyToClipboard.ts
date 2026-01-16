export type ClipboardFieldMapper<T> = (item: T) => (string | number | null | undefined)[];

type CopyToClipboardOptions = {
  separator?: string;     // por defecto TAB (excel-friendly)
  lineBreak?: string;     // por defecto salto de línea
  includeHeader?: boolean;
  header?: string[];
};

export const copyToClipboard = async <T>(
  items: T[],
  mapFields: ClipboardFieldMapper<T>,
  options: CopyToClipboardOptions = {}
) => {
  const {
    separator = "\t",
    lineBreak = "\n",
    includeHeader = false,
    header = [],
  } = options;

  if (!items.length) return;

  const rows = items.map(item =>
    mapFields(item)
      .map(v => (v ?? ""))
      .join(separator)
  );

  const text = [
    includeHeader ? header.join(separator) : null,
    ...rows,
  ]
    .filter(Boolean)
    .join(lineBreak);

  try {
    await navigator.clipboard.writeText(text);
  } catch (error) {
    console.error("Clipboard error", error);
  }
};
