import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function extractPlainText(desc: any): string {
  if (!desc) return "";

  let obj = desc;

  if (typeof desc === "string") {
    const trimmed = desc.trim();
    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
      try {
        obj = JSON.parse(trimmed);
      } catch {
        return desc;
      }
    } else {
      return desc;
    }
  }

  const collectText = (node: any): string => {
    if (!node) return "";
    if (typeof node === "string") return node;
    if (node.type === "text" && node.text) return node.text;
    if (Array.isArray(node.content)) {
      const parts = node.content.map(collectText).filter(Boolean);
      return parts.join(node.type === "paragraph" ? "\n\n" : " ");
    }
    return "";
  };

  if (obj && typeof obj === "object") {
    if (obj.type === "doc" || Array.isArray(obj.content)) {
      const extracted = collectText(obj);
      if (extracted.trim()) return extracted.trim();
    }
  }

  return typeof desc === "string" ? desc : "";
}
