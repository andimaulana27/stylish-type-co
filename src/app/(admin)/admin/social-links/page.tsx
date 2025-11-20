// src/app/(admin)/admin/social-links/page.tsx
'use client';

import { useState, useTransition, FormEvent, useEffect, Fragment } from 'react';
import { Tables } from '@/lib/database.types';
import { 
    getSocialLinksAction, 
    addSocialLinkAction, 
    updateSocialLinkAction, 
    deleteSocialLinkAction 
} from '@/app/actions/socialActions';
import toast from 'react-hot-toast';
import { Edit, Trash2, Loader2, X, PlusCircle, Link as LinkIcon, Check, ChevronDown } from 'lucide-react';
import { Dialog, Transition, Listbox } from '@headlessui/react';

// Impor ikon-ikon sosial Anda
import FacebookIcon from '@/components/icons/footer/FacebookIcon';
import InstagramIcon from '@/components/icons/footer/InstagramIcon';
import LinkedinIcon from '@/components/icons/footer/LinkedinIcon';
import BehanceIcon from '@/components/icons/footer/BehanceIcon';
import DribbbleIcon from '@/components/icons/footer/DribbbleIcon';

type SocialLink = Tables<'social_links'>;

// Peta (Map) Ikon
const iconMap: { [key: string]: React.FC<React.SVGProps<SVGSVGElement>> } = {
  facebook: FacebookIcon,
  instagram: InstagramIcon,
  linkedin: LinkedinIcon,
  behance: BehanceIcon,
  dribbble: DribbbleIcon,
  // Tambahkan ikon lain di sini jika Anda menambahkannya di Footer.tsx
};

// Dapatkan daftar nama kunci dari peta
const availableIcons = Object.keys(iconMap);

// Komponen Modal Form (di dalam file yang sama)
const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode }) => {
  if (!isOpen) return null;
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-black/60" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
              {/* --- PERBAIKAN 1: Menghapus 'overflow-hidden' --- */}
              <Dialog.Panel className="w-full max-w-md transform rounded-lg bg-brand-darkest border border-white/10 p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-xl font-semibold text-brand-light flex justify-between items-center mb-4">
                  {title}
                  <button onClick={onClose} className="text-brand-light-muted hover:text-white"><X size={24} /></button>
                </Dialog.Title>
                <div>{children}</div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

interface SocialLinkFormProps {
  link?: SocialLink | null;
  onSuccess: () => void;
  onClose: () => void;
}

const SocialLinkForm = ({ link, onSuccess, onClose }: SocialLinkFormProps) => {
    const [isPending, startTransition] = useTransition();
    const [currentIconKey, setCurrentIconKey] = useState(link?.icon_key || '');

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        
        formData.append('icon_key', currentIconKey);

        startTransition(async () => {
            const action = link 
                ? updateSocialLinkAction(link.id, formData) 
                : addSocialLinkAction(formData);
            
            const result = await action;

            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success(result.success || 'Success!');
                onSuccess();
                onClose();
            }
        });
    };

    const inputStyles = "w-full bg-white/5 border border-transparent rounded-md px-4 py-2 text-brand-light placeholder:text-brand-light-muted transition-colors duration-300 focus:outline-none focus:border-brand-accent";
    const labelStyles = "block text-sm font-medium text-brand-light-muted mb-2";

    const IconComponent = currentIconKey ? iconMap[currentIconKey] : null;

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="name" className={labelStyles}>Name</label>
                <input type="text" id="name" name="name" defaultValue={link?.name || ''} required className={inputStyles} placeholder="e.g., Facebook" />
            </div>
            <div>
                <label htmlFor="url" className={labelStyles}>Full URL</label>
                <input type="url" id="url" name="url" defaultValue={link?.url || ''} required className={inputStyles} placeholder="https://facebook.com/..." />
            </div>
            
            <div>
                <label className={labelStyles}>Icon</label>
                <Listbox value={currentIconKey} onChange={setCurrentIconKey}>
                    <div className="relative">
                        <Listbox.Button className={`${inputStyles} text-left flex justify-between items-center pr-3`}>
                            <span className={`block truncate ${currentIconKey ? 'text-brand-light' : 'text-brand-light-muted'}`}>
                                {currentIconKey ? (currentIconKey.charAt(0).toUpperCase() + currentIconKey.slice(1)) : 'Select an icon'}
                            </span>
                            <ChevronDown size={20} className="text-brand-light-muted" />
                        </Listbox.Button>
                        <Transition
                            as={Fragment}
                            leave="transition ease-in duration-100"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            <Listbox.Options className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-md bg-[#1e1e1e] py-1 shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
                                {availableIcons.map((key) => {
                                    const Icon = iconMap[key];
                                    return (
                                        <Listbox.Option
                                            key={key}
                                            className={({ active }) =>
                                                `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                                                active ? 'bg-brand-accent text-brand-darkest' : 'text-brand-light'
                                                }`
                                            }
                                            value={key}
                                        >
                                            {/* --- PERBAIKAN 2: Menambahkan 'active' ke scope --- */}
                                            {({ selected, active }) => (
                                                <>
                                                    <span className={`absolute inset-y-0 left-0 flex items-center pl-3 ${active ? 'text-brand-darkest' : 'text-brand-accent'}`}>
                                                        <Icon className="h-5 w-5" aria-hidden="true" />
                                                    </span>
                                                    <span
                                                        className={`block truncate ${
                                                        selected ? 'font-medium' : 'font-normal'
                                                        }`}
                                                    >
                                                        {key.charAt(0).toUpperCase() + key.slice(1)}
                                                    </span>
                                                    {selected ? (
                                                        <span className={`absolute inset-y-0 right-0 flex items-center pr-3 ${active ? 'text-brand-darkest' : 'text-brand-accent'}`}>
                                                            <Check className="h-5 w-5" aria-hidden="true" />
                                                        </span>
                                                    ) : null}
                                                </>
                                            )}
                                        </Listbox.Option>
                                    );
                                })}
                            </Listbox.Options>
                        </Transition>
                    </div>
                </Listbox>

                {IconComponent && (
                    <div className="mt-2 flex items-center gap-3 p-2 bg-white/5 rounded-md border border-white/10">
                        <IconComponent className="w-9 h-9 text-brand-accent" />
                        <span className="text-sm text-brand-light-muted">Icon preview</span>
                    </div>
                )}
            </div>

            <div className="border-t border-white/10 pt-4 flex justify-end gap-2">
                <button type="button" onClick={onClose} className="px-4 py-2 text-sm rounded-full bg-white/10 text-brand-light-muted hover:bg-white/20">
                    Cancel
                </button>
                <button type="submit" disabled={isPending} className="px-6 py-2 bg-brand-accent text-brand-darkest font-semibold rounded-full flex items-center gap-2 disabled:opacity-50">
                    {isPending && <Loader2 className="animate-spin" size={18} />}
                    {isPending ? 'Saving...' : 'Save'}
                </button>
            </div>
        </form>
    );
}

// Komponen Halaman Utama
export default function ManageSocialLinksPage() {
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLink, setSelectedLink] = useState<SocialLink | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  const fetchLinks = async () => {
    const { links: data, error } = await getSocialLinksAction();
    if (error) {
        toast.error(error);
    } else {
        setLinks(data as SocialLink[]);
    }
    setLoading(false); 
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const handleEdit = (link: SocialLink) => {
    setSelectedLink(link);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setSelectedLink(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (link: SocialLink) => {
    if (window.confirm(`Are you sure you want to delete the "${link.name}" link?`)) {
        setDeletingId(link.id);
        const result = await deleteSocialLinkAction(link.id);
        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success(result.success || 'Link deleted.');
            fetchLinks(); 
        }
        setDeletingId(null);
    }
  };

  if (loading) {
    return (
        <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-brand-light-muted" />
        </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-brand-light">Manage Social Links</h1>
          <p className="text-brand-light-muted">Edit links for the website footer.</p>
        </div>
        <button
            onClick={handleAddNew}
            className="flex items-center gap-2 px-4 py-2 bg-brand-accent text-brand-darkest font-semibold rounded-lg hover:bg-brand-accent/90 transition-colors"
        >
            <PlusCircle size={20} />
            <span>Add New Link</span>
        </button>
      </div>

      <div className="bg-brand-darkest rounded-lg border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-white/10 text-brand-light-muted">
              <tr>
                <th className="p-4 font-medium">Name</th>
                <th className="p-4 font-medium">URL</th>
                <th className="p-4 font-medium">Icon Key</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {links.map((link) => {
                const Icon = iconMap[link.icon_key];
                return (
                    <tr key={link.id} className="border-b border-white/10 last:border-b-0 hover:bg-white/5">
                    <td className="p-4 font-medium text-brand-light flex items-center gap-3">
                        {Icon ? <Icon className="w-5 h-5 text-brand-light-muted" /> : <LinkIcon className="w-5 h-5 text-brand-light-muted" />}
                        {link.name}
                    </td>
                    <td className="p-4 text-brand-light-muted truncate max-w-xs">{link.url}</td>
                    <td className="p-4 text-brand-light-muted font-mono text-xs">{link.icon_key}</td>
                    <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                            <button 
                                onClick={() => handleEdit(link)} 
                                className="flex items-center gap-1.5 text-sm font-semibold text-brand-secondary-gold px-2 py-1 rounded-md transition-all hover:bg-white/5"
                            >
                                <Edit size={14} />
                            </button>
                            <button 
                                onClick={() => handleDelete(link)} 
                                disabled={deletingId === link.id} 
                                className="flex items-center gap-1.5 text-sm font-semibold text-brand-secondary-red px-2 py-1 rounded-md transition-all hover:bg-white/5 disabled:opacity-50"
                            >
                                {deletingId === link.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                            </button>
                        </div>
                    </td>
                    </tr>
                );
              })}
              {links.length === 0 && (
                <tr>
                    <td colSpan={4} className="text-center p-8 text-brand-light-muted">
                        No social links added yet.
                    </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedLink ? 'Edit Social Link' : 'Add New Social Link'}
      >
        <SocialLinkForm
            link={selectedLink}
            onClose={() => setIsModalOpen(false)}
            onSuccess={fetchLinks}
        />
      </Modal>
    </div>
  );
}