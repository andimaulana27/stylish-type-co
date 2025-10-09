// src/app/(admin)/admin/licenses/page.tsx
'use client'; // Halaman diubah menjadi Client Component

import { useState, useTransition, FormEvent, useEffect } from 'react';
import { Tables } from '@/lib/database.types';
import { deleteLicenseAction, updateLicenseAction, getLicensesAction } from '@/app/actions/licenseActions';
import toast from 'react-hot-toast';
import { Edit, Trash2, Loader2, X, PlusCircle } from 'lucide-react';

type License = Tables<'licenses'>;

// --- KONTEN DARI LicenseForm.tsx DIMULAI DI SINI ---
interface LicenseFormProps {
  isOpen: boolean;
  onClose: () => void;
  license: License | null;
  onSuccess: (license: License) => void;
}

const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center animate-fade-in" onClick={onClose}>
      <div className="bg-brand-darkest border border-white/10 rounded-lg p-6 w-full max-w-2xl shadow-2xl overflow-y-auto max-h-[90vh]" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4 sticky top-0 bg-brand-darkest py-2 z-10">
          <h3 className="text-xl font-semibold text-brand-light">{title}</h3>
          <button onClick={onClose} className="text-brand-light-muted hover:text-white"><X size={24} /></button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};

const BenefitInputGroup = ({ title, benefits, setBenefits }: { title: string, benefits: string[], setBenefits: React.Dispatch<React.SetStateAction<string[]>> }) => {
    const handleBenefitChange = (index: number, value: string) => {
        const newBenefits = [...benefits];
        newBenefits[index] = value;
        setBenefits(newBenefits);
    };

    const addBenefit = () => setBenefits([...benefits, '']);
    const removeBenefit = (index: number) => setBenefits(benefits.filter((_, i) => i !== index));
    
    const inputStyles = "w-full bg-white/10 border border-transparent rounded-md px-3 py-1.5 text-brand-light placeholder:text-brand-light-muted text-sm transition-colors duration-300 focus:outline-none focus:border-brand-accent";

    return (
        <div className="space-y-2 group">
            <label className="block text-sm font-medium text-brand-light-muted mb-2">{title}</label>
            <div className="space-y-2">
                {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <input type="text" value={benefit} onChange={(e) => handleBenefitChange(index, e.target.value)} placeholder="Enter a benefit..." className={inputStyles} />
                        <button type="button" onClick={() => removeBenefit(index)} className="text-red-500 hover:text-red-400 p-1">
                            <Trash2 size={18} />
                        </button>
                    </div>
                ))}
            </div>
            <button type="button" onClick={addBenefit} className="mt-2 flex items-center gap-2 text-sm text-brand-accent hover:text-brand-accent/80 font-semibold">
                <PlusCircle size={16} />
                Add Benefit
            </button>
        </div>
    );
};

const LicenseForm = ({ isOpen, onClose, license, onSuccess }: LicenseFormProps) => {
    const [isPending, startTransition] = useTransition();
    const isStandardLicense = license?.name.toLowerCase() === 'standard';
    const licensesToExcludeBundlePrice = ['trademark', 'studio', 'extended', 'corporate', 'exclusive'];
    const hideBundlePrice = license ? licensesToExcludeBundlePrice.includes(license.name.toLowerCase()) : false;
    const [allowed, setAllowed] = useState<string[]>([]);
    const [notAllowed, setNotAllowed] = useState<string[]>([]);

    useEffect(() => {
        if (license) {
            setAllowed(license.allowed || []);
            setNotAllowed(license.not_allowed || []);
        }
    }, [license]);

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!license) return;

        const formData = new FormData(event.currentTarget);
        
        formData.delete('allowed');
        formData.delete('not_allowed');
        allowed.forEach(item => { if(item) formData.append('allowed', item) });
        notAllowed.forEach(item => { if(item) formData.append('not_allowed', item) });
        
        startTransition(async () => {
            const result = await updateLicenseAction(license.id, formData);

            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success(result.success || 'Operation successful!');
                if (result.license) {
                    onSuccess(result.license as License);
                }
                onClose();
            }
        });
    };
    
    const inputStyles = "w-full bg-white/5 border border-transparent rounded-md px-4 py-2 text-brand-light placeholder:text-brand-light-muted transition-colors duration-300 focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent hover:border-brand-accent/50";
    const labelStyles = "block text-sm font-medium text-brand-light-muted mb-2 group-hover:text-brand-accent transition-colors";

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={license ? `Edit "${license.name}"` : 'Add New License'}>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2 group">
                    <label htmlFor="name" className={labelStyles}>License Name</label>
                    <input type="text" id="name" name="name" defaultValue={license?.name || ''} required className={inputStyles} placeholder="e.g., Webfont License" disabled={isStandardLicense}/>
                     {isStandardLicense && <p className="text-xs text-yellow-500 mt-1">The Standard License name cannot be changed.</p>}
                </div>
                <div className="space-y-2 group">
                    <label htmlFor="description" className={labelStyles}>Description</label>
                    <textarea id="description" name="description" defaultValue={license?.description || ''} rows={3} className={`${inputStyles} rounded-lg`} placeholder="A brief explanation of this license."></textarea>
                </div>
                
                <div className={`grid grid-cols-1 ${hideBundlePrice ? 'md:grid-cols-1' : 'md:grid-cols-2'} gap-6`}>
                    <div className="space-y-2 group">
                        <label htmlFor="font_price" className={labelStyles}>Font Price ($)</label>
                        <input type="number" id="font_price" name="font_price" defaultValue={license?.font_price ?? 0} className={inputStyles} placeholder="e.g., 29.00" step="0.01" disabled={isStandardLicense}/>
                    </div>
                    {!hideBundlePrice && (
                      <div className="space-y-2 group">
                          <label htmlFor="bundle_price" className={labelStyles}>Bundle Price ($)</label>
                          <input type="number" id="bundle_price" name="bundle_price" defaultValue={license?.bundle_price ?? 0} className={inputStyles} placeholder="e.g., 72.50" step="0.01" disabled={isStandardLicense}/>
                      </div>
                    )}
                </div>
                {isStandardLicense && <p className="text-xs text-yellow-500 -mt-4">Standard License price is taken from the product&apos;s base price.</p>}
                {hideBundlePrice && <p className="text-xs text-yellow-500 -mt-4">This license type does not apply to bundles.</p>}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-white/10 pt-4">
                    <BenefitInputGroup title="Allowed" benefits={allowed} setBenefits={setAllowed} />
                    <BenefitInputGroup title="Not Allowed" benefits={notAllowed} setBenefits={setNotAllowed} />
                </div>

                <div className="border-t border-white/10 pt-4 flex justify-end">
                    <button type="submit" disabled={isPending} className="px-6 py-2 bg-brand-accent text-brand-darkest font-semibold rounded-lg transition-all duration-300 ease-in-out hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                        {isPending && <Loader2 className="animate-spin" size={18} />}
                        {isPending ? 'Saving...' : 'Save License'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
// --- KONTEN DARI LicenseForm.tsx BERAKHIR DI SINI ---


// --- KONTEN DARI LicenseDataTable.tsx SEKARANG MENJADI KOMPONEN UTAMA HALAMAN INI ---
export default function ManageLicensesPage() {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLicense, setSelectedLicense] = useState<License | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchLicenses = async () => {
        const { licenses, error } = await getLicensesAction();
        if (error) {
            toast.error(error);
        } else if (licenses) {
            setLicenses(licenses as License[]);
        }
        setLoading(false);
    };
    fetchLicenses();
  }, []);

  const handleEdit = (license: License) => {
    setSelectedLicense(license);
    setIsModalOpen(true);
  };

  const handleDelete = async (license: License) => {
    if (license.name.toLowerCase() === 'standard') {
        toast.error('The Standard License cannot be deleted.');
        return;
    }

    if (window.confirm(`Are you sure you want to delete the "${license.name}" license? This cannot be undone.`)) {
        setDeletingId(license.id);
        const result = await deleteLicenseAction(license.id);
        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success(result.success || 'License deleted.');
            setLicenses(prev => prev.filter(l => l.id !== license.id));
        }
        setDeletingId(null);
    }
  };

  const handleFormSuccess = (updatedLicense: License) => {
    setLicenses(prevLicenses => {
        const existingIndex = prevLicenses.findIndex(l => l.id === updatedLicense.id);
        if (existingIndex > -1) {
            const newLicenses = [...prevLicenses];
            newLicenses[existingIndex] = updatedLicense;
            return newLicenses;
        }
        return [...prevLicenses, updatedLicense];
    });
    setIsModalOpen(false);
  };
  
  if (loading) {
    return (
        <div className="bg-brand-darkest p-6 rounded-lg border border-white/10">
            <div className="animate-pulse">
            <div className="h-8 bg-white/5 rounded w-1/4 mb-4"></div>
            <div className="space-y-2">
                <div className="h-12 bg-white/5 rounded"></div>
                <div className="h-12 bg-white/5 rounded"></div>
                <div className="h-12 bg-white/5 rounded"></div>
            </div>
            </div>
        </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-brand-light">Manage Licenses</h1>
          <p className="text-brand-light-muted">Edit the details and price for each license type.</p>
        </div>
      </div>

      <div className="bg-brand-darkest rounded-lg border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-white/10 text-brand-light-muted">
              <tr>
                <th className="p-4 font-medium">License Name</th>
                <th className="p-4 font-medium">Font Price</th>
                <th className="p-4 font-medium">Bundle Price</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {licenses.map((license) => (
                <tr key={license.id} className="border-b border-white/10 last:border-b-0 hover:bg-white/5">
                  <td className="p-4 font-medium text-brand-light">{license.name}</td>
                  <td className="p-4 text-brand-light-muted">
                    {license.name.toLowerCase() === 'standard' ? <span className="italic">Based on Product</span> : `$${license.font_price?.toFixed(2) ?? '0.00'}`}
                  </td>
                  <td className="p-4 text-brand-light-muted">
                    {license.name.toLowerCase() === 'standard' ? <span className="italic">Based on Product</span> : `$${license.bundle_price?.toFixed(2) ?? '0.00'}`}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                        <button 
                            onClick={() => handleEdit(license)} 
                            className="flex items-center gap-1.5 text-sm font-semibold text-brand-secondary-gold px-2 py-1 rounded-md transition-all duration-200 hover:bg-white/5 hover:shadow-lg hover:shadow-brand-secondary-gold/30"
                        >
                            <Edit size={14} />
                            <span>Edit</span>
                        </button>
                        {license.name.toLowerCase() !== 'standard' && (
                            <button 
                                onClick={() => handleDelete(license)} 
                                disabled={deletingId === license.id} 
                                className="flex items-center gap-1.5 text-sm font-semibold text-brand-secondary-red px-2 py-1 rounded-md transition-all duration-200 hover:bg-white/5 hover:shadow-lg hover:shadow-brand-secondary-red/30 disabled:opacity-50"
                            >
                                {deletingId === license.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                <span>{deletingId === license.id ? 'Deleting...' : 'Delete'}</span>
                            </button>
                        )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {isModalOpen && (
        <LicenseForm
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            license={selectedLicense}
            onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
}