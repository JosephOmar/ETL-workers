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
      className="px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300"
      title="Copiar links"
    >
      📋 Copiar ({links.length})
    </button>
  );
};
