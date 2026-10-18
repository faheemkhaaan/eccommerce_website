"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";

export const inputCls =
    "w-full rounded-md bg-sand px-4 py-3.5 text-sm outline-none transition placeholder:text-muted/60 focus:bg-white focus:ring-1 focus:ring-ink aria-[invalid=true]:ring-1 aria-[invalid=true]:ring-[#b4372b]";

type Props = {
    id: string;            // id of the control; the error text uses `${id}-error`
    label: string;
    required?: boolean;
    group?: boolean;       // true when the control is a group (radio set), not a single input
    hint?: ReactNode;
    error?: string;
    children: ReactNode;
};

export default function Field({ id, label, required, group, hint, error, children }: Props) {
    const labelCls = "label-sm text-[10px] tracking-[0.14em]";
    return (
        <div>
            <div className="mb-2.5 flex items-center justify-between gap-3">
                {group ? (
                    <span id={`${id}-label`} className={labelCls}>{label}</span>
                ) : (
                    <label htmlFor={id} className={labelCls}>
                        {label}
                        {required && <span aria-hidden className="ml-1 text-[#b4372b]">*</span>}
                    </label>
                )}
                {hint && <span className="text-right text-[11px] text-muted">{hint}</span>}
            </div>

            {children}

            <AnimatePresence initial={false}>
                {error && (
                    <motion.p
                        id={`${id}-error`}
                        role="alert"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden pt-1.5 text-xs text-[#b4372b]"
                    >
                        {error}
                    </motion.p>
                )}
            </AnimatePresence>
        </div>
    );
}