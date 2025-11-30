export const metadata = {
    title: 'Contact Us - Swivo Magazine',
};

export default function ContactUs() {
    return (
        <div className="container" style={{ maxWidth: '800px', padding: '60px 20px' }}>
            <h1 style={{ fontFamily: 'var(--font-family-serif)', fontSize: '2.5rem', marginBottom: '20px' }}>Contact Us</h1>

            <p style={{ fontSize: '1.1rem', color: '#666', marginBottom: '40px' }}>
                Have questions or feedback? We'd love to hear from you.
            </p>

            <div style={{ backgroundColor: '#f8f9fa', padding: '30px', borderRadius: '8px', marginBottom: '30px' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '20px' }}>Get in Touch</h2>

                <p style={{ marginBottom: '15px' }}>
                    <strong>Email:</strong>{' '}
                    <a href="mailto:support@swivomagic.com" style={{ color: 'var(--accent-color)' }}>
                        support@swivomagic.com
                    </a>
                </p>

                <p style={{ marginBottom: '15px' }}>
                    <strong>Address:</strong><br />
                    Vivayogi Private Limited<br />
                    18/4, 2nd floor, Saleh centre<br />
                    Cunningham Crescent Road<br />
                    Vasanth Nagar, 560052<br />
                    Bengaluru KA, India
                </p>
            </div>

            <p style={{ color: '#777', fontSize: '0.95rem' }}>
                We typically respond to all inquiries within 24-48 hours during business days.
            </p>
        </div>
    );
}
