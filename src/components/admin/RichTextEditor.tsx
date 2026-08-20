"use client";

import { cn } from "@/lib/utils";
import Color from "@tiptap/extension-color";
import Placeholder from "@tiptap/extension-placeholder";
import Table from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import TextStyle from "@tiptap/extension-text-style";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Plus,
  Table2,
  Trash2,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

const TEXT_COLORS = [
  { name: "Dark brown", value: "#3C2A1E" },
  { name: "Mid brown", value: "#6B4226" },
  { name: "Gold", value: "#C9A227" },
  { name: "Light brown", value: "#C9AE94" },
] as const;

function ToolbarButton({
  active,
  disabled,
  label,
  onClick,
  children,
}: {
  active?: boolean;
  disabled?: boolean;
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-brown-mid hover:bg-brown-light/30 disabled:opacity-40",
        active && "bg-gold-light text-brown-dark"
      )}
    >
      {children}
    </button>
  );
}

function EditorToolbar({ editor }: { editor: Editor }) {
  const inTable = editor.isActive("table");
  const currentColor = editor.getAttributes("textStyle").color as string | undefined;

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-brown-light bg-cream/60 px-2 py-1.5">
      <ToolbarButton
        label="Bold"
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold className="h-3.5 w-3.5" />
        Bold
      </ToolbarButton>
      <ToolbarButton
        label="Italic"
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic className="h-3.5 w-3.5" />
        Italic
      </ToolbarButton>

      <span className="mx-1 h-4 w-px bg-brown-light/70" />

      {TEXT_COLORS.map((color) => (
        <button
          key={color.value}
          type="button"
          title={color.name}
          aria-label={color.name}
          onClick={() => editor.chain().focus().setColor(color.value).run()}
          className={cn(
            "h-5 w-5 rounded-full border border-brown-light/80",
            currentColor === color.value && "ring-2 ring-gold ring-offset-1"
          )}
          style={{ backgroundColor: color.value }}
        />
      ))}
      <button
        type="button"
        title="Default colour"
        aria-label="Default colour"
        onClick={() => editor.chain().focus().unsetColor().run()}
        className={cn(
          "rounded px-2 py-1 text-xs font-medium text-brown-mid hover:bg-brown-light/30",
          !currentColor && "bg-gold-light text-brown-dark"
        )}
      >
        Default
      </button>

      <span className="mx-1 h-4 w-px bg-brown-light/70" />

      <ToolbarButton
        label="Bullet list"
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List className="h-3.5 w-3.5" />
        List
      </ToolbarButton>
      <ToolbarButton
        label="Numbered list"
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered className="h-3.5 w-3.5" />
        Numbered
      </ToolbarButton>

      <span className="mx-1 h-4 w-px bg-brown-light/70" />

      <ToolbarButton
        label="Insert table"
        onClick={() =>
          editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
        }
      >
        <Table2 className="h-3.5 w-3.5" />
        Table
      </ToolbarButton>
      {inTable && (
        <>
          <ToolbarButton
            label="Add column"
            onClick={() => editor.chain().focus().addColumnAfter().run()}
          >
            <Plus className="h-3.5 w-3.5" />
            Col
          </ToolbarButton>
          <ToolbarButton
            label="Add row"
            onClick={() => editor.chain().focus().addRowAfter().run()}
          >
            <Plus className="h-3.5 w-3.5" />
            Row
          </ToolbarButton>
          <ToolbarButton
            label="Delete table"
            onClick={() => editor.chain().focus().deleteTable().run()}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </ToolbarButton>
        </>
      )}
    </div>
  );
}

export function RichTextEditor({
  id,
  label,
  value,
  onChange,
  error,
  placeholder = "Write…",
}: {
  id?: string;
  label: string;
  value: string;
  onChange: (html: string) => void;
  error?: string;
  placeholder?: string;
}) {
  const [, setTick] = useState(0);
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        code: false,
        codeBlock: false,
        blockquote: false,
        horizontalRule: false,
      }),
      TextStyle,
      Color,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Placeholder.configure({ placeholder }),
    ],
    content: value || "<p></p>",
    immediatelyRender: false,
    onUpdate: ({ editor: ed }) => onChange(ed.getHTML()),
    onSelectionUpdate: () => setTick((n) => n + 1),
    onTransaction: () => setTick((n) => n + 1),
    editorProps: {
      attributes: {
        class:
          "prose-woodcastle min-h-[220px] px-4 py-3 outline-none text-brown-dark",
      },
    },
  });

  useEffect(() => {
    if (!editor) return;
    const next = value?.trim() ? value : "<p></p>";
    if (editor.getHTML() === next) return;
    editor.commands.setContent(next, false);
  }, [editor, value]);

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-brown-dark">
        {label}
      </label>
      <div
        id={id}
        data-testid="rich-text-editor"
        className={cn(
          "overflow-hidden rounded-lg border border-brown-light bg-white",
          error && "border-red-500"
        )}
      >
        {editor && <EditorToolbar editor={editor} />}
        <EditorContent editor={editor} />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
