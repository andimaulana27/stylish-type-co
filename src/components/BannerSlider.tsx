// src/components/BannerSlider.tsx
import BannerSliderClient from './BannerSliderClient';

// FUNGSI BARU: Mengambil data dari API Route
async function getBannerData() {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;
        const res = await fetch(`${baseUrl}/api/homepage/banner-slides`, {
            next: { revalidate: 3600 } // Revalidate data cache setiap 1 jam
        });

        if (!res.ok) {
            throw new Error('Failed to fetch banner slides');
        }

        const data = await res.json();
        return data.bannerData || [];
    } catch (error) {
        console.error("Error fetching banner data:", error);
        return [];
    }
}

const BannerSlider = async () => {
    const bannerData = await getBannerData();

    if (bannerData.length === 0) {
        return null;
    }

    return <BannerSliderClient bannerData={bannerData} />;
};

export default BannerSlider;