// src/components/SideCartClient.tsx
'use client';

import { useUI, CartItem } from "@/context/UIContext";
import { ReactNode } from "react";

type UIProviderClientProps = {
    children: (cart: CartItem[], closeCartSidebar: () => void) => ReactNode;
}

export const UIProviderClient = ({ children }: UIProviderClientProps) => {
    const { cart, closeCartSidebar } = useUI();
    return <>{children(cart, closeCartSidebar)}</>;
}