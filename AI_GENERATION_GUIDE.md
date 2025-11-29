# 🤖 AI Article Generation Guide

## Overview

Your advertorial platform now has **AI-powered article generation** using OpenAI GPT-4o-mini. This feature creates high-converting, direct-response optimized advertorials from either a product link or an ad creative.

---

## 🎯 Two Generation Modes

### 1. **From Product Link** 🔗
- Paste any product URL
- AI scrapes the product page
- Generates complete advertorial
- Auto-fills CTA link

### 2. **From Ad Creative** 🎨
- Upload your ad image
- AI analyzes the creative
- Generates congruent advertorial
- Matches ad messaging and tone

---

## 🚀 How to Use

### **Step 1: Access AI Generator**
1. Go to `/admin/new`
2. You'll see two tabs: **🤖 AI Generate** and **✍️ Manual Entry**
3. Click **🤖 AI Generate**

### **Step 2: Choose Mode**
- **🔗 From Product Link**: For product-based advertorials
- **🎨 From Ad Creative**: For ad-congruent advertorials

### **Step 3: Provide Inputs**

#### **Product Link Mode:**
1. Enter product URL (e.g., `https://yourstore.com/product`)
2. Click **✨ Generate Article with AI**
3. Wait 30-60 seconds

#### **Ad Creative Mode:**
1. Upload your ad image (JPG, PNG)
2. Enter product URL for CTA
3. Click **✨ Generate Article with AI**
4. Wait 30-60 seconds

### **Step 4: Review & Edit**
1. AI generates the article
2. Form switches to **Manual Entry** mode
3. Review all fields
4. Edit as needed
5. Upload hero image to `/public/images/`
6. Click **Create Article**

---

## 🎨 What AI Generates

### **Complete Article Structure:**
- ✅ **Headline**: Aggressive, clickbaity, curiosity-driven
- ✅ **Hook**: Bold opening paragraph
- ✅ **Story**: 5-8 paragraphs with relatable narrative
- ✅ **Benefits**: 3-4 compelling benefit points
- ✅ **Urgency Box**: FOMO and scarcity messaging
- ✅ **CTA Text**: Action-oriented button copy
- ✅ **Metadata**: Category, author, label, excerpt

### **Copywriting Style:**
- 🎯 Direct-response optimized
- 🔥 Aggressive and clickbaity (but legal)
- 💬 Conversational and relatable
- ⚡ Uses subjunctive mood (could/may/might)
- 🎭 Storytelling-driven
- 🚨 Creates urgency and FOMO

---

## 💰 Cost Per Article

**Using GPT-4o-mini:**
- Product Link Mode: ~$0.001 per article
- Ad Creative Mode: ~$0.002 per article (includes vision API)

**Extremely affordable!** You can generate 1000 articles for ~$1-2.

---

## 🔑 Setup Requirements

### **Production (Vercel):**
You need to add the OpenAI API key to Vercel:

1. Go to Vercel Dashboard
2. Settings → Environment Variables
3. Add new variable:
   - **Key:** `OPENAI_API_KEY`
   - **Value:** `sk-proj-YOUR-KEY-HERE`
   - **Environments:** All (Production, Preview, Development)
4. Save and redeploy

### **Local Development:**
Already configured in `.env.local` (not committed to Git for security)

---

## 📝 AI Copywriting Principles

The AI is trained to follow these direct-response rules:

### **Core Principles:**
1. **Old-school direct response tactics**
2. **Aggressive and clickbaity** (but legal)
3. **Subjunctive mood** for claims (could/may/might)
4. **Pain point targeting**
5. **Social proof and authority**
6. **Storytelling-driven**
7. **Strong CTAs**

### **Legal Compliance:**
- ✅ No unsubstantiated health claims
- ✅ Uses "could", "may", "might" for benefits
- ✅ Avoids absolute guarantees
- ✅ No income claims

### **Style Guidelines:**
- ✅ Conversational, relatable language
- ✅ Specific details and scenarios
- ✅ Builds credibility before pitch
- ✅ Pattern interrupts
- ✅ Emotional resonance

---

## 🎯 Example Workflow

### **Scenario: New Product Launch**

1. **Get product URL**: `https://yourstore.com/new-product`
2. **Go to** `/admin/new`
3. **Click** "AI Generate"
4. **Select** "From Product Link"
5. **Paste** product URL
6. **Click** "Generate Article"
7. **Wait** 30-60 seconds
8. **Review** generated content
9. **Upload** hero image
10. **Adjust** if needed
11. **Save** article
12. **Done!** Article is live

**Time saved:** 30-45 minutes per article!

---

## 🔧 Troubleshooting

### **"Failed to generate article"**
- Check OpenAI API key is set
- Verify product URL is accessible
- Check API quota/billing
- Try again (sometimes network issues)

### **"Generation taking too long"**
- Normal: 30-60 seconds
- If >2 minutes, refresh and try again

### **"Generated content is off-brand"**
- Edit manually after generation
- Adjust product URL to better source
- Try ad creative mode instead

### **"Image upload not working"**
- Check file size (<5MB)
- Use JPG or PNG format
- Try different image

---

## 🚀 Best Practices

### **For Best Results:**

1. **Use clear product URLs**
   - Product pages with good descriptions
   - Avoid URLs with login requirements
   - E-commerce pages work best

2. **Upload high-quality ad creatives**
   - Clear, readable text
   - Good resolution
   - Actual ad creatives (not random images)

3. **Always review generated content**
   - AI is good, but not perfect
   - Add your brand voice
   - Verify claims are legal

4. **Upload appropriate hero images**
   - Match the article topic
   - High quality (at least 800px wide)
   - Relevant to product

5. **Test and iterate**
   - Generate multiple versions
   - A/B test different angles
   - Track performance

---

## 📊 Performance Tips

### **To Maximize Conversions:**

1. **Match ad to article**
   - Use "Ad Creative" mode for congruence
   - Keep messaging consistent
   - Deliver on ad promise

2. **Test different angles**
   - Generate 2-3 versions
   - Try different product URLs
   - Test various hooks

3. **Optimize CTAs**
   - Edit AI-generated CTA text
   - Make it benefit-driven
   - Create urgency

4. **Add social proof**
   - Edit to include testimonials
   - Add specific numbers
   - Use real customer stories

---

## 🎓 Advanced Usage

### **Batch Generation:**
1. Create list of product URLs
2. Generate articles one by one
3. Review and publish best performers

### **A/B Testing:**
1. Generate 2 versions of same product
2. Use different modes (product vs creative)
3. Compare conversion rates
4. Keep winner, archive loser

### **Seasonal Campaigns:**
1. Generate articles for seasonal products
2. Schedule publication dates
3. Update CTAs for promotions

---

## ⚠️ Important Notes

### **Security:**
- ✅ API key is stored securely in environment variables
- ✅ Never commit `.env.local` to Git
- ✅ Rotate API key if compromised

### **Costs:**
- ✅ Monitor OpenAI usage dashboard
- ✅ Set billing limits if needed
- ✅ ~$0.001-0.002 per article (very cheap)

### **Legal:**
- ✅ Always review AI-generated claims
- ✅ Ensure compliance with advertising laws
- ✅ Add disclaimers where needed
- ✅ Don't make unsubstantiated health claims

---

## 🎉 Summary

You now have an **AI-powered advertorial factory** that can:
- ✅ Generate articles in 30-60 seconds
- ✅ Create direct-response optimized copy
- ✅ Match ad creative messaging
- ✅ Save 30-45 minutes per article
- ✅ Cost ~$0.001 per article

**This is a game-changer for your workflow!** 🚀

---

## 📚 Next Steps

1. **Set OpenAI API key in Vercel** (production)
2. **Test generate an article** (local)
3. **Review and publish** (verify quality)
4. **Scale up** (batch generate)
5. **Track performance** (optimize)

**Happy generating!** 🤖✨
