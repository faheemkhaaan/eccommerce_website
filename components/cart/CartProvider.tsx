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
    | { type: "remove"; key: string }
    | { type: "clear" };

const STORAGE_KEY = "epure-bag-v1";
const MAX_QTY = 9;
const keyOf = (i: { id: string; options: string[] }) => [i.id, ...i.options].join("|");

type State = { items: CartItem[]; hydrated: boolean };

function reducer(state: State, a: Action): State {
    const { items } = state;
    switch (a.type) {
        case "hydrate":
            return { items: a.items, hydrated: true };
        case "add": {
            const key = keyOf(a.item);
            const qty = a.item.qty ?? 1;
            if (items.some((i) => i.key === key)) {
                return { ...state, items: items.map((i) => (i.key === key ? { ...i, qty: Math.min(MAX_QTY, i.qty + qty) } : i)) };
            }
            return { ...state, items: [...items, { ...a.item, key, qty: Math.min(MAX_QTY, qty) }] };
        }
        case "qty":
            return { ...state, items: items.map((i) => (i.key === a.key ? { ...i, qty: Math.max(1, Math.min(MAX_QTY, a.qty)) } : i)) };
        case "remove":
            return { ...state, items: items.filter((i) => i.key !== a.key) };
        case "clear":
            return { ...state, items: [] };
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
    clear: () => void;
    hydrated: boolean;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
    const [{ items, hydrated }, dispatch] = useReducer(reducer, { items: [], hydrated: false });
    const [isOpen, setOpen] = useState(false);

    // Load after mount so server and client markup match
    useEffect(() => {
        let stored: CartItem[] = [];
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) stored = JSON.parse(raw);
        } catch { }
        dispatch({ type: "hydrate", items: stored });
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
    const clear = useCallback(() => dispatch({ type: "clear" }), []);

    const value = useMemo<CartContextValue>(
        () => ({
            items,
            count: items.reduce((n, i) => n + i.qty, 0),
            subtotal: items.reduce((n, i) => n + i.price * i.qty, 0),
            isOpen, open, close, add, setQty, remove, clear, hydrated,
        }),
        [items, isOpen, open, close, add, setQty, remove, clear, hydrated],
    );

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
    return ctx;
}