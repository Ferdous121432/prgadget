"use client";

import { normalizeMalformedRichText } from "@/lib/rich-text";
import { cn } from "@/lib/utils";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "./button";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type BlockTag = "p" | "h2" | "h3" | "blockquote";

type ToolbarState = {
  block: BlockTag | null;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  ul: boolean;
  ol: boolean;
};

const DEFAULT_STATE: ToolbarState = {
  block: null,
  bold: false,
  italic: false,
  underline: false,
  ul: false,
  ol: false,
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function normalizeHtml(html: string) {
  const trimmed = html.trim();
  if (!trimmed || trimmed === "<br>" || trimmed === "<p><br></p>") return "";
  return trimmed;
}

function normalizeEditorHtml(html: string) {
  return normalizeHtml(normalizeMalformedRichText(html));
}

/** Walk up from `node` until we hit a known block element inside `editor`. */
function getBlockAncestor(
  editor: HTMLElement,
  node: Node | null,
): HTMLElement | null {
  let cur: Node | null = node;
  const BLOCKS = new Set(["p", "h1", "h2", "h3", "h4", "blockquote", "div"]);
  while (cur && cur !== editor) {
    if (cur instanceof HTMLElement && BLOCKS.has(cur.tagName.toLowerCase()))
      return cur;
    cur = cur.parentNode;
  }
  return null;
}

/** Replace an element with a new one of a different tag, preserving children. */
function swapTag(el: HTMLElement, tag: string): HTMLElement {
  const next = document.createElement(tag);
  next.innerHTML = el.innerHTML;
  el.replaceWith(next);
  return next;
}

/** Move the caret to the end of an element. */
function caretToEnd(el: HTMLElement) {
  const range = document.createRange();
  range.selectNodeContents(el);
  range.collapse(false);
  const sel = window.getSelection();
  sel?.removeAllRanges();
  sel?.addRange(range);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
interface HtmlEditorProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function HtmlEditor({
  value,
  onChange,
  placeholder,
  className,
}: HtmlEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<ToolbarState>(DEFAULT_STATE);

  // Sync incoming value (e.g. when editing an existing product)
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    const incoming = normalizeEditorHtml(value || "");
    if (editor.innerHTML !== incoming) editor.innerHTML = incoming;
  }, [value]);

  // Read back formatting state from the current cursor position
  const readState = useCallback(() => {
    const editor = editorRef.current;
    const sel = window.getSelection();
    if (
      !editor ||
      !sel ||
      sel.rangeCount === 0 ||
      !editor.contains(sel.anchorNode)
    ) {
      setState(DEFAULT_STATE);
      return;
    }
    const block = getBlockAncestor(editor, sel.anchorNode);
    const tag = block?.tagName.toLowerCase() ?? null;
    setState({
      block:
        tag === "p" || tag === "h2" || tag === "h3" || tag === "blockquote"
          ? (tag as BlockTag)
          : null,
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      underline: document.queryCommandState("underline"),
      ul: document.queryCommandState("insertUnorderedList"),
      ol: document.queryCommandState("insertOrderedList"),
    });
  }, []);

  const emitChange = useCallback(() => {
    const html = normalizeEditorHtml(editorRef.current?.innerHTML ?? "");
    onChange(html);
  }, [onChange]);

  const handlePaste = useCallback(
    (event: React.ClipboardEvent<HTMLDivElement>) => {
      event.preventDefault();

      const html = event.clipboardData.getData("text/html");
      const text = event.clipboardData.getData("text/plain");

      if (html.trim()) {
        document.execCommand("insertHTML", false, normalizeEditorHtml(html));
      } else if (text.trim()) {
        document.execCommand("insertText", false, text);
      }

      emitChange();
      readState();
    },
    [emitChange, readState],
  );

  // ── Inline command (bold / italic / underline / lists) ─────────────────
  // All toolbar interactions use onMouseDown + e.preventDefault() so the
  // editor never loses focus — selection is preserved automatically.
  const inline = useCallback(
    (e: React.MouseEvent, command: string) => {
      e.preventDefault();
      document.execCommand(command, false);
      emitChange();
      readState();
    },
    [emitChange, readState],
  );

  // ── Block-level tag toggle (P / H2 / H3 / blockquote) ───────────────────
  const toggleBlock = useCallback(
    (e: React.MouseEvent, tag: BlockTag) => {
      e.preventDefault();
      const editor = editorRef.current;
      const sel = window.getSelection();
      if (!editor) return;

      if (!sel || sel.rangeCount === 0 || !editor.contains(sel.anchorNode)) {
        editor.focus();
        document.execCommand("formatBlock", false, tag);
        emitChange();
        readState();
        return;
      }

      const range = sel.getRangeAt(0);
      const ancestor = getBlockAncestor(editor, range.startContainer);

      if (ancestor && ancestor !== editor) {
        const currentTag = ancestor.tagName.toLowerCase();
        // Clicking the same tag again reverts to <p>
        const nextTag = currentTag === tag ? "p" : tag;
        const next = swapTag(ancestor, nextTag);
        caretToEnd(next);
      } else {
        document.execCommand("formatBlock", false, tag);
      }

      emitChange();
      readState();
    },
    [emitChange, readState],
  );

  // ── Link ─────────────────────────────────────────────────────────────────
  const insertLink = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      const url = window.prompt("Enter URL (include https://)");
      if (!url?.trim()) return;
      document.execCommand("createLink", false, url.trim());
      emitChange();
      readState();
    },
    [emitChange, readState],
  );

  // ── Clear formatting ──────────────────────────────────────────────────────
  const clearFormat = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      document.execCommand("removeFormat", false);
      emitChange();
      readState();
    },
    [emitChange, readState],
  );

  // ── Button class helper ───────────────────────────────────────────────────
  const btn = (on: boolean) =>
    cn(
      "h-8 min-w-[2rem] px-2 text-xs font-semibold transition-colors rounded border",
      on
        ? "border-primary bg-primary text-primary-foreground hover:bg-primary/80"
        : "border-border bg-background hover:bg-muted",
    );

  return (
    <div
      className={cn(
        "overflow-hidden rounded-md border border-input",
        className,
      )}>
      {/* ── Toolbar ── */}
      <div
        className="flex flex-wrap items-center gap-1 border-b bg-muted/40 px-2 py-1.5"
        onMouseDown={(e) => e.preventDefault()}>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={btn(state.block === "p")}
          aria-pressed={state.block === "p"}
          onMouseDown={(e) => toggleBlock(e, "p")}>
          P
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className={btn(state.block === "h2")}
          aria-pressed={state.block === "h2"}
          onMouseDown={(e) => toggleBlock(e, "h2")}>
          H2
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className={btn(state.block === "h3")}
          aria-pressed={state.block === "h3"}
          onMouseDown={(e) => toggleBlock(e, "h3")}>
          H3
        </Button>

        <span className="mx-1 h-4 w-px bg-border" aria-hidden="true" />

        <Button
          type="button"
          variant="outline"
          size="sm"
          className={btn(state.bold)}
          aria-pressed={state.bold}
          onMouseDown={(e) => inline(e, "bold")}>
          <strong>B</strong>
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className={btn(state.italic)}
          aria-pressed={state.italic}
          onMouseDown={(e) => inline(e, "italic")}>
          <em>I</em>
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className={btn(state.underline)}
          aria-pressed={state.underline}
          onMouseDown={(e) => inline(e, "underline")}>
          <span className="underline underline-offset-2">U</span>
        </Button>

        <span className="mx-1 h-4 w-px bg-border" aria-hidden="true" />

        <Button
          type="button"
          variant="outline"
          size="sm"
          className={btn(state.ul)}
          aria-pressed={state.ul}
          onMouseDown={(e) => inline(e, "insertUnorderedList")}>
          UL
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className={btn(state.ol)}
          aria-pressed={state.ol}
          onMouseDown={(e) => inline(e, "insertOrderedList")}>
          OL
        </Button>

        <span className="mx-1 h-4 w-px bg-border" aria-hidden="true" />

        <Button
          type="button"
          variant="outline"
          size="sm"
          className={btn(state.block === "blockquote")}
          aria-pressed={state.block === "blockquote"}
          onMouseDown={(e) => toggleBlock(e, "blockquote")}>
          &ldquo;&rdquo;
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className={btn(false)}
          onMouseDown={insertLink}>
          Link
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className={btn(false)}
          onMouseDown={clearFormat}>
          Clear
        </Button>
      </div>

      {/* ── Content area ── */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        className="html-editor-content min-h-64 w-full px-3 py-3 text-sm outline-none"
        onInput={emitChange}
        onKeyUp={readState}
        onMouseUp={readState}
        onPaste={handlePaste}
        onFocus={readState}
        onBlur={() => setState(DEFAULT_STATE)}
      />
    </div>
  );
}
