import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

interface CheckoutData {
  // Step 1: Shipping Information
  moveInDate: Date;
  email: string;
  shipping: {
    firstName: string;
    lastName: string;
    phone: string;
    address: string;
    city: string;
    province: string;
    postalCode: string;
    saveToAccount: boolean;
  };
  
  // Step 2: Payment Information
  payment: {
    method: string;
    cardNumber: string;
    expiry: string;
    cvc: string;
    cardName: string;
    sameAsShipping: boolean;
    billingAddress?: {
      firstName: string;
      lastName: string;
      address: string;
      city: string;
      province: string;
      postalCode: string;
    };
  };
}

interface CheckoutContextType {
  checkoutData: CheckoutData;
  updateShipping: (data: Partial<CheckoutData['shipping']>) => void;
  updatePayment: (data: Partial<CheckoutData['payment']>) => void;
  updateMoveInDate: (date: Date) => void;
  updateEmail: (email: string) => void;
  resetCheckout: () => void;
}

const CheckoutContext = createContext<CheckoutContextType | undefined>(undefined);

const initialCheckoutData: CheckoutData = {
  moveInDate: new Date(),
  email: "",
  shipping: {
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    city: "",
    province: "",
    postalCode: "",
    saveToAccount: false
  },
  payment: {
    method: "paypal",
    cardNumber: "",
    expiry: "",
    cvc: "",
    cardName: "",
    sameAsShipping: true
  }
};

export function CheckoutProvider({ children }: { children: ReactNode }) {
  const [checkoutData, setCheckoutData] = useState<CheckoutData>(initialCheckoutData);

  const updateShipping = (data: Partial<CheckoutData['shipping']>) => {
    setCheckoutData(prev => ({
      ...prev,
      shipping: { ...prev.shipping, ...data }
    }));
  };

  const updatePayment = (data: Partial<CheckoutData['payment']>) => {
    setCheckoutData(prev => ({
      ...prev,
      payment: { ...prev.payment, ...data }
    }));
  };

  const updateMoveInDate = (date: Date) => {
    setCheckoutData(prev => ({
      ...prev,
      moveInDate: date
    }));
  };

  const updateEmail = (email: string) => {
    setCheckoutData(prev => ({
      ...prev,
      email
    }));
  };

  const resetCheckout = useCallback(() => {
    setCheckoutData(initialCheckoutData);
  }, []);

  return (
    <CheckoutContext.Provider
      value={{
        checkoutData,
        updateShipping,
        updatePayment,
        updateMoveInDate,
        updateEmail,
        resetCheckout
      }}
    >
      {children}
    </CheckoutContext.Provider>
  );
}

export function useCheckout() {
  const context = useContext(CheckoutContext);
  if (context === undefined) {
    throw new Error('useCheckout must be used within a CheckoutProvider');
  }
  return context;
} 