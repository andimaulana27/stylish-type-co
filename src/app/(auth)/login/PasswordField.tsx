// src/app/(auth)/login/PasswordField.tsx
'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface PasswordFieldProps {
  name: string;
  placeholder: string;
  autoComplete: string;
}

const PasswordField = ({ name, placeholder, autoComplete }: PasswordFieldProps) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <input
        type={showPassword ? 'text' : 'password'}
        name={name}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="w-full p-4 pr-12 bg-white/5 border border-transparent rounded-full text-brand-light placeholder:text-brand-light-muted focus:outline-none focus:border-brand-accent transition-colors"
        required
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute inset-y-0 right-0 flex items-center pr-4 text-brand-light-muted transition-colors"
      >
        {/* --- PERUBAHAN WARNA HOVER DI SINI --- */}
        {showPassword ? (
          <EyeOff size={20} className="hover:text-brand-accent" />
        ) : (
          <Eye size={20} className="hover:text-brand-accent" />
        )}
      </button>
    </div>
  );
};

export default PasswordField;