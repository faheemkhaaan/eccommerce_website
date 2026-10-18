export const FREE_SHIPPING_FROM = 250;
export const SHIPPING_FLAT = 18;
export const TAX_RATE = 0.08;
export const GIFT_PACKAGING_FROM = 1000;

export const money = (n: number) =>
    n.toLocaleString("en-US", { style: "currency", currency: "USD" });

export function summarize(subtotal: number) {
    const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_FROM ? 0 : SHIPPING_FLAT;
    const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
    return { subtotal, shipping, tax, total: subtotal + shipping + tax };
}