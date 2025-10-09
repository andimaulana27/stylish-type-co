// src/app/(main)/account/orders/page.tsx
import SectionHeader from '@/components/SectionHeader';
import { getOrderHistoryAction } from '@/app/actions/userActions';
import { FileText, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export const revalidate = 0;

const StatusBadge = ({ status }: { status: string }) => {
    const statusClasses = 
        status === 'Completed' ? 'bg-green-500/20 text-green-300'
      : status === 'Pending' ? 'bg-yellow-500/20 text-yellow-500'
      : 'bg-gray-500/20 text-gray-300';
    return (
        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${statusClasses}`}>
            {status}
        </span>
    );
};

export default async function OrderHistoryPage() {
    const { orders, error } = await getOrderHistoryAction();

    return (
        <div>
            <SectionHeader
                align="left"
                title="Order History"
                subtitle="Review your past purchases and download your invoices and licenses."
            />

            <div className="mt-8 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-white/10 text-brand-light-muted">
                            <tr>
                                <th className="p-4 font-medium">Order ID</th>
                                <th className="p-4 font-medium">Date</th>
                                <th className="p-4 font-medium">Items</th>
                                <th className="p-4 font-medium">Total</th>
                                <th className="p-4 font-medium">Status</th>
                                <th className="p-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {error && <tr><td colSpan={6} className="p-4 text-center text-red-400">{error}</td></tr>}
                            {!orders || orders.length === 0 ? (
                                <tr><td colSpan={6} className="p-8 text-center text-brand-light-muted">No orders found.</td></tr>
                            ) : (
                                orders.map((order) => (
                                    <tr key={order.id} className="border-b border-white/10 last:border-b-0 hover:bg-white/5 transition-colors">
                                        <td className="p-4 font-mono text-brand-light-muted text-xs">#{order.id.substring(0, 8).toUpperCase()}</td>
                                        <td className="p-4 text-brand-light">{new Date(order.created_at).toLocaleDateString()}</td>
                                        <td className="p-4 text-brand-light">{order.item_count}</td>
                                        <td className="p-4 text-brand-light font-semibold">${order.total_amount?.toFixed(2)}</td>
                                        <td className="p-4"><StatusBadge status={order.status} /></td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link 
                                                    href={`/invoices/${order.id}`}
                                                    className="p-2 text-brand-light-muted hover:text-brand-accent transition-colors" 
                                                    title="View Invoice"
                                                    prefetch={false}
                                                    target="_blank"
                                                >
                                                    <FileText size={16} />
                                                </Link>
                                                {/* --- LINK BARU UNTUK EULA --- */}
                                                <Link 
                                                    href={`/eula/${order.id}`} 
                                                    className="p-2 text-brand-light-muted hover:text-brand-accent transition-colors" 
                                                    title="View EULA"
                                                    prefetch={false}
                                                    target="_blank"
                                                >
                                                    <ShieldCheck size={16} /> 
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}