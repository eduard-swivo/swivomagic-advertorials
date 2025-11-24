import Link from 'next/link';

export default function StickyCTA({ href = "https://swivoproducts.com/pages/swivo-sutra-cleaning-kit" }) {
    return (
        <div className="sticky-cta">
            <div className="sticky-cta-container">
                <a href={href} className="sticky-cta-button">
                    CHECK AVAILABILITY &gt;&gt;
                </a>
            </div>
        </div>
    );
}
