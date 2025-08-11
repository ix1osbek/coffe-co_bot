export const formatHTML = (html: string) => {
  return html
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
};

export const formatCurrency = (amount: number) => {
  return amount.toLocaleString("uz-UZ", {
    style: "currency",
    currency: "UZS",
  });
};
