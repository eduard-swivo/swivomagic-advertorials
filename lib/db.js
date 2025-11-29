import { sql } from '@vercel/postgres';

// Initialize database schema
export async function initDatabase() {
    try {
        await sql`
      CREATE TABLE IF NOT EXISTS articles (
        id SERIAL PRIMARY KEY,
        slug VARCHAR(255) UNIQUE NOT NULL,
        title TEXT NOT NULL,
        category VARCHAR(100),
        author VARCHAR(255),
        published_date VARCHAR(50),
        excerpt TEXT,
        hero_image TEXT,
        second_image TEXT,
        advertorial_label VARCHAR(255),
        hook TEXT,
        story JSONB,
        benefits JSONB,
        urgency_box JSONB,
        comments JSONB,
        cta_link TEXT,
        cta_text TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        published BOOLEAN DEFAULT true
      );
    `;

        // Create product_profiles table if it doesn't exist
        await sql`
      CREATE TABLE IF NOT EXISTS product_profiles (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        url TEXT NOT NULL,
        images JSONB DEFAULT '[]',
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

        // Migration: Add comments column if it doesn't exist
        try {
            await sql`ALTER TABLE articles ADD COLUMN IF NOT EXISTS comments JSONB;`;
            await sql`ALTER TABLE articles ADD COLUMN IF NOT EXISTS second_image TEXT;`;
            await sql`ALTER TABLE articles ADD COLUMN IF NOT EXISTS product_main_image TEXT;`;
            await sql`ALTER TABLE product_profiles ADD COLUMN IF NOT EXISTS main_image TEXT;`;
        } catch (e) {
            console.log('Migration note:', e.message);
        }

        console.log('Database initialized successfully');
        return { success: true };
    } catch (error) {
        console.error('Database initialization error:', error);
        return { success: false, error: error.message };
    }
}

// Get all articles
export async function getAllArticles() {
    try {
        const { rows } = await sql`
      SELECT * FROM articles 
      WHERE published = true 
      ORDER BY id DESC
    `;
        return rows;
    } catch (error) {
        console.error('Error fetching articles:', error);
        return [];
    }
}

// Get article by slug
export async function getArticleBySlug(slug) {
    try {
        const { rows } = await sql`
      SELECT * FROM articles 
      WHERE slug = ${slug} AND published = true
      LIMIT 1
    `;
        return rows[0] || null;
    } catch (error) {
        console.error('Error fetching article:', error);
        return null;
    }
}

// Create new article
export async function createArticle(articleData) {
    try {
        const {
            slug,
            title,
            category,
            author,
            published_date,
            excerpt,
            hero_image,
            second_image,
            product_main_image, // Added this
            advertorial_label,
            hook,
            story,
            benefits,
            urgency_box,
            comments,
            cta_link,
            cta_text,
            published = true
        } = articleData;

        const { rows } = await sql`
      INSERT INTO articles (
        slug, title, category, author, published_date, excerpt,
        hero_image, second_image, product_main_image, advertorial_label, hook, story, benefits,
        urgency_box, comments, cta_link, cta_text, published
      ) VALUES (
        ${slug}, ${title}, ${category}, ${author}, ${published_date},
        ${excerpt}, ${hero_image}, ${second_image}, ${product_main_image || null}, ${advertorial_label}, ${hook},
        ${JSON.stringify(story)}, ${JSON.stringify(benefits)},
        ${JSON.stringify(urgency_box)}, ${JSON.stringify(comments || [])}, 
        ${cta_link}, ${cta_text}, ${published}
      )
      RETURNING *
    `;

        return { success: true, article: rows[0] };
    } catch (error) {
        console.error('Error creating article:', error);
        return { success: false, error: error.message };
    }
}

// Update article
export async function updateArticle(slug, articleData) {
    try {
        const {
            title,
            category,
            author,
            published_date,
            excerpt,
            hero_image,
            second_image,
            advertorial_label,
            hook,
            story,
            benefits,
            urgency_box,
            comments,
            cta_link,
            cta_text,
            published
        } = articleData;

        const { rows } = await sql`
      UPDATE articles SET
        title = ${title},
        category = ${category},
        author = ${author},
        published_date = ${published_date},
        excerpt = ${excerpt},
        hero_image = ${hero_image},
        second_image = ${second_image},
        advertorial_label = ${advertorial_label},
        hook = ${hook},
        story = ${JSON.stringify(story)},
        benefits = ${JSON.stringify(benefits)},
        urgency_box = ${JSON.stringify(urgency_box)},
        comments = ${JSON.stringify(comments || [])},
        cta_link = ${cta_link},
        cta_text = ${cta_text},
        published = ${published},
        updated_at = NOW()
      WHERE slug = ${slug}
      RETURNING *
    `;

        return { success: true, article: rows[0] };
    } catch (error) {
        console.error('Error updating article:', error);
        return { success: false, error: error.message };
    }
}

// Delete article
export async function deleteArticle(slug) {
    try {
        await sql`DELETE FROM articles WHERE slug = ${slug}`;
        return { success: true };
    } catch (error) {
        console.error('Error deleting article:', error);
        return { success: false, error: error.message };
    }
}

// Product Profile Functions
export async function getProducts() {
    try {
        const { rows } = await sql`SELECT * FROM product_profiles ORDER BY created_at DESC`;
        return rows;
    } catch (error) {
        console.error('Error fetching products:', error);
        return [];
    }
}

export async function createProduct(productData) {
    const { name, url, images, description, main_image } = productData;
    try {
        const { rows } = await sql`
            INSERT INTO product_profiles (name, url, images, description, main_image)
            VALUES (${name}, ${url}, ${JSON.stringify(images)}, ${description}, ${main_image || null})
            RETURNING *
        `;
        return rows[0];
    } catch (error) {
        console.error('Error creating product:', error);
        throw error;
    }
}

export async function updateProduct(id, productData) {
    const { name, url, images, description, main_image } = productData;
    try {
        const { rows } = await sql`
            UPDATE product_profiles
            SET name = ${name},
                url = ${url},
                images = ${JSON.stringify(images)},
                description = ${description},
                main_image = ${main_image || null}
            WHERE id = ${id}
            RETURNING *
        `;
        return rows[0];
    } catch (error) {
        console.error('Error updating product:', error);
        throw error;
    }
}

export async function deleteProduct(id) {
    try {
        await sql`DELETE FROM product_profiles WHERE id = ${id}`;
        return true;
    } catch (error) {
        console.error('Error deleting product:', error);
        return false;
    }
}
