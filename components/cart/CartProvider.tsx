"use client";

import {
    createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState,
    type ReactNode,
} from "react";

export type CartItem = {
    key: string;
    id: string;
    name: string;
    image: string;
    options: string[]; // shown under the name, e.g. ["Size: S", "Oatmeal Beige"]
    price: number;
    qty: number;
};
export type NewItem = Omit<CartItem, "key" | "qty"> & { qty?: number };

type Action =
    | { type: "hydrate"; items: CartItem[] }
    | { type: "add"; item: NewItem }
    | { type: "qty"; key: string; qty: number }
    | { type: "remove"; key: string };

const STORAGE_KEY = "epure-bag-v1";
const MAX_QTY = 9;
const keyOf = (i: { id: string; options: string[] }) => [i.id, ...i.options].join("|");

function reducer(state: CartItem[], a: Action): CartItem[] {
    switch (a.type) {
        case "hydrate":
            return a.items;
        case "add": {
            const key = keyOf(a.item);
            const qty = a.item.qty ?? 1;
            if (state.some((i) => i.key === key)) {
                return state.map((i) => (i.key === key ? { ...i, qty: Math.min(MAX_QTY, i.qty + qty) } : i));
            }
            return [...state, { ...a.item, key, qty: Math.min(MAX_QTY, qty) }];
        }
        case "qty":
            return state.map((i) => (i.key === a.key ? { ...i, qty: Math.max(1, Math.min(MAX_QTY, a.qty)) } : i));
        case "remove":
            return state.filter((i) => i.key !== a.key);
    }
}

type CartContextValue = {
    items: CartItem[];
    count: number;
    subtotal: number;
    isOpen: boolean;
    open: () => void;
    close: () => void;
    add: (item: NewItem) => void;
    setQty: (key: string, qty: number) => void;
    remove: (key: string) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, dispatch] = useReducer(reducer, []);
    const [isOpen, setOpen] = useState(false);
    const [hydrated, setHydrated] = useState(false);

    // Load after mount so server and client markup match
    useEffect(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) dispatch({ type: "hydrate", items: JSON.parse(raw) });
        } catch { }
        setHydrated(true);
    }, []);

    useEffect(() => {
        if (!hydrated) return;
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
        } catch { }
    }, [items, hydrated]);

    const open = useCallback(() => setOpen(true), []);
    const close = useCallback(() => setOpen(false), []);
    const add = useCallback((item: NewItem) => dispatch({ type: "add", item }), []);
    const setQty = useCallback((key: string, qty: number) => dispatch({ type: "qty", key, qty }), []);
    const remove = useCallback((key: string) => dispatch({ type: "remove", key }), []);

    const value = useMemo<CartContextValue>(
        () => ({
            items,
            count: items.reduce((n, i) => n + i.qty, 0),
            subtotal: items.reduce((n, i) => n + i.price * i.qty, 0),
            isOpen, open, close, add, setQty, remove,
        }),
        [items, isOpen, open, close, add, setQty, remove],
    );

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
    return ctx;
}