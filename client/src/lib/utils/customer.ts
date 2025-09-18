// Customer utility functions
export const formatCurrency = (amount: string | number | null): string => {
  if (amount === null || amount === undefined) return '$0.00';
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(isNaN(numAmount) ? 0 : numAmount);
};

export const formatPhoneNumber = (phone: string | null): string => {
  if (!phone) return 'N/A';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
};

export const getCustomerTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    individual: 'Individual',
    professional_contractor: 'Professional Contractor',
    industrial_account: 'Industrial Account',
    government_municipal: 'Government/Municipal',
    educational_institution: 'Educational Institution'
  };
  return labels[type] || type;
};

export const formatCustomerType = getCustomerTypeLabel;

export const getCustomerTypeColor = (type: string): string => {
  const colors: Record<string, string> = {
    individual: 'text-blue-600 bg-blue-100',
    professional_contractor: 'text-green-600 bg-green-100',
    industrial_account: 'text-purple-600 bg-purple-100',
    government_municipal: 'text-amber-600 bg-amber-100',
    educational_institution: 'text-indigo-600 bg-indigo-100'
  };
  return colors[type] || 'text-gray-600 bg-gray-100';
};

export const getCustomerIcon = (type: string): any => {
  // This would need to be implemented with proper icon components
  return null;
};

export const formatAddress = (address: any): string => {
  if (!address || typeof address !== 'object') return 'No address provided';
  const { street, city, state, zipCode } = address;
  const parts = [street, city, state, zipCode].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : 'No address provided';
};
