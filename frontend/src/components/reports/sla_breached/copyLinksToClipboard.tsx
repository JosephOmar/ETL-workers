// utils/copyLinks.ts
export const copyLinksToClipboard = async (links: string[]) => {
  if (!links?.length) return;

  const text = links.join("\n");
  await navigator.clipboard.writeText(text);
};
