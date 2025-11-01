// src/app/(admin)/admin/newsletter/page.tsx
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '@/lib/database.types';
import NewsletterClient from './NewsletterClient'; // Impor komponen klien
import { getCombinedSubscribersAction, type CombinedSubscriber } from '@/app/actions/newsletterActions'; // Impor action dan tipe

const ITEMS_PER_PAGE = 20;

export default async function ManageNewsletterPage({
    searchParams,
}: {
    searchParams: { [key: string]: string | string[] | undefined };
}) {
    const currentPage = Number(searchParams.page) || 1;
    const searchTerm = (searchParams.search as string) || '';
    const selectedCategory = (searchParams.category as 'All' | 'Registered User' | 'Anonymous Subscriber') || 'All';

    let initialSubscribers: CombinedSubscriber[] = [];
    let initialTotalPages = 0;
    let error: string | null = null;

    try {
        const { data, count, error: fetchError } = await getCombinedSubscribersAction({
            page: currentPage,
            limit: ITEMS_PER_PAGE,
            searchTerm,
            category: selectedCategory,
        });

        if (fetchError) throw new Error(fetchError);

        initialSubscribers = data as CombinedSubscriber[];
        initialTotalPages = Math.ceil((count || 0) / ITEMS_PER_PAGE);

    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
        console.error('Error fetching initial data for Manage Newsletter page:', errorMessage);
        error = "Failed to load subscriber data. Please try refreshing the page.";
    }

    if (error) {
        return (
            <div className="bg-red-900/20 border border-red-500/30 text-red-300 p-6 rounded-lg">
                <h2 className="font-bold">Error Loading Data</h2>
                <p className="text-sm mt-2">{error}</p>
            </div>
        );
    }

    // Render komponen klien dengan data awal
    return (
        <NewsletterClient
            initialSubscribers={initialSubscribers}
            initialTotalPages={initialTotalPages}
        />
    );
}