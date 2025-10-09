// src/app/(admin)/admin/subscription/plans/page.tsx
'use client'; 

import { useState, useTransition, FormEvent, useEffect } from 'react';
import { Tables } from '@/lib/database.types';
import { getSubscriptionPlansAction, updateSubscriptionPlanAction } from '@/app/actions/subscriptionActions';
import toast from 'react-hot-toast';
import { Edit, X, Loader2, PlusCircle, Trash2 } from 'lucide-react';

type Plan = Tables<'subscription_plans'>;

const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center animate-fade-in" onClick={onClose}>
      <div className="bg-brand-darkest border border-white/10 rounded-lg p-6 w-full max-w-2xl shadow-2xl overflow-y-auto max-h-[90vh]" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4 sticky top-0 bg-brand-darkest py-2 z-10">
          <h3 className="text-xl font-semibold text-brand-light">{title}</h3>
          <button onClick={onClose} className="text-brand-light-muted hover:text-white"><X size={24} /></button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};

const BenefitInputGroup = ({ title, benefits, setBenefits }: { title: string, benefits: string[], setBenefits: React.Dispatch<React.SetStateAction<string[]>> }) => {
    const handleBenefitChange = (index: number, value: string) => {
        const newBenefits = [...benefits];
        newBenefits[index] = value;
        setBenefits(newBenefits);
    };
    const addBenefit = () => setBenefits([...benefits, '']);
    const removeBenefit = (index: number) => setBenefits(benefits.filter((_, i) => i !== index));
    const inputStyles = "w-full bg-white/10 border border-transparent rounded-md px-3 py-1.5 text-brand-light placeholder:text-brand-light-muted text-sm transition-colors duration-300 focus:outline-none focus:border-brand-accent";
    return (
        <div className="space-y-2 group">
            <label className="block text-sm font-medium text-brand-light-muted mb-2">{title}</label>
            <div className="space-y-2">{benefits.map((benefit, index) => (<div key={index} className="flex items-center gap-2"><input type="text" value={benefit} onChange={(e) => handleBenefitChange(index, e.target.value)} placeholder="Enter a benefit..." className={inputStyles} /><button type="button" onClick={() => removeBenefit(index)} className="text-red-500 hover:text-red-400 p-1"><Trash2 size={18} /></button></div>))}</div>
            <button type="button" onClick={addBenefit} className="mt-2 flex items-center gap-2 text-sm text-brand-accent hover:text-brand-accent/80 font-semibold"><PlusCircle size={16} />Add Benefit</button>
        </div>
    );
};

const SubscriptionPlanForm = ({ isOpen, onClose, plan, onSuccess }: { isOpen: boolean; onClose: () => void; plan: Plan | null; onSuccess: (plan: Plan) => void; }) => {
    const [isPending, startTransition] = useTransition();
    const [allowed, setAllowed] = useState<string[]>([]);
    const [notAllowed, setNotAllowed] = useState<string[]>([]);

    useEffect(() => {
        if (plan && typeof plan.features === 'object' && plan.features !== null) {
            const features = plan.features as { allowed: string[], not_allowed: string[] };
            setAllowed(features.allowed || []);
            setNotAllowed(features.not_allowed || []);
        }
    }, [plan]);

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!plan) return;
        const formData = new FormData(event.currentTarget);
        allowed.forEach(item => { if(item) formData.append('allowed', item) });
        notAllowed.forEach(item => { if(item) formData.append('not_allowed', item) });
        startTransition(async () => {
            const result = await updateSubscriptionPlanAction(plan.id, formData);
            if (result.error) { toast.error(result.error); } 
            else {
                toast.success(result.success || 'Operation successful!');
                if (result.plan) { onSuccess(result.plan as Plan); }
                onClose();
            }
        });
    };
    
    const inputStyles = "w-full bg-white/5 border border-transparent rounded-md px-4 py-2 text-brand-light placeholder:text-brand-light-muted transition-colors duration-300 focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent hover:border-brand-accent/50";
    const labelStyles = "block text-sm font-medium text-brand-light-muted mb-2 group-hover:text-brand-accent transition-colors";

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={plan ? `Edit "${plan.name}"` : 'Add New Plan'}>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2 group"><label htmlFor="name" className={labelStyles}>Plan Name</label><input type="text" id="name" name="name" defaultValue={plan?.name || ''} required className={inputStyles} /></div>
                <div className="space-y-2 group"><label htmlFor="description" className={labelStyles}>Description</label><textarea id="description" name="description" defaultValue={plan?.description || ''} rows={3} className={`${inputStyles} rounded-lg`} ></textarea></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 group"><label htmlFor="price_monthly" className={labelStyles}>Monthly Price ($)</label><input type="number" id="price_monthly" name="price_monthly" defaultValue={plan?.price_monthly ?? 0} className={inputStyles} step="0.01" /></div>
                    <div className="space-y-2 group"><label htmlFor="price_yearly" className={labelStyles}>Yearly Price ($)</label><input type="number" id="price_yearly" name="price_yearly" defaultValue={plan?.price_yearly ?? 0} className={inputStyles} step="0.01" /></div>
                </div>
                {/* --- PENAMBAHAN INPUT PAYPAL PLAN ID --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-white/10 pt-4">
                    <div className="space-y-2 group"><label htmlFor="paypal_plan_id_monthly" className={labelStyles}>PayPal Plan ID (Monthly)</label><input type="text" id="paypal_plan_id_monthly" name="paypal_plan_id_monthly" defaultValue={plan?.paypal_plan_id_monthly || ''} className={inputStyles} placeholder="P-..." /></div>
                    <div className="space-y-2 group"><label htmlFor="paypal_plan_id_yearly" className={labelStyles}>PayPal Plan ID (Yearly)</label><input type="text" id="paypal_plan_id_yearly" name="paypal_plan_id_yearly" defaultValue={plan?.paypal_plan_id_yearly || ''} className={inputStyles} placeholder="P-..." /></div>
                </div>
                {/* --- AKHIR PENAMBAHAN --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-white/10 pt-4">
                    <BenefitInputGroup title="Allowed" benefits={allowed} setBenefits={setAllowed} />
                    <BenefitInputGroup title="Not Allowed" benefits={notAllowed} setBenefits={setNotAllowed} />
                </div>
                <div className="border-t border-white/10 pt-4 flex justify-end">
                    <button type="submit" disabled={isPending} className="px-6 py-2 bg-brand-accent text-brand-darkest font-semibold rounded-lg flex items-center gap-2">{isPending && <Loader2 className="animate-spin" size={18} />}{isPending ? 'Saving...' : 'Save Plan'}</button>
                </div>
            </form>
        </Modal>
    );
};

export default function ManageSubscriptionPlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  useEffect(() => {
    const fetchPlans = async () => {
        const { plans, error } = await getSubscriptionPlansAction();
        if (error) { toast.error(error); }
        else if (plans) { setPlans(plans as Plan[]); }
        setLoading(false);
    };
    fetchPlans();
  }, []);

  const handleEdit = (plan: Plan) => {
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

  const handleFormSuccess = (updatedPlan: Plan) => {
    setPlans(prevPlans => prevPlans.map(p => p.id === updatedPlan.id ? updatedPlan : p));
    setIsModalOpen(false);
  };

  if (loading) {
    return <div className="animate-pulse p-6 bg-brand-darkest rounded-lg border border-white/10">...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-brand-light">Manage Subscription Plans</h1>
        <p className="text-brand-light-muted">Edit the details, pricing, and features for each subscription plan.</p>
      </div>
      <div className="bg-brand-darkest rounded-lg border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-white/10 text-brand-light-muted">
              <tr>
                <th className="p-4 font-medium">Plan Name</th>
                <th className="p-4 font-medium">Monthly Price</th>
                <th className="p-4 font-medium">Yearly Price</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((plan) => (
                <tr key={plan.id} className="border-b border-white/10 last:border-b-0 hover:bg-white/5">
                  <td className="p-4 font-medium text-brand-light">{plan.name}</td>
                  <td className="p-4 text-brand-light-muted">${plan.price_monthly?.toFixed(2)}</td>
                  <td className="p-4 text-brand-light-muted">${plan.price_yearly?.toFixed(2)}</td>
                  <td className="p-4 text-right">
                    <button onClick={() => handleEdit(plan)} className="flex items-center gap-1.5 text-sm font-semibold text-brand-secondary-gold px-2 py-1 rounded-md transition-all duration-200 hover:bg-white/5">
                        <Edit size={14} /><span>Edit</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {isModalOpen && (
        <SubscriptionPlanForm
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            plan={selectedPlan}
            onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
}