// src/components/admin/RichTextEditor.tsx
'use client';

import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Youtube from '@tiptap/extension-youtube';
// --- Impor ikon baru ---
import { Bold, Italic, Strikethrough, Pilcrow, List, ListOrdered, Quote, AlignLeft, AlignCenter, AlignRight, AlignJustify, Minus, Link as LinkIcon, Image as ImageIcon, Youtube as YoutubeIcon } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/lib/database.types';
import toast from 'react-hot-toast';
import { UrlPromptModal } from './UrlPromptModal';

// Komponen untuk Toolbar Editor
const MenuBar = ({ editor }: { editor: Editor | null }) => {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [isYoutubeModalOpen, setIsYoutubeModalOpen] = useState(false);
  const [currentYoutubeUrl, setCurrentYoutubeUrl] = useState('');
  
  const handleSetLink = useCallback((url: string) => {
    if (!editor) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  const handleAddOrUpdateYoutube = useCallback((url: string) => {
    if (!editor) return;
    if (url) {
        if (editor.isActive('youtube')) {
            editor.chain().focus().updateAttributes('youtube', { src: url }).run();
        } else {
            editor.commands.setYoutubeVideo({ src: url });
        }
    }
  }, [editor]);

  const openYoutubeModal = useCallback(() => {
    if (!editor) return;
    const existingUrl = editor.getAttributes('youtube').src || '';
    setCurrentYoutubeUrl(existingUrl);
    setIsYoutubeModalOpen(true);
  }, [editor]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!editor) return;
    const file = event.target.files?.[0];
    if (!file) return;

    toast.loading('Uploading image...');
    const fileName = `blog_content/${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage.from('blog_images').upload(fileName, file);

    if (error) {
      toast.dismiss();
      toast.error(`Upload failed: ${error.message}`);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from('blog_images').getPublicUrl(data.path);
    editor.chain().focus().setImage({ src: publicUrl }).run();
    toast.dismiss();
    toast.success('Image inserted!');
  };

  if (!editor) {
    return null;
  }
  
  const buttonClass = (type: string, options?: object) => 
    `p-2 rounded-md transition-colors ${
      editor.isActive(type, options) 
        ? 'bg-brand-accent text-brand-darkest'
        : 'bg-transparent text-brand-accent hover:bg-brand-accent/50 hover:text-brand-darkest'
    }`;
    
  // --- Fungsi diperbarui untuk menerima 'justify' ---
  const textAlignButtonClass = (alignment: 'left' | 'center' | 'right' | 'justify') => 
    `p-2 rounded-md transition-colors ${
      editor.isActive({ textAlign: alignment })
        ? 'bg-brand-accent text-brand-darkest'
        : 'bg-transparent text-brand-accent hover:bg-brand-accent/50 hover:text-brand-darkest'
    }`;

  const Divider = () => <div className="w-px h-6 bg-white/20 mx-1"></div>;

  return (
    <>
      <UrlPromptModal 
        isOpen={isLinkModalOpen}
        onClose={() => setIsLinkModalOpen(false)}
        onSubmit={handleSetLink}
        title="Enter Link URL"
        currentValue={editor.getAttributes('link').href}
        iconType="link"
      />
      <UrlPromptModal 
        isOpen={isYoutubeModalOpen}
        onClose={() => setIsYoutubeModalOpen(false)}
        onSubmit={handleAddOrUpdateYoutube}
        title={currentYoutubeUrl ? "Update YouTube Video URL" : "Embed YouTube Video"}
        currentValue={currentYoutubeUrl}
        iconType="youtube"
      />
    
      <div className="flex flex-wrap items-center gap-1 p-2 border border-white/20 border-b-0 rounded-t-lg bg-brand-darkest text-brand-light">
        <button type="button" onClick={() => editor.chain().focus().setParagraph().run()} className={buttonClass('paragraph')} title="Paragraph"><Pilcrow size={18} /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={buttonClass('heading', { level: 1 })} title="Heading 1">H1</button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={buttonClass('heading', { level: 2 })} title="Heading 2">H2</button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={buttonClass('heading', { level: 3 })} title="Heading 3">H3</button>
        
        <Divider />

        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={buttonClass('bold')} title="Bold"><Bold size={18} /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={buttonClass('italic')} title="Italic"><Italic size={18} /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleStrike().run()} className={buttonClass('strike')} title="Strikethrough"><Strikethrough size={18} /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={buttonClass('blockquote')} title="Blockquote"><Quote size={18} /></button>
        
        <Divider />

        <button type="button" onClick={() => setIsLinkModalOpen(true)} className={buttonClass('link')} title="Add Link"><LinkIcon size={18} /></button>
        <input type="file" ref={imageInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
        <button type="button" onClick={() => imageInputRef.current?.click()} className={buttonClass('image')} title="Insert Image"><ImageIcon size={18} /></button>
        <button type="button" onClick={openYoutubeModal} className={buttonClass('youtube')} title="Embed YouTube Video"><YoutubeIcon size={18} /></button>

        <Divider />
        
        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={buttonClass('bulletList')} title="Bullet List"><List size={18} /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={buttonClass('orderedList')} title="Numbered List"><ListOrdered size={18} /></button>

        <Divider />
        
        <button type="button" onClick={() => editor.chain().focus().setTextAlign('left').run()} className={textAlignButtonClass('left')} title="Align Left"><AlignLeft size={18} /></button>
        <button type="button" onClick={() => editor.chain().focus().setTextAlign('center').run()} className={textAlignButtonClass('center')} title="Align Center"><AlignCenter size={18} /></button>
        <button type="button" onClick={() => editor.chain().focus().setTextAlign('right').run()} className={textAlignButtonClass('right')} title="Align Right"><AlignRight size={18} /></button>
        {/* --- TOMBOL BARU DITAMBAHKAN DI SINI --- */}
        <button type="button" onClick={() => editor.chain().focus().setTextAlign('justify').run()} className={textAlignButtonClass('justify')} title="Align Justify"><AlignJustify size={18} /></button>

        <Divider />

        <button type="button" onClick={() => editor.chain().focus().setHorizontalRule().run()} className={buttonClass('horizontalRule')} title="Horizontal Line">
          <Minus size={18} />
        </button>
      </div>
    </>
  );
};

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const RichTextEditor = ({ value, onChange, placeholder }: RichTextEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        horizontalRule: {
          HTMLAttributes: {
            class: 'my-4 border-white/20',
          },
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Image.configure({
        inline: false,
        HTMLAttributes: {
          class: 'mx-auto rounded-lg',
        },
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: {
            class: 'text-brand-accent hover:text-brand-accent/80 transition-colors',
        }
      }),
      Youtube.configure({
        controls: true,
        nocookie: true,
        HTMLAttributes: {
            class: 'mx-auto rounded-lg',
        }
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none text-brand-light font-light leading-relaxed focus:outline-none p-4 w-full tiptap-tight',
      },
    },
    immediatelyRender: false,
  });

  return (
    <div className="bg-brand-darkest border border-white/20 rounded-lg">
       <style jsx global>{`
        .tiptap p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #A0A0A0; /* brand-light-muted */
          pointer-events: none;
          height: 0;
        }
        .tiptap {
          min-height: 200px;
        }
        .tiptap hr {
            border: none;
            height: 1px;
            background-color: rgba(255, 255, 255, 0.2);
            margin: 1rem 0;
        }
        .tiptap-tight p {
          margin-top: 0.5em;
          margin-bottom: 0.5em;
        }
        .tiptap-tight h1, .tiptap-tight h2, .tiptap-tight h3 {
          margin-top: 1em;
          margin-bottom: 0.5em;
        }
        .tiptap iframe {
          width: 100%;
          aspect-ratio: 16 / 9;
          height: auto;
          border-radius: 0.5rem;
        }
       `}</style>
      <MenuBar editor={editor} />
      <EditorContent editor={editor} data-placeholder={placeholder || 'Start writing...'} />
    </div>
  );
};

export default RichTextEditor;