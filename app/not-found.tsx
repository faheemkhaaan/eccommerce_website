import { AnnouncementBar } from "@/components/atelier/announcement-bar";
import { Hero404 } from "@/components/atelier/hero-404";
import { ProductShowcase } from "@/components/atelier/product-showcase";
import { ClientCare } from "@/components/atelier/client-care";
import { SiteFooter } from "@/components/atelier/site-footer";
import Header from "@/components/Header";

/**
 * The design lives on `/` for preview purposes; this wires the identical
 * experience to every unmatched route so real 404s render the same page.
 */
export default function NotFound() {
    return (
        <div className="flex min-h-screen flex-col">
            <AnnouncementBar />
            <Header variant="solid" />
            <main className="flex-1">
                <Hero404 />
                <ProductShowcase />
                <ClientCare />
            </main>
            <SiteFooter />
        </div>
    );
}