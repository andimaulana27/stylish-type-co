// src/components/font-detail/LicenseSelector.tsx
'use client';

import { useState, useEffect, useTransition } from 'react';
import type { ProductData } from '@/lib/dummy-data';
import { Check, CheckCircle2, XCircle, Minus, Plus, Library, ShoppingCart, Loader2, Crown } from 'lucide-react';
import toast from 'react-hot-toast';
import { Tables } from '@/lib/database.types';
import { useUI } from '@/context/UIContext';
import { useAuth } from '@/context/AuthContext';
import { addFontToLibraryAction } from '@/app/actions/userActions';

type License = Tables<'licenses'>;

interface LicenseSelectorProps {
  font: ProductData;
  licenses: License[];
}

const normalizeForComparison = (str: string) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/license/g, '')
    .replace(/[^a-z0-9]/g, '');
};

export default function LicenseSelector({ font, licenses }: LicenseSelectorProps) {
  const { addToCart } = useUI();
  const { activeSubscription } = useAuth();
  const [isPending, startTransition] = useTransition();
  
  const licensesToExcludeForBundles = ['trademark', 'studio', 'extended', 'corporate', 'exclusive'];
  const filteredLicenses = font.type === 'bundle'
    ? licenses.filter(l => !licensesToExcludeForBundles.includes(l.name.toLowerCase()))
    : licenses;
  const sortedLicenses = [...filteredLicenses].sort((a, b) => a.name.toLowerCase() === 'standard' ? -1 : b.name.toLowerCase() === 'standard' ? 1 : 0);
  const defaultLicense = sortedLicenses.find(l => l.name.toLowerCase() === 'standard') || sortedLicenses[0] || null;

  const [selectedLicense, setSelectedLicense] = useState<License | null>(defaultLicense);
  const [userCount, setUserCount] = useState(1);
  const [totalPrice, setTotalPrice] = useState(0);
  const [originalTotalPrice, setOriginalTotalPrice] = useState<number | null>(null);

  const allowedFeatures = (activeSubscription?.subscription_plans?.features as { allowed?: string[] })?.allowed;

  const isLicenseCoveredBySub = activeSubscription && selectedLicense &&
    font.type === 'font' &&
    allowedFeatures?.some(allowedFeature => {
      const normalizedAllowed = normalizeForComparison(allowedFeature);
      const normalizedLicense = normalizeForComparison(selectedLicense.name);
      return normalizedAllowed.includes(normalizedLicense) || normalizedLicense.includes(normalizedAllowed);
    });

  useEffect(() => {
    if (!selectedLicense) {
        setTotalPrice(0);
        setOriginalTotalPrice(null);
        return;
    };
    
    if (isLicenseCoveredBySub) {
      setTotalPrice(0);
      setOriginalTotalPrice(null);
      return;
    }

    let basePrice = 0;
    if (selectedLicense.name.toLowerCase() === 'standard') {
        basePrice = font.originalPrice ?? font.price;
    } else {
        basePrice = (font.type === 'bundle' ? selectedLicense.bundle_price : selectedLicense.font_price) || 0;
    }
    
    const isUserCountDisabled = selectedLicense.name.toLowerCase() === 'corporate' || selectedLicense.name.toLowerCase() === 'exclusive';
    const currentCount = isUserCountDisabled ? 1 : userCount;
    if(isUserCountDisabled) setUserCount(1);
    
    const calculatedOriginalPrice = basePrice * currentCount;
    
    if (font.discount && font.originalPrice) {
        const discountPercentage = parseFloat(font.discount.replace('% OFF', ''));
        const discountedPrice = calculatedOriginalPrice - (calculatedOriginalPrice * discountPercentage / 100);
        setTotalPrice(discountedPrice);
        setOriginalTotalPrice(calculatedOriginalPrice);
    } else {
        setTotalPrice(calculatedOriginalPrice);
        setOriginalTotalPrice(null);
    }

  }, [selectedLicense, userCount, font, isLicenseCoveredBySub]);
  
  const handleAddToCart = () => {
    if (!selectedLicense) {
        toast.error("Please select a license.");
        return;
    }
    
    const cartItem = {
      id: `${font.id}-${selectedLicense.id}`,
      productId: font.id,
      name: font.name,
      slug: font.slug, // <-- PERBAIKAN DI SINI
      imageUrl: font.imageUrl,
      price: totalPrice,
      originalPrice: originalTotalPrice ?? undefined,
      license: { id: selectedLicense.id, name: selectedLicense.name },
      type: font.type,
      quantity: userCount,
    };
    
    addToCart(cartItem);
  };

  const handleAddToLibrary = () => {
    if (!selectedLicense) {
      toast.error("Please select a license.");
      return;
    }
    startTransition(async () => {
      if (font.type !== 'font') {
        toast.error("Subscription benefits are only for individual fonts.");
        return;
      }
      const result = await addFontToLibraryAction(font.id, selectedLicense.id, font.type);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(result.success || 'Product added to your library!');
      }
    });
  };

  const finalActionHandler = isLicenseCoveredBySub ? handleAddToLibrary : handleAddToCart;
  const buttonText = isLicenseCoveredBySub ? 'Add to Library' : 'Add to Cart';
  const ButtonIcon = isLicenseCoveredBySub ? Library : ShoppingCart;

  const LicenseOption = ({ license }: { license: License }) => {
    const isActive = selectedLicense?.id === license.id;
    const isUserCountDisabled = license.name.toLowerCase() === 'corporate' || license.name.toLowerCase() === 'exclusive';
    
    const isCoveredBySubscription = activeSubscription &&
      font.type === 'font' &&
      allowedFeatures?.some(allowedFeature => {
        const normalizedAllowed = normalizeForComparison(allowedFeature);
        const normalizedLicense = normalizeForComparison(license.name);
        return normalizedAllowed.includes(normalizedLicense) || normalizedLicense.includes(normalizedAllowed);
      });

    let displayPrice = 0;
    let originalDisplayPrice: number | null = null;
    
    const basePrice = license.name.toLowerCase() === 'standard'
      ? (font.originalPrice ?? font.price)
      : (font.type === 'bundle' ? license.bundle_price : license.font_price) || 0;

    if (font.discount && font.originalPrice) {
        const discountPercentage = parseFloat(font.discount.replace('% OFF', ''));
        displayPrice = basePrice - (basePrice * discountPercentage / 100);
        originalDisplayPrice = basePrice;
    } else {
        displayPrice = basePrice;
    }

    const handleUserChange = (e: React.MouseEvent<HTMLButtonElement>, amount: number) => {
        e.stopPropagation();
        if (isActive) {
            setUserCount(prev => Math.max(1, prev + amount));
        } else {
            setSelectedLicense(license);
            setUserCount(1);
        }
    }
    
    const activeClasses = isActive 
      ? 'bg-gradient-to-t from-brand-primary-blue/20 to-transparent border-brand-primary-blue' 
      : 'border-brand-accent/50 hover:bg-brand-accent/5';

    return (
      <div onClick={() => { setSelectedLicense(license); if(isUserCountDisabled) setUserCount(1); }} className={`border rounded-lg p-4 cursor-pointer transition-all duration-300 ${activeClasses}`}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-5 h-5 border-2 rounded-full flex-shrink-0 mt-0.5 flex items-center justify-center transition-all duration-200 ${isActive ? 'border-brand-accent bg-brand-accent' : 'border-brand-accent'}`}>
              {isActive && <Check size={12} className="text-white" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-base text-brand-light">{license.name}</span>
                {isCoveredBySubscription && (
                  <div className="flex items-center gap-1.5 bg-brand-secondary-green/20 text-brand-secondary-green border border-brand-secondary-green/50 text-xs font-semibold px-2 py-0.5 rounded-md">
                    <Crown size={12} />
                    <span>Included</span>
                  </div>
                )}
              </div>
              <p className="text-sm text-brand-light-muted mt-1">{license.description}</p>
            </div>
          </div>
          <div className="font-medium text-right flex-shrink-0 ml-2">
            {isCoveredBySubscription ? (
                <span className="text-base font-semibold text-brand-secondary-green opacity-0">Included</span>
            ) : (
                <div className="flex flex-col items-end">
                    <span className={`text-base font-semibold ${isActive ? 'text-brand-accent' : 'text-white'}`}>${displayPrice.toFixed(2)}</span>
                    {originalDisplayPrice && <span className="text-sm text-brand-light-muted line-through">${originalDisplayPrice.toFixed(2)}</span>}
                </div>
            )}
          </div>
        </div>
        {isActive && (
          <div className="pt-4 mt-4 space-y-4">
            {license.allowed && license.allowed.length > 0 && (
              <div className="border-t border-white/10 pt-4">
                <h4 className="font-semibold text-brand-light mb-2 text-sm">Allowed:</h4>
                <ul className="space-y-2 text-sm">
                  {license.allowed.map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-brand-secondary-green flex-shrink-0 mt-0.5" />
                      <span className="text-brand-light-muted leading-tight">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {license.not_allowed && license.not_allowed.length > 0 && (
              <div className="border-t border-white/10 pt-4">
                <h4 className="font-semibold text-brand-light mb-2 text-sm">Not Allowed:</h4>
                <ul className="space-y-2 text-sm">
                  {license.not_allowed.map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <XCircle className="w-4 h-4 text-red-500/80 flex-shrink-0 mt-0.5" />
                      <span className="text-brand-light-muted leading-tight">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {!isUserCountDisabled && !isCoveredBySubscription && (
              <div className="flex justify-between items-center border-t border-white/10 mt-4 pt-4">
                <span className="font-semibold text-brand-light">Number of Items:</span>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={(e) => handleUserChange(e, -1)} className="w-8 h-8 flex items-center justify-center bg-brand-dark-secondary text-brand-light rounded-full hover:bg-brand-accent hover:text-brand-darkest transition-colors"><Minus size={16} /></button>
                  <span className="font-bold text-brand-light text-lg w-8 text-center">{userCount}</span>
                  <button type="button" onClick={(e) => handleUserChange(e, 1)} className="w-8 h-8 flex items-center justify-center bg-brand-dark-secondary text-brand-light rounded-full hover:bg-brand-accent hover:text-brand-darkest transition-colors"><Plus size={16} /></button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  if (!licenses || licenses.length === 0) return <div><p className="text-brand-light-muted text-center">No licenses available for this product.</p></div>;

  return (
    <div>
      <h2 className="text-2xl font-semibold text-brand-light mb-4">Choose Your License</h2>
      <div className="space-y-3">
        {sortedLicenses.map(license => (
          <LicenseOption key={license.id} license={license} />
        ))}
      </div>
      
      <div className="border-t border-white/10 pt-4 mt-6">
        {isLicenseCoveredBySub ? (
          <div className="bg-brand-secondary-green/10 border border-brand-secondary-green/50 rounded-lg p-4 text-center">
            <div className="flex justify-center items-center gap-2">
                <Crown size={18} className="text-brand-secondary-green" />
                <h4 className="font-semibold text-brand-secondary-green">Included in Your Plan</h4>
            </div>
            <p className="text-xs text-brand-light-muted mt-1">This license is free with your active subscription.</p>
          </div>
        ) : (
          <div className="flex justify-between items-center text-xl font-medium">
            <span>Total</span>
            <div className='flex items-center gap-3'>
                {originalTotalPrice && <span className="text-lg text-brand-light-muted line-through">${originalTotalPrice.toFixed(2)}</span>}
                <span className="text-2xl font-bold text-brand-accent">${totalPrice.toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>

      <button 
        onClick={finalActionHandler} 
        disabled={isPending}
        className="w-full mt-6 px-8 py-4 font-medium rounded-full text-center bg-brand-accent text-brand-darkest transition-all duration-300 ease-in-out hover:brightness-110 hover:shadow-lg hover:shadow-brand-accent/30 disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {isPending ? <Loader2 className="animate-spin"/> : <ButtonIcon size={20} />}
        {isPending ? 'Processing...' : buttonText}
      </button>
    </div>
  );
};