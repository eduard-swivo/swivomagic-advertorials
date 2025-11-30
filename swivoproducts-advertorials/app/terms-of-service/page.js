export const metadata = {
    title: 'Terms of Service - Swivo Magazine',
};

export default function TermsOfService() {
    return (
        <div className="container" style={{ maxWidth: '900px', padding: '60px 20px' }}>
            <h1 style={{ fontFamily: 'var(--font-family-serif)', fontSize: '2.5rem', marginBottom: '20px' }}>Terms of Service</h1>

            <p style={{ color: '#666', marginBottom: '40px' }}>
                <strong>Last Updated:</strong> {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>

            <div style={{ lineHeight: '1.8' }}>
                <p style={{ marginBottom: '20px' }}>
                    Welcome to Swivo Magazine. By accessing and using this website, you agree to be bound by these Terms of Service.
                </p>

                <h2 style={{ fontSize: '1.5rem', marginTop: '30px', marginBottom: '15px' }}>1. Acceptance of Terms</h2>
                <p style={{ marginBottom: '20px' }}>
                    By accessing this website, you accept these terms and conditions in full. If you disagree with any part
                    of these terms, you must not use our website.
                </p>

                <h2 style={{ fontSize: '1.5rem', marginTop: '30px', marginBottom: '15px' }}>2. Intellectual Property</h2>
                <p style={{ marginBottom: '20px' }}>
                    The content on this website, including text, graphics, logos, and images, is the property of
                    Vivayogi Private Limited and is protected by copyright and other intellectual property laws.
                </p>

                <h2 style={{ fontSize: '1.5rem', marginTop: '30px', marginBottom: '15px' }}>3. User Conduct</h2>
                <p style={{ marginBottom: '20px' }}>
                    You agree not to:
                </p>
                <ul style={{ marginBottom: '20px', paddingLeft: '20px' }}>
                    <li>Use the website in any way that is unlawful or fraudulent</li>
                    <li>Transmit any harmful code or interfere with the website's operation</li>
                    <li>Attempt to gain unauthorized access to any part of the website</li>
                    <li>Reproduce, duplicate, or copy material from the website without permission</li>
                </ul>

                <h2 style={{ fontSize: '1.5rem', marginTop: '30px', marginBottom: '15px' }}>4. Disclaimers</h2>
                <p style={{ marginBottom: '20px' }}>
                    The content on this website is provided for informational purposes only. We make no representations
                    or warranties about the accuracy, reliability, or completeness of any information on this site.
                </p>
                <p style={{ marginBottom: '20px' }}>
                    This site may contain advertorials and sponsored content. Product recommendations are based on
                    editorial review, but we may receive compensation for purchases made through our links.
                </p>

                <h2 style={{ fontSize: '1.5rem', marginTop: '30px', marginBottom: '15px' }}>5. Limitation of Liability</h2>
                <p style={{ marginBottom: '20px' }}>
                    To the fullest extent permitted by law, Vivayogi Private Limited shall not be liable for any
                    indirect, incidental, special, or consequential damages arising from your use of this website.
                </p>

                <h2 style={{ fontSize: '1.5rem', marginTop: '30px', marginBottom: '15px' }}>6. External Links</h2>
                <p style={{ marginBottom: '20px' }}>
                    Our website may contain links to third-party websites. We are not responsible for the content
                    or practices of these external sites.
                </p>

                <h2 style={{ fontSize: '1.5rem', marginTop: '30px', marginBottom: '15px' }}>7. Modifications</h2>
                <p style={{ marginBottom: '20px' }}>
                    We reserve the right to modify these terms at any time. Your continued use of the website after
                    changes constitutes acceptance of the modified terms.
                </p>

                <h2 style={{ fontSize: '1.5rem', marginTop: '30px', marginBottom: '15px' }}>8. Governing Law</h2>
                <p style={{ marginBottom: '20px' }}>
                    These terms shall be governed by and construed in accordance with the laws of India.
                    Any disputes shall be subject to the exclusive jurisdiction of the courts in Bengaluru, Karnataka.
                </p>

                <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px', marginTop: '40px' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>Contact Information</h2>
                    <p>
                        For questions about these Terms of Service, please contact:<br />
                        <strong>Vivayogi Private Limited</strong><br />
                        Email: <a href="mailto:support@swivomagic.com" style={{ color: 'var(--accent-color)' }}>support@swivomagic.com</a><br />
                        Address: 18/4, 2nd floor, Saleh centre, Cunningham Crescent Road,
                        Vasanth Nagar, 560052 Bengaluru KA, India
                    </p>
                </div>
            </div>
        </div>
    );
}
