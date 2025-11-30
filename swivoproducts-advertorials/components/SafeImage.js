'use client';

import { useState } from 'react';

export default function SafeImage({ src, alt, className, style, fallbackSrc }) {
    const [error, setError] = useState(false);

    if (error) {
        if (fallbackSrc) {
            return <img src={fallbackSrc} alt={alt} className={className} style={style} />;
        }
        return null; // Hide if no fallback
    }

    return (
        <img
            src={src}
            alt={alt}
            className={className}
            style={style}
            onError={() => setError(true)}
        />
    );
}
