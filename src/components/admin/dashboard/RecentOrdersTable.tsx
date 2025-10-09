// src/components/admin/dashboard/RecentOrdersTable.tsx
import Link from 'next/link';
import { MoreVertical } from 'lucide-react';

type Order = {
    id: string;
    customer: string;
    created_at: string;
    total_amount: number;
    status: string;
}

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

const RecentOrdersTable = ({ recentOrders }: { recentOrders: Order[] }) => (
  <section className="relative bg-brand-darkest p-6 rounded-lg border border-white/10 overflow-hidden 
                transition-all duration-300 hover:border-brand-accent/50 hover:shadow-lg hover:shadow-brand-accent/10">
    <div className="relative z-10">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-brand-accent">Recent Orders</h3>
        <Link href="/admin/orders" className="text-sm text-brand-accent hover:underline">
          View All
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-white/10 text-brand-light-muted">
            <tr>
              <th className="p-4 font-medium">CUSTOMER</th>
              <th className="p-4 font-medium">DATE</th>
              <th className="p-4 font-medium">TOTAL</th>
              <th className="p-4 font-medium">STATUS</th>
              <th className="p-4 font-medium text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map((order) => (
              <tr key={order.id} className="border-b border-white/10 last:border-b-0 hover:bg-white/5 transition-colors">
                <td className="p-4 text-brand-light font-medium">{order.customer}</td>
                <td className="p-4 text-brand-light-muted">{new Date(order.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                <td className="p-4 text-brand-light">${order.total_amount.toFixed(2)}</td>
                <td className="p-4">
                  <StatusBadge status={order.status} />
                </td>
                <td className="p-4 text-right">
                  <button className="text-brand-light-muted hover:text-brand-accent p-1 rounded-full">
                    <MoreVertical size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </section>
);

export default RecentOrdersTable;