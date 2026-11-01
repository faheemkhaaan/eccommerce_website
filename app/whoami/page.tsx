// app/whoami/page.tsx  (delete after testing)
import { Suspense } from "react";
import { getCurrentUser } from "@/lib/roles";

export default function WhoAmI() {
    return (
        <Suspense>
            <Who />
        </Suspense>
    );
}

async function Who() {
    const user = await getCurrentUser();
    return <pre>{JSON.stringify(user, null, 2)}</pre>;
}