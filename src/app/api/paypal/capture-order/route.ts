// src/app/api/paypal/capture-order/route.ts
import { NextResponse } from 'next/server';

const { NEXT_PUBLIC_PAYPAL_CLIENT_ID, PAYPAL_SECRET_KEY, NEXT_PUBLIC_PAYPAL_API_BASE_URL } = process.env;
const base_url = NEXT_PUBLIC_PAYPAL_API_BASE_URL;

// Fungsi untuk mendapatkan Access Token (bisa juga di-refactor ke file terpisah)
async function getPayPalAccessToken() {
    const auth = Buffer.from(`${NEXT_PUBLIC_PAYPAL_CLIENT_ID}:${PAYPAL_SECRET_KEY}`).toString('base64');
    const response = await fetch(`${base_url}/v1/oauth2/token`, {
        method: 'POST',
        body: 'grant_type=client_credentials',
        headers: {
            Authorization: `Basic ${auth}`,
        },
    });
    const data = await response.json();
    return data.access_token;
}

// Fungsi utama untuk menangkap (capture) pembayaran
export async function POST(request: Request) {
    try {
        const accessToken = await getPayPalAccessToken();
        const { orderID } = await request.json();

        const response = await fetch(`${base_url}/v2/checkout/orders/${orderID}/capture`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
        });

        const data = await response.json();

        if (!response.ok) {
             throw new Error(data.message || 'Failed to capture PayPal order.');
        }

        return NextResponse.json(data);
    } catch (error: unknown) {
         const message = error instanceof Error ? error.message : "Unknown error occurred";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}