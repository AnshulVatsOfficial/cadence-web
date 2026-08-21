import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Bold, Italic, Strikethrough, List, ListOrdered, Heading2 } from 'lucide-react';
import { Toggle } from '@/components/ui/toggle';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) return null;

  return (
    <div className="flex flex-wrap items-center gap-1 p-1 border-b border-[#DFE1E6] bg-[#FAFBFC] rounded-t-[3px]">
      <Toggle
        size="sm"
        pressed={editor.isActive('heading', { level: 2 })}
        onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className="h-7 px-2 data-[state=on]:bg-[#DEEBFF] data-[state=on]:text-[#0052CC]"
      >
        <Heading2 className="w-4 h-4" />
      </Toggle>
      <div className="w-[1px] h-4 bg-[#DFE1E6] mx-1" />
      <Toggle
        size="sm"
        pressed={editor.isActive('bold')}
        onPressedChange={() => editor.chain().focus().toggleBold().run()}
        className="h-7 px-2 data-[state=on]:bg-[#DEEBFF] data-[state=on]:text-[#0052CC]"
      >
        <Bold className="w-4 h-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive('italic')}
        onPressedChange={() => editor.chain().focus().toggleItalic().run()}
        className="h-7 px-2 data-[state=on]:bg-[#DEEBFF] data-[state=on]:text-[#0052CC]"
      >
        <Italic className="w-4 h-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive('strike')}
        onPressedChange={() => editor.chain().focus().toggleStrike().run()}
        className="h-7 px-2 data-[state=on]:bg-[#DEEBFF] data-[state=on]:text-[#0052CC]"
      >
        <Strikethrough className="w-4 h-4" />
      </Toggle>
      <div className="w-[1px] h-4 bg-[#DFE1E6] mx-1" />
      <Toggle
        size="sm"
        pressed={editor.isActive('bulletList')}
        onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
        className="h-7 px-2 data-[state=on]:bg-[#DEEBFF] data-[state=on]:text-[#0052CC]"
      >
        <List className="w-4 h-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive('orderedList')}
        onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
        className="h-7 px-2 data-[state=on]:bg-[#DEEBFF] data-[state=on]:text-[#0052CC]"
      >
        <ListOrdered className="w-4 h-4" />
      </Toggle>
    </div>
  );
};

export const RichTextEditor = ({ content, onChange, placeholder = 'Add a description...', disabled = false }: RichTextEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        }
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    editable: !disabled,
    onUpdate: ({ editor }) => {
      // Return HTML content
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'focus:outline-none min-h-[100px] max-h-[300px] overflow-y-auto p-3 text-sm text-[#172B4D] [&_p]:mb-2 last:[&_p]:mb-0 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:mt-4 [&_h2]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-2 [&_code]:bg-[#EBECF0] [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded-sm [&_code]:text-[#172B4D] [&_code]:font-mono [&_code]:text-xs [&_s]:text-[#5E6C84]',
      },
    },
  });

  // Keep content in sync if it changes externally (e.g. when opening a new task)
  React.useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  return (
    <div className={`border border-[#DFE1E6] rounded-[3px] focus-within:ring-1 focus-within:ring-[#0052CC] ${disabled ? 'opacity-60 bg-[#FAFBFC]' : 'bg-white'}`}>
      {!disabled && <MenuBar editor={editor} />}
      <EditorContent editor={editor} />
    </div>
  );
};
