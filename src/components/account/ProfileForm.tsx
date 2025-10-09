// src/components/account/ProfileForm.tsx
'use client';

import { useTransition, FormEvent, useState, ChangeEvent } from 'react';
import { type User } from '@supabase/supabase-js';
import { type Tables } from '@/lib/database.types';
import toast from 'react-hot-toast';
import { updateUserProfileAction, updateUserPasswordAction } from '@/app/actions/userActions';
import Image from 'next/image';
import { Loader2, Camera } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

type Profile = Tables<'profiles'>;

export default function ProfileForm({ user, profile }: { user: User; profile: Profile }) {
    const { refreshAuthStatus } = useAuth();
    const [isPending, startTransition] = useTransition();
    const [isPasswordPending, startPasswordTransition] = useTransition();
    
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);

    const isOAuthUser = user.app_metadata.provider !== 'email';

    const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAvatarFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleProfileUpdate = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        
        if (avatarFile) {
            formData.append('avatar', avatarFile);
        }

        startTransition(async () => {
            const result = await updateUserProfileAction(formData);
            if (result?.error) {
                toast.error(result.error);
            } else {
                toast.success(result.success || 'Profile updated!');
                setAvatarPreview(null);
                setAvatarFile(null);
                await refreshAuthStatus();
            }
        });
    };

    const handlePasswordUpdate = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const newPassword = String(formData.get('newPassword'));
        const confirmPassword = String(formData.get('confirmPassword'));

        if (newPassword !== confirmPassword) {
            toast.error("New passwords do not match.");
            return;
        }

        startPasswordTransition(async () => {
            const result = await updateUserPasswordAction(formData);
            if (result?.error) {
                toast.error(result.error);
            } else {
                toast.success(result.success || 'Password updated!');
                (event.target as HTMLFormElement).reset();
            }
        });
    };
    
    const displayAvatarUrl = avatarPreview || profile.avatar_url || user.user_metadata.avatar_url || 'https://avatar.iran.liara.run/public';

    const inputStyles = "w-full bg-white/5 border border-transparent rounded-lg px-4 py-3 text-brand-light placeholder:text-brand-light-muted transition-colors duration-300 focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent hover:border-brand-accent/50";
    const labelStyles = "block text-sm font-medium text-brand-light-muted mb-2";

    return (
        <div className="space-y-12">
            <form onSubmit={handleProfileUpdate} className="space-y-8">
                <div className="flex items-center gap-6">
                    <div className="relative group flex-shrink-0">
                        <Image
                            src={displayAvatarUrl}
                            alt="Profile Avatar"
                            width={80}
                            height={80}
                            className="rounded-full object-cover"
                            key={displayAvatarUrl}
                        />
                        <label htmlFor="avatar-upload" className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                            <Camera size={24} className="text-white" />
                            <input 
                                id="avatar-upload"
                                name="avatar"
                                type="file" 
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                onChange={handleAvatarChange}
                                accept="image/png, image/jpeg, image/webp"
                            />
                        </label>
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-brand-light">{profile.full_name || 'New User'}</h3>
                        <p className="text-brand-light-muted">{profile.email}</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label htmlFor="fullName" className={labelStyles}>Full Name</label>
                        <input type="text" id="fullName" name="fullName" defaultValue={profile.full_name || ''} className={inputStyles} />
                    </div>
                     <div className="space-y-2">
                        <label htmlFor="streetAddress" className={labelStyles}>Street Address</label>
                        <input type="text" id="streetAddress" name="streetAddress" defaultValue={profile.street_address || ''} className={inputStyles} />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <label htmlFor="city" className={labelStyles}>City</label>
                        <input type="text" id="city" name="city" defaultValue={profile.city || ''} className={inputStyles} />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="country" className={labelStyles}>Country</label>
                        <input type="text" id="country" name="country" defaultValue={profile.country || ''} className={inputStyles} />
                    </div>
                     <div className="space-y-2">
                        <label htmlFor="postalCode" className={labelStyles}>Postal Code</label>
                        <input type="text" id="postalCode" name="postalCode" defaultValue={profile.postal_code || ''} className={inputStyles} />
                    </div>
                </div>
                <div className="text-right border-t border-white/10 pt-6">
                    <button type="submit" disabled={isPending} className="px-6 py-2 bg-brand-accent text-brand-darkest font-semibold rounded-lg transition-all duration-300 ease-in-out hover:brightness-110 disabled:opacity-50 flex items-center gap-2 float-right">
                        {isPending && <Loader2 className="animate-spin" size={18} />}
                        {isPending ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
            
            {!isOAuthUser && (
                <div>
                    <h3 className="text-xl font-bold text-brand-light mb-6">Change Password</h3>
                    <form onSubmit={handlePasswordUpdate} className="space-y-6">
                         <div className="space-y-2">
                            <label htmlFor="newPassword" className={labelStyles}>New Password</label>
                            <input type="password" id="newPassword" name="newPassword" required className={inputStyles} />
                        </div>
                         <div className="space-y-2">
                            <label htmlFor="confirmPassword" className={labelStyles}>Confirm New Password</label>
                            <input type="password" id="confirmPassword" name="confirmPassword" required className={inputStyles} />
                        </div>
                        <div className="text-right border-t border-white/10 pt-6">
                            <button type="submit" disabled={isPasswordPending} className="px-6 py-2 bg-brand-accent text-brand-darkest font-semibold rounded-lg transition-all duration-300 ease-in-out hover:brightness-110 disabled:opacity-50 flex items-center gap-2 float-right">
                                {isPasswordPending && <Loader2 className="animate-spin" size={18} />}
                                {isPasswordPending ? 'Updating...' : 'Update Password'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}