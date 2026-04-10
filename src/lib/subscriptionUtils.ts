export const getSubscriptionExpiration = (duration: 'month' | 'year'): Date => {
  const now = new Date();
  if (duration === 'year') {
    return new Date(now.getFullYear() + 1, 0, 1, 0, 0, 0, 0);
  } else {
    return new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0, 0);
  }
};

export const isSubscriptionExpired = (expiresAt: any): boolean => {
  if (!expiresAt) return false;
  
  let date: Date;
  if (expiresAt?.seconds) {
    date = new Date(expiresAt.seconds * 1000);
  } else if (expiresAt?.toDate) {
    date = expiresAt.toDate();
  } else {
    date = new Date(expiresAt);
  }
  
  return date < new Date();
};

export const convertINRToOtherCurrencies = (inrAmount: number) => {
  return {
    PK: Math.round(inrAmount * 3.3),
    BD: Math.round(inrAmount * 1.3),
    DEFAULT: parseFloat((inrAmount * 0.012).toFixed(2))
  };
};
