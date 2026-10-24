// Delivery is charged in rupees and, like everything else here, collected in cash
// on delivery — there is no card payment and no sales tax line on a COD order.

export const FREE_DELIVERY_FROM = 5000;
export const DELIVERY_FLAT = 250;

export const money = (n: number) => `Rs ${Math.round(n).toLocaleString("en-US")}`;

export function summarize(subtotal: number) {
    const shipping = subtotal === 0 || subtotal >= FREE_DELIVERY_FROM ? 0 : DELIVERY_FLAT;
    return { subtotal, shipping, total: subtotal + shipping };
}
