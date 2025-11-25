export const metadata = {
    title: 'About Us - Swivo Magazine',
};

export default function AboutUs() {
    return (
        <div className="container" style={{ maxWidth: '800px', padding: '60px 20px' }}>
            <h1 style={{ fontFamily: 'var(--font-family-serif)', fontSize: '2.5rem', marginBottom: '20px' }}>About Swivo Magazine</h1>

            <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '40px', lineHeight: '1.8' }}>
                Your trusted source for smart home solutions and lifestyle innovations.
            </p>

            <div style={{ lineHeight: '1.8', fontSize: '1.05rem' }}>
                <p style={{ marginBottom: '20px' }}>
                    At <strong>Swivo Magazine</strong>, we believe that everyday life should be easier, smarter, and more efficient.
                    Our mission is to uncover and share the latest innovations in home care, cleaning, and lifestyle products
                    that genuinely save you time and effort.
                </p>

                <p style={{ marginBottom: '20px' }}>
                    We're part of the Swivo family, brought to you by <strong>Vivayogi Private Limited</strong>. Every day,
                    our team works to discover products that make your shopping experience more convenient and affordable,
                    while transforming the way you manage your home.
                </p>

                <p style={{ marginBottom: '20px' }}>
                    From home and kitchen essentials to groundbreaking cleaning solutions, we curate and test products
                    so you don't have to wade through endless options. Our editorial team is dedicated to bringing you
                    honest reviews, practical tips, and real stories from people just like you.
                </p>

                <p style={{ marginBottom: '20px' }}>
                    <strong>What makes us different?</strong> We don't just follow trends—we create them. Our selection
                    is constantly evolving to meet your needs, and we're always on the lookout for the next game-changing
                    product that will make your life better.
                </p>

                <p style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px', borderLeft: '4px solid var(--accent-color)' }}>
                    Whether you're a busy parent, a car enthusiast, or someone preparing for festival season,
                    there's always something new to discover at Swivo Magazine.
                </p>
            </div>
        </div>
    );
}
