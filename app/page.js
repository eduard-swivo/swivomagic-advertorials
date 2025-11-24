import Link from 'next/link';

export default function Home() {
    return (
        <div className="container" style={{ textAlign: 'center', paddingTop: '50px' }}>
            <h1>Swivo Magic Advertorials</h1>
            <p>Select a story to preview:</p>
            <ul style={{ listStyle: 'none', padding: 0, marginTop: '30px' }}>
                <li style={{ marginBottom: '20px' }}>
                    <Link href="/the-smart-switch" style={{ fontSize: '1.5rem', color: '#0070f3', textDecoration: 'underline' }}>
                        The Smart Switch
                    </Link>
                </li>
                <li style={{ marginBottom: '20px' }}>
                    <Link href="/the-protector" style={{ fontSize: '1.5rem', color: '#0070f3', textDecoration: 'underline' }}>
                        The Protector
                    </Link>
                </li>
                <li style={{ marginBottom: '20px' }}>
                    <Link href="/story-health" style={{ fontSize: '1.5rem', color: '#0070f3', textDecoration: 'underline' }}>
                        Story: Health
                    </Link>
                </li>
            </ul>
        </div>
    );
}
