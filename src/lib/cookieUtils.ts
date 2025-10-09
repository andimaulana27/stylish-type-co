// src/actions/cookieActions.ts
'use server';

import { cookies } from 'next/headers';

const CONSENT_COOKIE_NAME = 'timelesstype_cookie_consent';

/**
 * Server Action to set the cookie consent.
 * @param consentValue The consent value ('accepted' or 'declined').
 */
export async function setCookieConsent(consentValue: 'accepted' | 'declined') {
  const cookieStore = cookies();
  cookieStore.set(CONSENT_COOKIE_NAME, consentValue, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365, // 1 year
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
}