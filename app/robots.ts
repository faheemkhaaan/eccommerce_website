import type { MetadataRoute } from "next";
import { absolute } from "@/lib/seo";

/**
 * Crawlers are welcome on the storefront and kept out of the account, checkout
 * and staff surfaces — none of which render anything useful without a session,
 * and all of which would leak a redirect chain into the index.
 */
export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: ["/admin", "/driver", "/account", "/checkout", "/login", "/register", "/auth"],
            },
        ],
        sitemap: absolute("/sitemap.xml"),
    };
}
