export function createQuotationNumber() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const randomPart = Math.floor(1000 + Math.random() * 9000);

  return `ZEN-QUO-${year}${month}-${randomPart}`;
}