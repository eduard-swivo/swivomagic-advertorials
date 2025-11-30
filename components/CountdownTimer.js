'use client';

import { useState, useEffect } from 'react';

export default function CountdownTimer({ initialMinutes = 20 }) {
    const [timeLeft, setTimeLeft] = useState(initialMinutes * 60); // Convert to seconds

    useEffect(() => {
        // Check if there's a saved end time in localStorage
        const savedEndTime = localStorage.getItem('countdown_end_time');
        const now = Math.floor(Date.now() / 1000);

        if (savedEndTime) {
            const endTime = parseInt(savedEndTime);
            const remaining = endTime - now;

            if (remaining > 0) {
                setTimeLeft(remaining);
            } else {
                // Timer expired, reset it
                const newEndTime = now + (initialMinutes * 60);
                localStorage.setItem('countdown_end_time', newEndTime.toString());
                setTimeLeft(initialMinutes * 60);
            }
        } else {
            // First visit, set the end time
            const newEndTime = now + (initialMinutes * 60);
            localStorage.setItem('countdown_end_time', newEndTime.toString());
        }

        // Update countdown every second
        const timer = setInterval(() => {
            setTimeLeft((prevTime) => {
                if (prevTime <= 1) {
                    // Timer reached zero, reset it
                    const now = Math.floor(Date.now() / 1000);
                    const newEndTime = now + (initialMinutes * 60);
                    localStorage.setItem('countdown_end_time', newEndTime.toString());
                    return initialMinutes * 60;
                }
                return prevTime - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [initialMinutes]);

    // Format time as MM:SS
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="countdown-timer">
            <span className="countdown-time">{formatTime(timeLeft)}</span>
            <style jsx>{`
                .countdown-timer {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%);
                    color: white;
                    padding: 12px 24px;
                    border-radius: 8px;
                    font-weight: 700;
                    font-size: 24px;
                    letter-spacing: 1px;
                    box-shadow: 0 4px 15px rgba(255, 65, 108, 0.3);
                    border: 3px solid #d32f2f;
                    animation: pulse 2s ease-in-out infinite;
                    min-width: 120px;
                }

                .countdown-time {
                    font-family: 'Courier New', monospace;
                    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                }

                @keyframes pulse {
                    0%, 100% {
                        transform: scale(1);
                        box-shadow: 0 4px 15px rgba(255, 65, 108, 0.3);
                    }
                    50% {
                        transform: scale(1.05);
                        box-shadow: 0 6px 20px rgba(255, 65, 108, 0.5);
                    }
                }

                @media (max-width: 768px) {
                    .countdown-timer {
                        font-size: 20px;
                        padding: 10px 20px;
                    }
                }
            `}</style>
        </div>
    );
}
