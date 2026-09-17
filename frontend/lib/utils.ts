import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function extractPlainText(desc: any): string {
  if (!desc) return "";

  let text = "";

  if (typeof desc === "string") {
    const trimmed = desc.trim();
    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
      try {
        const obj = JSON.parse(trimmed);
        text = collectTextFromProseMirror(obj);
      } catch {
        text = desc;
      }
    } else {
      text = desc;
    }
  } else if (typeof desc === "object") {
    text = collectTextFromProseMirror(desc);
  }

  return cleanHtmlAndEntities(text);
}

function collectTextFromProseMirror(node: any): string {
  if (!node) return "";
  if (typeof node === "string") return node;
  if (node.type === "text" && node.text) return node.text;
  if (Array.isArray(node.content)) {
    const parts = node.content.map(collectTextFromProseMirror).filter(Boolean);
    return parts.join(node.type === "paragraph" ? "\n\n" : " ");
  }
  return "";
}

function cleanHtmlAndEntities(str: string): string {
  if (!str) return "";
  return str
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}
