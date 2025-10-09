// src/components/subscription/SubscriptionComparisonTable.tsx
import { CheckCircle2, XCircle } from 'lucide-react';

export type ComparisonFeature = {
  feature: string;
  [planName: string]: string[] | string | null;
};

type SubscriptionComparisonTableProps = {
  plans: string[]; 
  features: ComparisonFeature[];
};

const SubscriptionComparisonTable = ({ plans, features }: SubscriptionComparisonTableProps) => {
  const renderCellContent = (content: string[] | null) => {
    if (!content) {
      return <XCircle className="w-6 h-6 text-brand-secondary-red/70 mx-auto" />;
    }

    return (
      <div className="flex flex-col items-center justify-center text-center gap-2 px-2">
        <CheckCircle2 className="w-6 h-6 text-brand-secondary-green flex-shrink-0" />
        <ul className="text-sm leading-snug text-brand-light-muted space-y-1">
          {content.map((detail, index) => (
            <li key={index}>{detail}</li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full w-full border-collapse text-base text-left">
        <thead>
          <tr>
            <th className="px-6 py-4 font-semibold text-brand-light sticky left-0 bg-gradient-to-t from-brand-primary-blue/20 to-transparent whitespace-nowrap">
              Features
            </th>
            {plans.map(planName => (
              <th 
                key={planName} 
                className="px-6 py-4 font-semibold text-brand-light whitespace-nowrap text-center bg-gradient-to-t from-brand-primary-blue/20 to-transparent"
              >
                {planName}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-brand-light-muted">
          {features.map((featureItem) => (
            // --- PERUBAHAN UTAMA DI SINI: Menambahkan kembali border-t ---
            <tr key={featureItem.feature} className="border-t border-white/10">
              <td className="px-6 py-4 font-medium text-brand-light sticky left-0 bg-brand-dark-secondary whitespace-nowrap">
                {featureItem.feature}
              </td>
              {plans.map(planName => (
                <td key={`${featureItem.feature}-${planName}`} className="px-6 py-4 whitespace-nowrap text-center align-top">
                  {renderCellContent(featureItem[planName] as string[] | null)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SubscriptionComparisonTable;