"use client";

import { motion } from "framer-motion";
import { useCart } from "./CartProvider";
import { BagIcon } from "../Icons";

export default function BagButton({ badgeClass }: { badgeClass: string }) {
    const { count, open } = useCart();
    return (
        <button
            type="button"
            onClick={open}
            aria-label={`Open bag, ${count} item${count === 1 ? "" : "s"}`}
            className="relative"
        >
            <BagIcon />
            {count > 0 && (
                <motion.span
                    key={count}
                    initial={{ scale: 0.6 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 18 }}
                    className={badgeClass}
                >
                    {count}
                </motion.span>
            )}
        </button>
    );
}