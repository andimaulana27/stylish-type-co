// src/app/api/homepage/trusted-by/route.get.ts
import { getBrandsAction } from '@/app/actions/brandActions';

export async function getBrands() {
    try {
        const { brands, error } = await getBrandsAction();

        if (error || !brands) {
            throw new Error(error || "Failed to fetch brands");
        }

        return { brands };

    } catch (error) {
        console.error("Error fetching brands:", error);
        return { brands: [] };
    }
}