// src/app/(auth)/login/LoginClientPage.tsx
'use client'; 

import Link from 'next/link';
import { useState, useTransition, useRef, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import PasswordField from './PasswordField';
import toast from 'react-hot-toast';
import { loginAction, registerAction } from '@/app/actions/authActions'; 
import GoogleAuthButton from '@/components/auth/GoogleAuthButton';
import { useAuth } from '@/context/AuthContext';
import RegistrationSuccessModal from '@/components/auth/RegistrationSuccessModal';
import VerificationSuccessModal from '@/components/auth/VerificationSuccessModal';

const Separator = () => (
  <div className="flex items-center gap-4 my-6">
    <div className="h-px flex-grow bg-white/10"></div>
    <span className="text-sm text-brand-light-muted">OR</span>
    <div className="h-px flex-grow bg-white/10"></div>
  </div>
);

export default function LoginClientPage() {
  const [isRegisterView, setIsRegisterView] = useState(false);
  const [isPending, startTransition] = useTransition();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { setSessionManually, profile, loading } = useAuth();
  const next = searchParams.get('next');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const registrationFormRef = useRef<HTMLFormElement>(null);

  const [isVerificationModalOpen, setVerificationModalOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get('verification') === 'success') {
      setVerificationModalOpen(true);
      const newPath = window.location.pathname;
      window.history.replaceState(null, '', newPath);
    }
  }, [searchParams]);

  const handleLoginSubmit = (formData: FormData) => {
    startTransition(async () => {
        const result = await loginAction(formData);
        if (result?.error) {
          toast.error(result.error);
        } else if (result?.success && result.redirectUrl && result.session) {
          setSessionManually(result.session);
          router.refresh();
          router.push(result.redirectUrl);
        }
    });
  };

  const handleRegisterSubmit = (formData: FormData) => {
    const password = String(formData.get('password'));
    const confirmPassword = String(formData.get('confirmPassword'));
    const email = String(formData.get('email'));

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    startTransition(async () => {
        const result = await registerAction(formData);
        if (result?.error) {
          toast.error(result.error);
        } else if (result?.success) {
          setRegisteredEmail(email);
          setIsModalOpen(true);
          registrationFormRef.current?.reset();
          setIsRegisterView(false);
        }
    });
  };
  
  const handleContinueToDashboard = () => {
    if (loading) return;

    let redirectUrl = '/account';
    const userRole = profile?.role || 'user';

    if (userRole === 'admin') {
      redirectUrl = '/admin/dashboard';
    } else if (userRole === 'blogger') {
      redirectUrl = '/admin/blog';
    } else if (userRole === 'uploader') {
      redirectUrl = '/admin/products/fonts';
    }
    
    setVerificationModalOpen(false);
    router.push(redirectUrl);
  };

  const primaryButtonClasses = "w-full bg-brand-accent text-brand-darkest font-medium py-3 rounded-full transition-all duration-300 ease-in-out transform hover:shadow-lg hover:shadow-brand-accent/40 disabled:opacity-50";
  const overlayButtonClasses = "mt-8 inline-block bg-brand-accent text-brand-darkest font-medium py-3 px-12 rounded-full transition-all duration-300 ease-in-out transform hover:shadow-lg hover:shadow-brand-accent/40";

  return (
    <>
      <RegistrationSuccessModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        email={registeredEmail}
      />
      <VerificationSuccessModal
        isOpen={isVerificationModalOpen}
        onClose={() => setVerificationModalOpen(false)}
        onContinue={handleContinueToDashboard}
      />

      <style jsx global>{`
        input:-webkit-autofill,
        input:-webkit-autofill:hover, 
        input:-webkit-autofill:focus, 
        input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 30px #171717 inset !important;
          -webkit-text-fill-color: #FFFFFF !important;
          caret-color: #FFFFFF !important;
        }
      `}</style>

      <div className="flex flex-col items-center text-center w-full">
        <h1 className="text-5xl md:text-5xl font-semibold text-brand-light">
          Welcome to Stylish Type
        </h1>
        <div className="w-24 h-1 bg-brand-accent mx-auto my-6 rounded-full"></div>
        <p className="text-lg text-brand-light-muted max-w-xl">
          Sign in to access your account or create a new one to start your creative journey.
        </p>

        <div className="relative w-full max-w-6xl h-auto md:h-[700px] bg-brand-darkest border border-brand-accent/50 rounded-2xl shadow-lg overflow-hidden flex items-center mt-12">
          <div className="absolute top-0 left-0 w-full h-full flex flex-col md:flex-row z-10">
            <div className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-12">
              <form action={handleLoginSubmit} className="w-full text-center">
                <input type="hidden" name="next" value={next || ''} />
                <h2 className="text-3xl font-semibold text-brand-light">Login</h2>
                <div className="w-16 h-0.5 bg-brand-accent mt-3 mb-8 mx-auto"></div>
                <div className="space-y-4 text-left">
                  <input 
                    type="email" name="email" placeholder="Email Address"
                    autoComplete="email" className="w-full p-4 bg-white/5 border border-transparent rounded-full text-brand-light placeholder:text-brand-light-muted focus:outline-none focus:border-brand-accent transition-colors" required 
                  />
                  <PasswordField
                      name="password" placeholder="Password" autoComplete="current-password"
                  />
                </div>
                <Link href="/forgot-password"
                  className="text-sm text-brand-accent hover:underline mt-4 block text-right">
                    Forgot Password?
                </Link>
                <button type="submit" disabled={isPending} className={`${primaryButtonClasses} mt-8`}>
                  {isPending ? 'Signing in...' : 'Login'}
                </button>
                <Separator />
                <GoogleAuthButton />
              </form>
            </div>

            <div className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-12">
              <form ref={registrationFormRef} action={handleRegisterSubmit} className="w-full text-center">
                <input type="hidden" name="next" value={next || ''} />
                <h2 className="text-3xl font-semibold text-brand-light">Registration</h2>
                <div className="w-16 h-0.5 bg-brand-accent mt-3 mb-8 mx-auto"></div>
                <div className="space-y-4 text-left">
                  <input 
                    type="text" name="fullName" placeholder="Full Name" autoComplete="name"
                    className="w-full p-4 bg-white/5 border border-transparent rounded-full text-brand-light placeholder:text-brand-light-muted focus:outline-none focus:border-brand-accent transition-colors" required 
                  />
                  <input 
                    type="email" name="email" placeholder="Email Address" autoComplete="email"
                    className="w-full p-4 bg-white/5 border border-transparent rounded-full text-brand-light placeholder:text-brand-light-muted focus:outline-none focus:border-brand-accent transition-colors" required 
                  />
                  <PasswordField name="password" placeholder="Create Password" autoComplete="new-password"/>
                  <PasswordField name="confirmPassword" placeholder="Confirm Password" autoComplete="new-password"/>
                </div>
                <div className="flex items-center gap-2 mt-4 text-left">
                  <input type="checkbox" id="terms" name="terms" required className="h-4 w-4 rounded border-gray-300 text-brand-accent focus:ring-brand-accent bg-white/10 accent-brand-accent" />
                  <label htmlFor="terms" className="text-xs text-brand-light-muted">
                    I agree to the <Link href="/terms" className="underline hover:text-brand-accent">Terms of Service</Link> and <Link href="/privacy" className="underline hover:text-brand-accent">Privacy Policy</Link>.
                  </label>
                </div>
                <button type="submit" disabled={isPending} className={`${primaryButtonClasses} mt-8`}>
                  {isPending ? 'Creating Account...' : 'Register'}
                </button>
                <Separator />
                <GoogleAuthButton />
              </form>
            </div>
          </div>
          
          <div className={`absolute top-0 left-0 w-full md:w-[calc(50%-1px)] h-full border border-brand-primary-blue rounded-2xl transition-transform duration-700 ease-in-out z-20 overflow-hidden 
            ${isRegisterView ? 'translate-x-full' : 'translate-x-0'}`}
          >
            <div className="absolute inset-0 bg-brand-darkest rounded-2xl"></div>
            <div className="absolute -bottom-1/3 left-1/2 -translate-x-1/2 w-full h-2/3 bg-gradient-radial from-brand-primary-blue/20 to-transparent blur-2xl pointer-events-none"></div>
            <div className="relative w-full h-full flex items-center justify-center p-12 text-center text-brand-light">
              <div className="relative w-full h-full flex items-center justify-center">
                <div className={`absolute transition-opacity duration-500 ${isRegisterView ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                  <h2 className="text-3xl font-semibold">Welcome Back, Designer!</h2>
                  <p className="mt-4 text-sm font-light text-brand-light-muted">Log in to access your purchased fonts, manage your subscription, and stay inspired.</p>
                  <button 
                    onClick={() => setIsRegisterView(true)}
                    className={overlayButtonClasses}>
                      Login Now
                  </button>
                </div>
                <div className={`absolute transition-opacity duration-500 ${isRegisterView ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                  <h2 className="text-3xl font-semibold">New Here? Let&apos;s Get Started.</h2>
                  <p className="mt-4 text-sm font-light text-brand-light-muted">Join Stylish Type to download premium fonts, explore curated bundles, and unlock creative benefits.</p>
                  <button 
                    onClick={() => setIsRegisterView(false)}
                    className={overlayButtonClasses}>
                      Register Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-center mt-12">
          <div className="text-md text-brand-light-muted">
            <Link href="/terms" className="hover:text-brand-accent">Terms of Service</Link>
            <span className="mx-2">|</span>
            <Link href="/privacy" className="hover:text-brand-accent">Privacy Policy</Link>
          </div>
          <p className="text-md text-brand-light-muted/50 mt-2">
            © {new Date().getFullYear()} Stylishtype.co. All Rights Reserved.
          </p>
        </div>
      </div>
    </>
  );
}