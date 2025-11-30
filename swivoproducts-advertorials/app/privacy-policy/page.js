export const metadata = {
    title: 'Privacy Policy - Swivo Magazine',
};

export default function PrivacyPolicy() {
    return (
        <div className="container" style={{ maxWidth: '900px', padding: '60px 20px' }}>
            <h1 style={{ fontFamily: 'var(--font-family-serif)', fontSize: '2.5rem', marginBottom: '20px' }}>Privacy Policy</h1>

            <p style={{ color: '#666', marginBottom: '40px' }}>
                <strong>Last Updated:</strong> {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>

            <div style={{ lineHeight: '1.8' }}>
                <h2 style={{ fontSize: '1.5rem', marginTop: '30px', marginBottom: '15px' }}>1. Information We Collect</h2>
                <p style={{ marginBottom: '20px' }}>
                    We may collect information that you provide directly to us, including your name, email address,
                    and any other information you choose to provide when contacting us or interacting with our content.
                </p>

                <h2 style={{ fontSize: '1.5rem', marginTop: '30px', marginBottom: '15px' }}>2. How We Use Your Information</h2>
                <p style={{ marginBottom: '20px' }}>
                    We use the information we collect to:
                </p>
                <ul style={{ marginBottom: '20px', paddingLeft: '20px' }}>
                    <li>Respond to your inquiries and provide customer support</li>
                    <li>Send you updates about our content and products</li>
                    <li>Improve our website and user experience</li>
                    <li>Comply with legal obligations</li>
                </ul>

                <h2 style={{ fontSize: '1.5rem', marginTop: '30px', marginBottom: '15px' }}>3. Cookies and Tracking</h2>
                <p style={{ marginBottom: '20px' }}>
                    We may use cookies and similar tracking technologies to track activity on our website and hold certain information.
                    You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
                </p>

                <h2 style={{ fontSize: '1.5rem', marginTop: '30px', marginBottom: '15px' }}>4. Third-Party Links</h2>
                <p style={{ marginBottom: '20px' }}>
                    Our website may contain links to third-party websites. We are not responsible for the privacy practices
                    or content of these external sites.
                </p>

                <h2 style={{ fontSize: '1.5rem', marginTop: '30px', marginBottom: '15px' }}>5. Data Security</h2>
                <p style={{ marginBottom: '20px' }}>
                    We implement appropriate technical and organizational measures to protect your personal information.
                    However, no method of transmission over the Internet is 100% secure.
                </p>

                <h2 style={{ fontSize: '1.5rem', marginTop: '30px', marginBottom: '15px' }}>6. Your Rights</h2>
                <p style={{ marginBottom: '20px' }}>
                    You have the right to access, update, or delete your personal information. To exercise these rights,
                    please contact us at support@swivomagic.com.
                </p>

                <h2 style={{ fontSize: '1.5rem', marginTop: '30px', marginBottom: '15px' }}>7. Changes to This Policy</h2>
                <p style={{ marginBottom: '20px' }}>
                    We may update this privacy policy from time to time. We will notify you of any changes by posting
                    the new policy on this page.
                </p>

                <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px', marginTop: '40px' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>Contact Us</h2>
                    <p>
                        If you have any questions about this Privacy Policy, please contact us:<br />
                        <strong>Email:</strong> <a href="mailto:support@swivomagic.com" style={{ color: 'var(--accent-color)' }}>support@swivomagic.com</a><br />
                        <strong>Address:</strong> Vivayogi Private Limited, 18/4, 2nd floor, Saleh centre,
                        Cunningham Crescent Road, Vasanth Nagar, 560052 Bengaluru KA, India
                    </p>
                </div>
            </div>
        </div>
    );
}
