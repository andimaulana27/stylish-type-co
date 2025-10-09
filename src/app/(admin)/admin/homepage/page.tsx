// src/app/(admin)/admin/homepage/page.tsx

export default function ManageHomepage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-brand-light">Manage Homepage</h1>
                <p className="text-brand-light-muted">Select a section from the sidebar to start customizing your homepage.</p>
            </div>
            <div className="p-12 text-center bg-brand-darkest rounded-lg border border-dashed border-white/10">
                <p className="text-brand-light-muted">
                    {/* --- PERBAIKAN: Tanda kutip tunggal diganti dengan &apos; --- */}
                    Please choose a section like &apos;Logotype Preview&apos;, &apos;Popular Bundles&apos;, or &apos;Featured Products&apos; from the sidebar menu to continue.
                </p>
            </div>
        </div>
    );
}