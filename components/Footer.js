import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="footer">
            <div className="container">
                <p>
                    <Link href="#">Contact us</Link> |
                    <Link href="#">About us</Link> |
                    <Link href="#">Privacy Policy</Link> |
                    <Link href="#">Terms of Service</Link>
                </p>
                <p style={{ marginTop: '20px' }}>
                    &copy; {new Date().getFullYear()} Swivo Magic. All rights reserved.
                </p>
                <p style={{ marginTop: '10px', fontSize: '0.8rem' }}>
                    Disclaimer: This site is not a part of the Facebook website or Facebook Inc. Additionally, This site is NOT endorsed by Facebook in any way. FACEBOOK is a trademark of FACEBOOK, Inc.
                </p>
            </div>
        </footer>
    );
}
