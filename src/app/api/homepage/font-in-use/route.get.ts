// src/app/api/homepage/font-in-use/route.get.ts
import { getGalleryImagesAction } from '@/app/actions/galleryActions';

export async function getGalleryImages() {
    try {
        const galleryResult = await getGalleryImagesAction();
        
        if (!galleryResult.success || !galleryResult.images) {
             throw new Error(galleryResult.error || "Failed to fetch gallery images");
        }

        return { images: galleryResult.images };

    } catch (error) {
        console.error("Error fetching gallery images:", error);
        return { images: [] };
    }
}