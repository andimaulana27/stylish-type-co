// src/components/subscription/SubscriptionCard.tsx
import { CheckCircle2, XCircle, Gem } from 'lucide-react';
import Button from '@/components/Button';
import { type Tables } from '@/lib/database.types';

type Plan = Tables<'subscription_plans'>;
type UserSubscription = Tables<'user_subscriptions'> & {
  subscription_plans: Pick<Tables<'subscription_plans'>, 'name' | 'price_monthly' | 'features'> | null;
};

type SubscriptionCardProps = {
  plan: Plan;
  billingCycle: 'monthly' | 'yearly';
  activeSubscription: UserSubscription | null;
  onDowngradeClick: (plan: Plan) => void; // Properti baru untuk handle klik downgrade
};

const SubscriptionCard = ({ plan, billingCycle, activeSubscription, onDowngradeClick }: SubscriptionCardProps) => {
  const isSubscribed = !!activeSubscription;
  const isCurrentPlan = isSubscribed && activeSubscription.subscription_plans?.name === plan.name;
  
  // Memeriksa apakah ini upgrade/downgrade berdasarkan harga bulanan
  const currentPlanPriceMonthly = (activeSubscription?.subscription_plans as Plan)?.price_monthly ?? -1;
  const isUpgrade = isSubscribed && plan.price_monthly > currentPlanPriceMonthly;
  const isDowngrade = isSubscribed && plan.price_monthly < currentPlanPriceMonthly;

  let buttonText = "Subscribe Now";
  let buttonHref = `/checkout?planId=${plan.id}&billing=${billingCycle}`;
  let buttonDisabled = false;
  let buttonVariant: 'primary' | 'outline' = 'primary';
  let actionHandler: (() => void) | null = null;

  if (isCurrentPlan) {
    buttonText = "Your Current Plan";
    buttonDisabled = true;
    buttonVariant = 'outline';
  } else if (isUpgrade) {
    buttonText = "Upgrade Plan";
    const fromPlanId = activeSubscription?.plan_id || '';
    buttonHref = `/checkout?planId=${plan.id}&billing=${billingCycle}&upgradeFrom=${fromPlanId}`;
  } else if (isDowngrade) {
    buttonText = "Downgrade Plan";
    buttonVariant = 'outline';
    actionHandler = () => onDowngradeClick(plan); // Atur action handler untuk downgrade
  }
  
  const cardClasses = `bg-brand-darkest border rounded-lg p-8 md:p-12 h-full flex flex-col 
                       relative overflow-hidden group transition-all duration-300 
                       ${isCurrentPlan 
                         ? 'border-brand-secondary-green shadow-lg shadow-brand-secondary-green/20' 
                         : 'border-brand-accent/50 hover:border-brand-primary-blue/50 hover:-translate-y-1'}`;

  const currentPrice = billingCycle === 'yearly' ? plan.price_yearly / 12 : plan.price_monthly;
  const pricePeriod = '/month';

  const features = (plan.features as { allowed?: string[], not_allowed?: string[] } | null);
  const allowedFeatures = features?.allowed || [];

  const allFeatureNames = [
      "Access to unlimited font", "Standard License", "Web License", "App/Game License", "E-Pub License", 
      "Social Media License", "Productions License", "POD and Template", "Server License", 
      "Broadcast License", "Advertising License", "Trademark License", "Studio License", 
      "Extended License", "Corporate License", "Exclusive License"
  ];

  return (
    <div className={cardClasses}>
      {isCurrentPlan && (
        <div className="absolute top-4 right-4 flex items-center gap-2 bg-brand-secondary-green/20 text-brand-secondary-green text-xs font-semibold px-3 py-1 rounded-full">
          <Gem size={14}/>
          <span>Active</span>
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-brand-primary-blue/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-0"></div>
      <div className="absolute inset-0 shadow-lg shadow-brand-primary-blue/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-0"></div>

      <div className="relative z-10 flex flex-col h-full">
        <div className="mb-10 text-left">
          <h3 className="text-xl font-semibold text-brand-light mb-2">{plan.name}</h3>
          <p className="text-5xl font-bold text-brand-accent">
            ${Math.round(currentPrice)}
            <span className="text-base font-medium text-brand-light-muted">{pricePeriod}</span>
          </p>
          <p className="text-sm text-brand-light-muted mt-4 min-h-[3.5rem]">
            {plan.description}
          </p>
        </div>

        <div className="flex-grow border-t border-white/10 pt-10">
          <ul className="space-y-5 text-sm">
            {allFeatureNames.slice(0, 15).map((featureName, index) => {
              const isIncluded = allowedFeatures.includes(featureName);
              return (
                <li key={index} className="flex items-start gap-3">
                  {isIncluded ? (
                    <CheckCircle2 className="w-4 h-4 text-brand-secondary-green flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-brand-secondary-red/70 flex-shrink-0 mt-0.5" />
                  )}
                  <span className={`${isIncluded ? 'text-brand-light-muted' : 'text-brand-light-muted/50'}`}>
                    {featureName}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="mt-12 flex justify-center">
          {actionHandler ? (
             <button 
                onClick={actionHandler}
                disabled={buttonDisabled}
                className={`w-full px-8 py-3 font-medium rounded-full text-center
                          transition-all duration-300 ease-in-out transform
                          ${buttonVariant === 'primary' ? 'bg-brand-primary-orange text-brand-darkest hover:shadow-lg hover:shadow-brand-primary-orange/40' : 'bg-transparent border-2 border-brand-primary-orange text-brand-light hover:bg-brand-primary-orange/10 hover:shadow-lg hover:shadow-brand-primary-orange/40'}
                          ${buttonDisabled ? 'opacity-60 pointer-events-none' : ''}`}
              >
                  {buttonText}
              </button>
          ) : (
            <Button 
              href={buttonHref} 
              variant={buttonVariant}
              className={`w-full ${buttonDisabled ? 'opacity-60 pointer-events-none' : ''}`}
              aria-disabled={buttonDisabled}
            >
              {buttonText}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionCard;