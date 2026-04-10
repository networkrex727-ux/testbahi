import { useState, useEffect } from 'react';
import { PLANS as DEFAULT_PLANS, PAYMENT_METHODS as DEFAULT_PAYMENT_METHODS } from '../constants';
import api from '../services/api';

export interface Plan {
  id: string;
  name: string;
  description: string;
  prices: {
    [key: string]: {
      amount: number;
      currency: string;
      symbol: string;
      duration: 'month' | 'year';
    };
  };
  benefits: string[];
}

export interface PaymentMethod {
  method: string;
  details: string;
  name: string;
  instruction: string;
}

export interface PaymentProvider {
  id: string;
  name: string;
  recipientName: string;
  upiId: string;
  currency: string;
  enabled: boolean;
}

export const usePlans = () => {
  const [plans, setPlans] = useState<Plan[]>(DEFAULT_PLANS as Plan[]);
  const [paymentMethods, setPaymentMethods] = useState<{ [key: string]: PaymentMethod }>(DEFAULT_PAYMENT_METHODS as { [key: string]: PaymentMethod });
  const [paymentProviders, setPaymentProviders] = useState<PaymentProvider[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get('/settings/public');
        const data = response.data;
        
        if (data.plans) {
          try {
            setPlans(JSON.parse(data.plans));
          } catch (e) {
            console.error("Failed to parse plans from DB", e);
          }
        }
        
        if (data.paymentMethods) {
          try {
            setPaymentMethods(JSON.parse(data.paymentMethods));
          } catch (e) {
            console.error("Failed to parse payment methods from DB", e);
          }
        }

        if (data.paymentProviders) {
          try {
            setPaymentProviders(JSON.parse(data.paymentProviders));
          } catch (e) {
            console.error("Failed to parse payment providers from DB", e);
          }
        }
      } catch (error) {
        console.warn('Failed to fetch settings from DB, using defaults');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const updatePlan = async (plan: Plan) => {
    const newPlans = plans.map(p => p.id === plan.id ? plan : p);
    setPlans(newPlans);
    try {
      await api.post('/admin/settings', { plans: JSON.stringify(newPlans) });
    } catch (e) {
      console.error("Failed to save plans to DB", e);
      throw e;
    }
  };

  const updatePaymentMethod = async (key: string, method: PaymentMethod) => {
    const newMethods = { ...paymentMethods, [key]: method };
    setPaymentMethods(newMethods);
    try {
      await api.post('/admin/settings', { paymentMethods: JSON.stringify(newMethods) });
    } catch (e) {
      console.error("Failed to save payment methods to DB", e);
      throw e;
    }
  };

  const updatePaymentProviders = async (providers: PaymentProvider[]) => {
    setPaymentProviders(providers);
    try {
      await api.post('/admin/settings', { paymentProviders: JSON.stringify(providers) });
    } catch (e) {
      console.error("Failed to save payment providers to DB", e);
      throw e;
    }
  };

  return { plans, paymentMethods, paymentProviders, loading, updatePlan, updatePaymentMethod, updatePaymentProviders };
};
