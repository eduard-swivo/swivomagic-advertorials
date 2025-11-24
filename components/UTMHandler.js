'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function UTMHandlerContent() {
    const searchParams = useSearchParams();

    useEffect(() => {
        if (!searchParams) return;

        const queryString = searchParams.toString();
        if (!queryString) return;

        // Function to update links
        const updateLinks = () => {
            const links = document.querySelectorAll('a');
            links.forEach(link => {
                // Skip anchor links on same page or javascript: links
                const href = link.getAttribute('href');
                if (!href || href.startsWith('#') || href.startsWith('javascript:')) return;

                try {
                    const url = new URL(link.href);
                    // Append current search params to the link's existing params
                    searchParams.forEach((value, key) => {
                        // Only set if not already present to avoid overwriting specific overrides if any
                        if (!url.searchParams.has(key)) {
                            url.searchParams.set(key, value);
                        }
                    });
                    link.href = url.toString();
                } catch (e) {
                    // Ignore invalid URLs
                }
            });
        };

        // Run immediately
        updateLinks();

        // Also set up a mutation observer to handle dynamically added links (if any)
        const observer = new MutationObserver(updateLinks);
        observer.observe(document.body, { childList: true, subtree: true });

        return () => observer.disconnect();
    }, [searchParams]);

    return null;
}

export default function UTMHandler() {
    return (
        <Suspense fallback={null}>
            <UTMHandlerContent />
        </Suspense>
    );
}
