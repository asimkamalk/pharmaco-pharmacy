"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Strikethrough,
  Underline as UnderlineIcon,
  Undo2,
  Unlink,
} from "lucide-react";
import { useCallback, useEffect, useState, type MouseEvent } from "react";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  name: string;
  label?: string;
  defaultValue?: string;
  placeholder?: string;
}

const btn =
  "inline-flex h-8 w-8 items-center justify-center rounded-md text-darkColor transition-colors hover:bg-shop_light_bg disabled:opacity-40";

/** Keep editor selection when clicking toolbar buttons */
const keepFocus = (event: MouseEvent) => {
  event.preventDefault();
};

const RichTextEditor = ({
  name,
  label = "Long description",
  defaultValue = "",
  placeholder = "Write a detailed product description…",
}: RichTextEditorProps) => {
  const [html, setHtml] = useState(defaultValue);
  const [, setRenderTick] = useState(0);
  const refreshToolbar = useCallback(() => {
    setRenderTick((tick) => tick + 1);
  }, []);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        link: {
          openOnClick: false,
          HTMLAttributes: {
            class: "text-shop_light_green underline",
            rel: "noopener noreferrer",
            target: "_blank",
          },
        },
      }),
      Underline,
      Placeholder.configure({ placeholder }),
    ],
    content: defaultValue || "<p></p>",
    onUpdate: ({ editor: current }) => {
      setHtml(current.getHTML());
      refreshToolbar();
    },
    onSelectionUpdate: () => {
      refreshToolbar();
    },
    editorProps: {
      attributes: {
        class:
          "min-h-[12rem] h-full px-3.5 py-3 text-sm text-darkColor outline-none",
      },
    },
  });

  useEffect(() => {
    if (!editor || !defaultValue) return;
    const current = editor.getHTML();
    if (current === "<p></p>" || editor.isEmpty) {
      editor.commands.setContent(defaultValue);
      setHtml(defaultValue);
    }
  }, [editor, defaultValue]);

  const run = (command: () => boolean | void) => {
    if (!editor) return;
    editor.chain().focus();
    command();
    refreshToolbar();
  };

  const setLink = () => {
    if (!editor) return;
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Enter URL", previous || "https://");
    if (url === null) return;
    if (url.trim() === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      refreshToolbar();
      return;
    }
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url.trim() })
      .run();
    refreshToolbar();
  };

  return (
    <div className="space-y-1.5 md:col-span-2">
      <span className="text-sm font-medium text-darkColor">{label}</span>
      <div className="rounded-lg border border-black/15 bg-white">
        <div className="flex flex-wrap gap-0.5 border-b border-black/10 bg-shop_light_bg/60 p-1.5">
          <button
            type="button"
            className={cn(btn, editor?.isActive("bold") && "bg-white shadow-sm")}
            onMouseDown={keepFocus}
            onClick={() =>
              run(() => editor!.chain().focus().toggleBold().run())
            }
            title="Bold"
          >
            <Bold className="h-4 w-4" />
          </button>
          <button
            type="button"
            className={cn(
              btn,
              editor?.isActive("italic") && "bg-white shadow-sm",
            )}
            onMouseDown={keepFocus}
            onClick={() =>
              run(() => editor!.chain().focus().toggleItalic().run())
            }
            title="Italic"
          >
            <Italic className="h-4 w-4" />
          </button>
          <button
            type="button"
            className={cn(
              btn,
              editor?.isActive("underline") && "bg-white shadow-sm",
            )}
            onMouseDown={keepFocus}
            onClick={() =>
              run(() => editor!.chain().focus().toggleUnderline().run())
            }
            title="Underline"
          >
            <UnderlineIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            className={cn(
              btn,
              editor?.isActive("strike") && "bg-white shadow-sm",
            )}
            onMouseDown={keepFocus}
            onClick={() =>
              run(() => editor!.chain().focus().toggleStrike().run())
            }
            title="Strikethrough"
          >
            <Strikethrough className="h-4 w-4" />
          </button>
          <span className="mx-1 w-px self-stretch bg-black/10" />
          <button
            type="button"
            className={cn(
              btn,
              editor?.isActive("heading", { level: 1 }) && "bg-white shadow-sm",
            )}
            onMouseDown={keepFocus}
            onClick={() =>
              run(() =>
                editor!.chain().focus().toggleHeading({ level: 1 }).run(),
              )
            }
            title="Heading 1"
          >
            <Heading1 className="h-4 w-4" />
          </button>
          <button
            type="button"
            className={cn(
              btn,
              editor?.isActive("heading", { level: 2 }) && "bg-white shadow-sm",
            )}
            onMouseDown={keepFocus}
            onClick={() =>
              run(() =>
                editor!.chain().focus().toggleHeading({ level: 2 }).run(),
              )
            }
            title="Heading 2"
          >
            <Heading2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            className={cn(
              btn,
              editor?.isActive("heading", { level: 3 }) && "bg-white shadow-sm",
            )}
            onMouseDown={keepFocus}
            onClick={() =>
              run(() =>
                editor!.chain().focus().toggleHeading({ level: 3 }).run(),
              )
            }
            title="Heading 3"
          >
            <Heading3 className="h-4 w-4" />
          </button>
          <span className="mx-1 w-px self-stretch bg-black/10" />
          <button
            type="button"
            className={cn(
              btn,
              editor?.isActive("bulletList") && "bg-white shadow-sm",
            )}
            onMouseDown={keepFocus}
            onClick={() =>
              run(() => editor!.chain().focus().toggleBulletList().run())
            }
            title="Bullet list"
          >
            <List className="h-4 w-4" />
          </button>
          <button
            type="button"
            className={cn(
              btn,
              editor?.isActive("orderedList") && "bg-white shadow-sm",
            )}
            onMouseDown={keepFocus}
            onClick={() =>
              run(() => editor!.chain().focus().toggleOrderedList().run())
            }
            title="Numbered list"
          >
            <ListOrdered className="h-4 w-4" />
          </button>
          <button
            type="button"
            className={cn(
              btn,
              editor?.isActive("blockquote") && "bg-white shadow-sm",
            )}
            onMouseDown={keepFocus}
            onClick={() =>
              run(() => editor!.chain().focus().toggleBlockquote().run())
            }
            title="Quote"
          >
            <Quote className="h-4 w-4" />
          </button>
          <span className="mx-1 w-px self-stretch bg-black/10" />
          <button
            type="button"
            className={cn(btn, editor?.isActive("link") && "bg-white shadow-sm")}
            onMouseDown={keepFocus}
            onClick={setLink}
            title="Add link"
          >
            <Link2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            className={btn}
            onMouseDown={keepFocus}
            onClick={() =>
              run(() => editor!.chain().focus().unsetLink().run())
            }
            title="Remove link"
          >
            <Unlink className="h-4 w-4" />
          </button>
          <span className="mx-1 w-px self-stretch bg-black/10" />
          <button
            type="button"
            className={btn}
            onMouseDown={keepFocus}
            onClick={() => run(() => editor!.chain().focus().undo().run())}
            title="Undo"
          >
            <Undo2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            className={btn}
            onMouseDown={keepFocus}
            onClick={() => run(() => editor!.chain().focus().redo().run())}
            title="Redo"
          >
            <Redo2 className="h-4 w-4" />
          </button>
        </div>

        <div className="rich-text-resize min-h-[12rem] max-h-[40rem] overflow-auto">
          <EditorContent editor={editor} />
        </div>
      </div>
      <input type="hidden" name={name} value={html} readOnly />
      <p className="text-xs text-lightColor">
        Drag the bottom-right corner to resize. Use headings, lists, quotes and
        links from the toolbar.
      </p>
    </div>
  );
};

export default RichTextEditor;
