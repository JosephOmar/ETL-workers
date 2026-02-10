"use client";

import { copyLinksToClipboard } from "./copyLinksToClipboard";

interface Props {
  links: string[];
}

export const CopyLinksButton = ({ links }: Props) => {
  if (!links.length) return null;

  return (
    <button
      onClick={() => copyLinksToClipboard(links)}
      className="px-2 py-1 text-xs bg-red-400 rounded hover:bg-red-600 text-white"
      title="Copiar links"
    >
      Links
    </button>
  );
};
