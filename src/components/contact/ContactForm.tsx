// src/components/contact/ContactForm.tsx
'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { useEffect, useRef } from 'react';
import { sendContactEmailAction } from '@/app/actions/contactActions';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

const initialState = {
  message: '',
  errors: null,
  success: false,
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full px-8 py-4 font-medium rounded-full text-center bg-brand-accent text-brand-darkest transition-all duration-300 ease-in-out hover:brightness-110 hover:shadow-lg hover:shadow-brand-accent/30 disabled:opacity-60 flex items-center justify-center gap-2"
    >
      {pending && <Loader2 className="animate-spin" size={20} />}
      {pending ? 'Sending...' : 'Send Message'}
    </button>
  );
}

export default function ContactForm() {
  const [state, formAction] = useFormState(sendContactEmailAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      toast.success(state.message);
      formRef.current?.reset();
    } else if (state.message && !state.errors) {
      toast.error(state.message);
    }
  }, [state]);

  const inputStyles = "w-full bg-white/5 border border-transparent rounded-full px-4 py-3 text-brand-light placeholder:text-brand-light-muted transition-colors duration-300 focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent hover:border-brand-accent/50";
  const textareaStyles = "w-full bg-white/5 border border-transparent rounded-xl p-4 text-brand-light placeholder:text-brand-light-muted transition-colors duration-300 focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent hover:border-brand-accent/50";

  return (
    <form ref={formRef} action={formAction} className="max-w-3xl mx-auto space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <input
            type="text"
            name="name"
            placeholder="Your Name *"
            className={inputStyles}
            required
          />
          {state.errors?.name && <p className="text-red-500 text-xs mt-1 ml-4">{state.errors.name[0]}</p>}
        </div>
        <div>
          <input
            type="email"
            name="email"
            placeholder="Your Email *"
            className={inputStyles}
            required
          />
          {state.errors?.email && <p className="text-red-500 text-xs mt-1 ml-4">{state.errors.email[0]}</p>}
        </div>
      </div>
      <div>
        <input
          type="text"
          name="subject"
          placeholder="Subject *"
          className={inputStyles}
          required
        />
        {state.errors?.subject && <p className="text-red-500 text-xs mt-1 ml-4">{state.errors.subject[0]}</p>}
      </div>
      <div>
        <textarea
          name="message"
          placeholder="Your Message *"
          rows={6}
          className={textareaStyles}
          required
        ></textarea>
        {state.errors?.message && <p className="text-red-500 text-xs mt-1 ml-4">{state.errors.message[0]}</p>}
      </div>
      <div className="text-center">
        <SubmitButton />
      </div>
    </form>
  );
}