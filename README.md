# Swivo Magazine - Advertorial Platform

A Next.js-based advertorial website with Vercel Postgres backend for managing articles.

## 🚀 Features

- ✅ Dynamic article management via admin dashboard
- ✅ Vercel Postgres database integration
- ✅ SEO-optimized article pages
- ✅ UTM parameter tracking
- ✅ Responsive design
- ✅ No external CMS required

## 📋 Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Vercel Postgres

#### Option A: Via Vercel Dashboard (Recommended)
1. Go to your Vercel project: https://vercel.com/lenards-projects-bd33782d/swivomagic-advertorials
2. Click on the "Storage" tab
3. Click "Create Database"
4. Select "Postgres"
5. Follow the prompts to create your database
6. Vercel will automatically add environment variables to your project

#### Option B: Pull Environment Variables Locally
```bash
# Install Vercel CLI if you haven't
npm i -g vercel

# Link your project
vercel link

# Pull environment variables
vercel env pull .env.local
```

### 3. Initialize Database Schema

Once your Vercel Postgres is set up and environment variables are configured:

1. Start your development server:
```bash
npm run dev
```

2. Visit http://localhost:3000/admin

3. Click the "Initialize Database" button to create the articles table

### 4. Create Your First Article

1. Click "+ New Article" in the admin dashboard
2. Fill in all the required fields
3. Click "Create Article"
4. View your article on the homepage!

## 📁 Project Structure

```
/app
  /admin                 # Admin dashboard
    /new                 # Create new article
    /edit/[slug]         # Edit article (to be implemented)
  /api
    /articles            # CRUD API for articles
    /init-db             # Database initialization
  /article/[slug]        # Dynamic article pages
  page.js                # Homepage (lists all articles)

/components              # Reusable components
/lib
  db.js                  # Database utility functions
/public/images           # Article images
```

## 🎯 Usage

### Admin Dashboard
- **URL:** http://localhost:3000/admin
- **Features:**
  - View all articles
  - Create new articles
  - Edit existing articles
  - Delete articles
  - Initialize database

### Creating Articles
1. Navigate to `/admin/new`
2. Fill in:
   - Basic info (title, slug, category, author)
   - Content (hook, story paragraphs, benefits)
   - Urgency box (optional)
   - CTA (link and button text)
3. Upload hero image to `/public/images/` first
4. Submit the form

### Article Structure
Each article includes:
- **Hook:** Bold opening paragraph
- **Story:** Multiple paragraphs telling the story
- **Benefits:** Numbered list of product benefits
- **Urgency Box:** Optional call-out box
- **CTA:** Call-to-action button with UTM tracking

## 🗄️ Database Schema

```sql
CREATE TABLE articles (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(255) UNIQUE NOT NULL,
  title TEXT NOT NULL,
  category VARCHAR(100),
  author VARCHAR(255),
  published_date VARCHAR(50),
  excerpt TEXT,
  hero_image TEXT,
  advertorial_label VARCHAR(255),
  hook TEXT,
  story JSONB,
  benefits JSONB,
  urgency_box JSONB,
  cta_link TEXT,
  cta_text TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  published BOOLEAN DEFAULT true
);
```

## 🚀 Deployment

### Deploy to Vercel

1. Push your changes to GitHub:
```bash
git add .
git commit -m "Added database backend"
git push origin main
```

2. Vercel will automatically deploy your changes

3. Make sure Vercel Postgres is connected in your project settings

4. Visit your production URL and go to `/admin` to initialize the database

## 📝 API Endpoints

- `GET /api/articles` - Get all articles
- `POST /api/articles` - Create new article
- `GET /api/articles/[slug]` - Get single article
- `PUT /api/articles/[slug]` - Update article
- `DELETE /api/articles/[slug]` - Delete article
- `GET /api/init-db` - Initialize database schema

## 🎨 Customization

### Adding New Categories
Edit the category dropdown in `/app/admin/new/page.js`:
```javascript
<select name="category">
  <option value="Lifestyle">Lifestyle</option>
  <option value="Health & Family">Health & Family</option>
  <option value="Your New Category">Your New Category</option>
</select>
```

### Styling
- Global styles: `/app/globals.css`
- Admin styles: `/app/admin/admin.css`

## 🔧 Troubleshooting

### Database Connection Issues
- Make sure Vercel Postgres is properly connected
- Check that environment variables are set in `.env.local`
- Run `vercel env pull` to sync environment variables

### Articles Not Showing
- Visit `/admin` and click "Initialize Database"
- Check browser console for API errors
- Verify database connection in Vercel dashboard

### Images Not Loading
- Ensure images are in `/public/images/`
- Use relative paths like `/images/your-image.jpg`
- Check file names match exactly (case-sensitive)

## 📚 Tech Stack

- **Framework:** Next.js 14.2.15
- **Database:** Vercel Postgres
- **Styling:** CSS
- **Deployment:** Vercel
- **Language:** JavaScript/React

## 🤝 Contributing

1. Create a new branch
2. Make your changes
3. Test locally
4. Push and create a pull request

## 📄 License

Private project for Swivo Magic
