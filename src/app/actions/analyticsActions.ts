// src/app/actions/analyticsActions.ts
'use server';

import { BetaAnalyticsDataClient, protos } from '@google-analytics/data';
import { GoogleAuth } from 'google-auth-library';
import { format } from 'date-fns';

type RunReportResponse = protos.google.analytics.data.v1beta.IRunReportResponse;
type Row = protos.google.analytics.data.v1beta.IRow;
type AnalyticsReportTuple = [
    RunReportResponse,
    protos.google.analytics.data.v1beta.IRunReportRequest | undefined,
    Record<string, unknown> | undefined
];

const auth = new GoogleAuth({
    credentials: {
        client_email: process.env.GA_CLIENT_EMAIL,
        private_key: process.env.GA_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: 'https://www.googleapis.com/auth/analytics.readonly',
});

const analyticsDataClient = new BetaAnalyticsDataClient({ auth });
const propertyId = process.env.GA_PROPERTY_ID;

const processMultiDimensionReport = (response: AnalyticsReportTuple) => {
    if (!response || !response[0]?.rows) return [];
    return response[0].rows.map((row: Row) => ({
        name: row.dimensionValues?.[0].value || 'N/A',
        value: parseInt(row.metricValues?.[0].value || '0', 10),
    }));
};

// --- PERUBAHAN DI SINI: Mengubah parameter dari periodInDays menjadi startDate dan endDate ---
export async function getAnalyticsDataAction(startDate: string, endDate: string) {
    if (!propertyId || !process.env.GA_CLIENT_EMAIL || !process.env.GA_PRIVATE_KEY) {
        return { error: 'Konfigurasi Google Analytics API tidak lengkap di file .env.local.' };
    }

    try {
        const [
            statsResponse,
            chartResponse,
            topPagesResponse,
            referrersResponse,
            countriesResponse,
            devicesResponse,
            osResponse
        ] = await Promise.all([
            // Query untuk statistik utama
            analyticsDataClient.runReport({
                property: `properties/${propertyId}`,
                dateRanges: [{ startDate, endDate }],
                metrics: [{ name: 'activeUsers' }, { name: 'screenPageViews' }, { name: 'bounceRate' }],
            }),
            // Query untuk data grafik harian
            analyticsDataClient.runReport({
                property: `properties/${propertyId}`,
                dateRanges: [{ startDate, endDate }],
                dimensions: [{ name: 'date' }],
                metrics: [{ name: 'activeUsers' }],
                orderBys: [{ 
                    dimension: { 
                        dimensionName: 'date',
                        orderType: 'ALPHANUMERIC' 
                    } 
                }]
            }),
            // Query untuk halaman teratas
            analyticsDataClient.runReport({ property: `properties/${propertyId}`, dateRanges: [{ startDate, endDate }], dimensions: [{ name: 'pagePath' }], metrics: [{ name: 'activeUsers' }], limit: 7, orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }] }),
            // Query untuk sumber traffic teratas
            analyticsDataClient.runReport({ property: `properties/${propertyId}`, dateRanges: [{ startDate, endDate }], dimensions: [{ name: 'sessionSource' }], metrics: [{ name: 'activeUsers' }], limit: 7, orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }] }),
            // Query untuk negara teratas
            analyticsDataClient.runReport({ property: `properties/${propertyId}`, dateRanges: [{ startDate, endDate }], dimensions: [{ name: 'country' }], metrics: [{ name: 'activeUsers' }], limit: 5, orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }] }),
            // Query untuk perangkat
            analyticsDataClient.runReport({ property: `properties/${propertyId}`, dateRanges: [{ startDate, endDate }], dimensions: [{ name: 'deviceCategory' }], metrics: [{ name: 'activeUsers' }], orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }] }),
            // Query untuk sistem operasi
            analyticsDataClient.runReport({ property: `properties/${propertyId}`, dateRanges: [{ startDate, endDate }], dimensions: [{ name: 'operatingSystem' }], metrics: [{ name: 'activeUsers' }], limit: 5, orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }] }),
        ]);

        const statsRow = statsResponse[0]?.rows?.[0];
        const stats = {
            visitors: parseInt(statsRow?.metricValues?.[0]?.value || '0', 10),
            pageViews: parseInt(statsRow?.metricValues?.[1]?.value || '0', 10),
            bounceRate: parseFloat(statsRow?.metricValues?.[2]?.value || '0') * 100,
        };
        
        const chartData = chartResponse[0]?.rows?.map((row: Row) => {
            const dateStr = row.dimensionValues?.[0].value || '';
            // Format tanggal dari YYYYMMDD menjadi 'dd MMM'
            const formattedDate = format(new Date(
                parseInt(dateStr.substring(0, 4)), 
                parseInt(dateStr.substring(4, 6)) - 1, // Bulan dimulai dari 0
                parseInt(dateStr.substring(6, 8))
            ), 'dd MMM');
            return {
                name: formattedDate,
                visitors: parseInt(row.metricValues?.[0].value || '0', 10),
            };
        }) || [];

        return {
            data: {
                stats,
                chartData,
                topPages: processMultiDimensionReport(topPagesResponse),
                topReferrers: processMultiDimensionReport(referrersResponse),
                topCountries: processMultiDimensionReport(countriesResponse),
                topDevices: processMultiDimensionReport(devicesResponse),
                topOS: processMultiDimensionReport(osResponse),
            },
        };

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Terjadi kesalahan saat menghubungi Google Analytics API.";
        console.error("Google Analytics API Error:", message);
        if (message.includes('PERMISSION_DENIED')) {
             return { error: "Gagal mengambil data analitik. Pastikan Service Account memiliki peran 'Viewer' di Google Analytics dan API-nya telah diaktifkan." };
        }
        return { error: message };
    }
}