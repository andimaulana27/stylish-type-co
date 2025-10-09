// src/components/LogotypePreview.tsx
import LogotypeGridClient from './LogotypeGridClient';
import { type LogotypeFont } from './LogotypeCard';

// FUNGSI BARU: Mengambil data dari API Route yang di-cache
async function getPreviewFonts() {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;
        const res = await fetch(`${baseUrl}/api/homepage/logotype-preview`, {
            next: { revalidate: 3600 } // Revalidate data cache setiap 1 jam
        });

        if (!res.ok) {
            throw new Error('Failed to fetch logotype preview fonts');
        }
        
        const data = await res.json();
        return data.previewFonts || [];
    } catch (error) {
        console.error("Error fetching logotype preview fonts:", error);
        return [];
    }
}


const LogotypePreview = async () => {
    // Panggil fungsi untuk mengambil data dari API
    const previewFonts: LogotypeFont[] = await getPreviewFonts();
    
    if (previewFonts.length === 0) {
        return null;
    }

    // Render komponen klien dan teruskan data sebagai props
    // Config tidak lagi dibutuhkan karena judul sudah statis di dalam komponen klien
    return <LogotypeGridClient previewFonts={previewFonts} config={null} />;
};

export default LogotypePreview;