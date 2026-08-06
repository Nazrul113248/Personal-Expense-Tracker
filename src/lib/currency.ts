export const formatCurrency = (amount: number): string => {
  const formatted = new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency: 'BDT',
  }).format(amount);

  // Ensure output is formatted as "৳ 1,500.00"
  return formatted.replace(/BDT[\s\u00A0]?/g, '৳ ');
};
