// src/components/auth/AuthFooter.tsx
import Link from 'next/link';

const AuthFooter = () => {
  return (
    <footer className="bg-brand-secondary w-full text-center py-6">
      <div className="text-sm text-brand-light-muted">
        <Link href="/terms" className="hover:text-brand-accent-green">Terms of Service</Link>
        <span className="mx-2">|</span>
        <Link href="/privacy" className="hover:text-brand-accent-green">Privacy Policy</Link>
      </div>
      <p className="text-xs text-brand-light-muted/50 mt-2">
        © {new Date().getFullYear()} Timelesstype.co. All Rights Reserved.
      </p>
    </footer>
  );
};

export default AuthFooter;