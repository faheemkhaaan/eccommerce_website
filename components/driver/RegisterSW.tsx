"use client";

import { useEffect } from "react";

/** Registers a driver-scoped service worker so the rider UI can be installed as a PWA. */
export default function RegisterSW() {
    useEffect(() => {
        if (!("serviceWorker" in navigator)) return;
        navigator.serviceWorker.register("/driver/sw", { scope: "/driver" }).catch(() => {
            // Installability still works from the manifest on iOS; a failed SW is not fatal.
        });
    }, []);
    return null;
}
