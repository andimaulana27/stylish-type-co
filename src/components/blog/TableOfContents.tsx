// src/components/blog/TableOfContents.tsx
import { List } from 'lucide-react';

type Heading = {
  id: string;
  title: string;
  level: number; // 2 for h2, 3 for h3
};

type TableOfContentsProps = {
  headings: Heading[];
};

const TableOfContents = ({ headings }: TableOfContentsProps) => {
  if (headings.length === 0) {
    return null;
  }

  return (
    <div className="my-10 p-6 border border-white/10 rounded-lg bg-brand-darkest">
      <h2 className="text-lg font-bold text-brand-light mb-4 flex items-center gap-2">
        {/* --- PERUBAHAN WARNA IKON DI SINI --- */}
        <List size={20} className="text-brand-accent" />
        Table of Contents
      </h2>
      <ul className="space-y-2">
        {headings.map((heading) => (
          <li key={heading.id} style={{ paddingLeft: `${(heading.level - 2) * 1}rem` }}>
            <a 
              href={`#${heading.id}`}
              // --- PERUBAHAN WARNA HOVER DI SINI ---
              className="text-brand-light-muted hover:text-brand-accent transition-colors text-sm"
            >
              {heading.title}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TableOfContents;