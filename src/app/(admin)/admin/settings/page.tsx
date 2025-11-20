// src/app/(admin)/admin/settings/page.tsx
'use client';

import { useState, useTransition, FormEvent, useEffect } from 'react';
import { getSiteConfigAction, updateSiteConfigAction } from '@/app/actions/configActions';
import toast from 'react-hot-toast';
import { Loader2, Save, Settings } from 'lucide-react';
import { Tables } from '@/lib/database.types';

type SiteConfig = Tables<'site_config'>;

export default function ManageSettingsPage() {
  const [config, setConfig] = useState<Partial<SiteConfig>>({});
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  
  useEffect(() => {
    // Ambil konfigurasi saat ini saat halaman dimuat
    getSiteConfigAction().then(result => {
      if (result.data) {
        setConfig(result.data);
      } else if (result.error) {
        toast.error(`Failed to load settings: ${result.error}`);
      }
      setLoading(false);
    });
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    startTransition(async () => {
        const result = await updateSiteConfigAction(formData);
        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success(result.success || 'Settings saved!');
            // Refresh data di form
            getSiteConfigAction().then(res => res.data && setConfig(res.data));
        }
    });
  };

  const inputStyles = "w-full bg-white/5 border border-transparent rounded-md px-4 py-2 text-brand-light placeholder:text-brand-light-muted transition-colors duration-300 focus:outline-none focus:border-brand-accent";
  const labelStyles = "block text-sm font-medium text-brand-light-muted mb-2";

  if (loading) {
    return (
        <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-brand-light-muted" />
        </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Settings size={32} className="text-brand-light" />
        <div>
            <h1 className="text-3xl font-bold text-brand-light">Site Settings</h1>
            <p className="text-brand-light-muted">Manage global site configurations like tracking pixels.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-brand-darkest p-8 rounded-lg border border-white/10 space-y-6 max-w-2xl">
        
        {/* Bagian Meta Pixel */}
        <fieldset className="space-y-4">
            <legend className="text-xl font-semibold text-brand-accent mb-4">Meta Pixel (Facebook/Instagram)</legend>
            <div>
                <label htmlFor="meta_pixel_id" className={labelStyles}>Meta Pixel ID</label>
                <input 
                    type="text" 
                    id="meta_pixel_id" 
                    name="meta_pixel_id" 
                    defaultValue={config.meta_pixel_id || ''} 
                    className={inputStyles} 
                    placeholder="Enter your Pixel ID (e.g., 1234567890)" 
                />
                <p className="text-xs text-brand-light-muted mt-2">
                    Masukkan hanya ID Pixel . Kode lengkap akan ditambahkan secara otomatis ke  website.
                </p>
            </div>
        </fieldset>

        {/* Anda bisa menambahkan field lain di sini di masa depan */}
        {/* <fieldset className="space-y-4 pt-6 border-t border-white/10">
            <legend className="text-xl font-semibold text-brand-accent mb-4">Google Analytics</legend>
            <div>
                <label htmlFor="google_analytics_id" className={labelStyles}>Google Analytics ID (G-)</label>
                <input 
                    type="text" 
                    id="google_analytics_id" 
                    name="google_analytics_id" 
                    defaultValue={config.google_analytics_id || ''} 
                    className={inputStyles} 
                    placeholder="Enter your Measurement ID (e.g., G-XXXXXXXXXX)" 
                />
            </div>
        </fieldset> */}
        
        <div className="border-t border-white/10 pt-6 flex justify-end">
            <button type="submit" disabled={isPending} className="px-8 py-3 bg-brand-accent text-brand-darkest font-semibold rounded-lg flex items-center gap-2 transition-all duration-300 ease-in-out hover:brightness-110 disabled:opacity-50">
                {isPending ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                {isPending ? 'Saving...' : 'Save Settings'}
            </button>
        </div>
      </form>
    </div>
  );
}