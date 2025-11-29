import { useState, useEffect } from 'react';

export default function StickyCTA({ href = "https://swivoproducts.com/pages/swivo-sutra-cleaning-kit" }) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            // Calculate scroll percentage
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrollPercent = scrollTop / docHeight;

            // Show if scrolled more than 40%
            if (scrollPercent > 0.4) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', handleScroll);

        // Check initial scroll position
        handleScroll();

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className={`sticky-cta ${isVisible ? 'visible' : ''}`}>
            <div className="sticky-cta-container">
                <a href={href} className="sticky-cta-button">
                    CHECK AVAILABILITY &gt;&gt;
                </a>
            </div>
        </div>
    );
}
