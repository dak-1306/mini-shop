// ...new file...
export function formatCurrency(value, locale = "vi-VN", currencySymbol = "₫") {
  const v = Number(value) || 0;
  return (
    new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(v) +
    currencySymbol
  );
}

export default formatCurrency;
