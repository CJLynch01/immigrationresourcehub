import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect } from "react";

export default function RichTextEditor({ value, onChange, placeholder = "Write your post..." }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder }),
    ],
    content: value || "",
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  // Sync external value resets (e.g. after form submit clears content)
  useEffect(() => {
    if (!editor) return;
    if ((value === "" || value === "<p></p>") && editor.getHTML() !== "<p></p>") {
      editor.commands.clearContent();
    }
  }, [value, editor]);

  if (!editor) return null;

  function toggleLink() {
    const prev = editor.getAttributes("link").href;
    const url = window.prompt("Enter URL", prev || "https://");
    if (!url) {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor.chain().focus().setLink({ href: url }).run();
  }

  const btn = (label, action, active) => (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); action(); }}
      style={{
        padding: "0.25rem 0.6rem",
        borderRadius: 4,
        border: "1px solid #444",
        background: active ? "var(--accent-color, #c9a84c)" : "#1a1a1a",
        color: active ? "#000" : "#fff",
        cursor: "pointer",
        fontWeight: active ? 700 : 400,
        fontSize: "0.85rem",
        minWidth: 32,
      }}
    >
      {label}
    </button>
  );

  return (
    <div style={{ border: "1px solid #444", borderRadius: 6, overflow: "hidden" }}>
      {/* Toolbar */}
      <div style={{
        display: "flex", flexWrap: "wrap", gap: 4, padding: "0.5rem",
        background: "#111", borderBottom: "1px solid #444",
      }}>
        {btn("B",  () => editor.chain().focus().toggleBold().run(),       editor.isActive("bold"))}
        {btn("I",  () => editor.chain().focus().toggleItalic().run(),     editor.isActive("italic"))}
        {btn("U",  () => editor.chain().focus().toggleUnderline().run(),  editor.isActive("underline"))}
        {btn("S",  () => editor.chain().focus().toggleStrike().run(),     editor.isActive("strike"))}

        <span style={{ width: 1, background: "#444", margin: "0 4px" }} />

        {btn("H1", () => editor.chain().focus().toggleHeading({ level: 1 }).run(), editor.isActive("heading", { level: 1 }))}
        {btn("H2", () => editor.chain().focus().toggleHeading({ level: 2 }).run(), editor.isActive("heading", { level: 2 }))}
        {btn("H3", () => editor.chain().focus().toggleHeading({ level: 3 }).run(), editor.isActive("heading", { level: 3 }))}

        <span style={{ width: 1, background: "#444", margin: "0 4px" }} />

        {btn("• List",  () => editor.chain().focus().toggleBulletList().run(),  editor.isActive("bulletList"))}
        {btn("1. List", () => editor.chain().focus().toggleOrderedList().run(), editor.isActive("orderedList"))}

        <span style={{ width: 1, background: "#444", margin: "0 4px" }} />

        {btn("❝",    () => editor.chain().focus().toggleBlockquote().run(), editor.isActive("blockquote"))}
        {btn("Code", () => editor.chain().focus().toggleCodeBlock().run(),  editor.isActive("codeBlock"))}
        {btn("—",    () => editor.chain().focus().setHorizontalRule().run(), false)}
        {btn("🔗",   toggleLink, editor.isActive("link"))}
      </div>

      {/* Editor area */}
      <EditorContent
        editor={editor}
        style={{ padding: "0.75rem 1rem", minHeight: 220, background: "#0d0d0d", color: "#fff" }}
      />
    </div>
  );
}