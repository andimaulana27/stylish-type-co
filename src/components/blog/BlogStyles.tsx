// src/components/blog/BlogStyles.tsx
'use client';

// Komponen ini berisi gaya TAMBAHAN untuk mengkustomisasi plugin Tailwind Typography (@tailwindcss/prose)
// agar sesuai dengan tema dan tampilan di Rich Text Editor.
const BlogStyles = () => {
  return (
    <style jsx global>{`
      /* Target class '.prose' yang dihasilkan oleh Tailwind Typography.
        Ini memastikan konsistensi antara editor dan tampilan blog.
      */

      /* === WARNA DASAR & FONT === */
      .prose {
        color: #a0a0a0; /* text-brand-light-muted */
        font-weight: 300; /* font-light */
      }
      .prose-invert {
        --tw-prose-body: #a0a0a0;
        --tw-prose-headings: #e4e4e7;
        --tw-prose-lead: #a0a0a0;
        --tw-prose-links: #f47253; /* Warna brand-accent Anda */
        --tw-prose-bold: #e4e4e7;
        --tw-prose-counters: #a0a0a0;
        /* --- PERBAIKAN WARNA: Mengubah warna bullet agar lebih netral --- */
        --tw-prose-bullets: #a0a0a0; /* Menggunakan warna brand-light-muted */
        --tw-prose-hr: rgba(255, 255, 255, 0.2);
        --tw-prose-quotes: rgba(255, 255, 255, 0.9);
        --tw-prose-quote-borders: #f47253; /* Warna brand-accent Anda */
        --tw-prose-captions: #a0a0a0;
        --tw-prose-code: #e4e4e7;
        --tw-prose-pre-code: #e4e4e7;
        --tw-prose-pre-bg: rgba(0, 0, 0, 0.2);
        --tw-prose-th-borders: rgba(255, 255, 255, 0.2);
        --tw-prose-td-borders: rgba(255, 255, 255, 0.1);
      }

      /* === GAYA SPESIFIK & MEDIA === */
      .prose h2,
      .prose h3,
      .prose h4 {
        scroll-margin-top: 7rem; /* Jarak untuk scroll-to-id dari Table of Contents */
      }

      .prose a {
        transition: color 0.2s ease-in-out;
      }
      .prose a:hover {
        color: rgba(244, 114, 83, 0.8); /* Warna brand-accent dengan sedikit transparansi */
      }
      
      .prose img {
        border-radius: 0.5rem; /* rounded-lg */
      }

      .prose iframe[src*="youtube.com"] {
        width: 100%;
        height: auto;
        aspect-ratio: 16 / 9;
        border-radius: 0.5rem; /* rounded-lg */
        margin-top: 2em;
        margin-bottom: 2em;
      }

      /* --- PERBAIKAN FINAL & LEBIH KUAT UNTUK LIST ITEM --- */
      
      /* 1. Hapus padding kiri default dari list <ol> dan <ul> */
      .prose ul,
      .prose ol {
        padding-left: 0;
      }
      
      /* 2. Atur ulang margin dan padding pada setiap list item <li> */
      .prose li {
        margin-top: 0.5em;
        margin-bottom: 0.5em;
        padding-left: 0;
      }

      /* 3. Atur ulang margin untuk paragraf <p> yang ada DI DALAM <li> */
      .prose li > p {
        margin-top: 0;
        margin-bottom: 0;
      }
      /* --- AKHIR PERBAIKAN UNTUK LIST ITEM --- */
    `}</style>
  );
};

export default BlogStyles;