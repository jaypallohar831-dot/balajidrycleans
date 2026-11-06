# 🧺 Balaji Dry Cleaners — Official Website

Modern, fast, and responsive website built for **Balaji Dry Cleaners**, located in RK Colony, Bhilwara, Rajasthan. Built with Next.js (App Router), TypeScript, Tailwind CSS, and Framer Motion.

---

## ⚡ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, Turbopack)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with a custom sky-blue and deep navy design system
- **Typography**: [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans) via `next/font/google`
- **Animations**: [Framer Motion](https://www.framer.com/motion/) with `prefers-reduced-motion` compliance
- **Icons**: [Lucide React](https://lucide.dev/)
- **SEO & Schema**: LocalBusiness JSON-LD, Dynamic XML Sitemap, Robots.txt, OpenGraph & Twitter Cards

---

## 🛠️ How to Customize Business Information

All business details, contact information, services, process steps, and stats are centralized in a single configuration file:
👉 **[`src/config/site.ts`](src/config/site.ts)** (or root `config/site.ts`)

```typescript
export const siteConfig = {
  name: "Balaji Dry Cleaners",
  tagline: "Premium Dry Cleaning & Laundry Services",
  description: "Bhilwara's trusted dry cleaning experts...",

  // 1. Change your WhatsApp Number here (Country code + 10 digits without spaces or '+')
  whatsapp: "919876543210", 

  // 2. Change Instagram username here
  instagram: "balajidryclean",

  // 3. Update shop address
  address: {
    line1: "RK Colony",
    line2: "Bhilwara, Rajasthan",
    full: "RK Colony, Bhilwara, Rajasthan",
  },

  // 4. Update landing page stats
  stats: [
    { label: "Happy Customers", value: "5,000+" },
    { label: "Garments Cleaned", value: "50,000+" },
    { label: "Years of Trust", value: "10+" },
  ],

  // 5. Update or add services
  services: [ ... ],

  // 6. Update process steps
  process: [ ... ],
};
```

### 📲 WhatsApp Helper Function
Any link that opens WhatsApp uses the helper function:
```typescript
getWhatsAppLink("Your custom prefilled message here")
```
It automatically uses `siteConfig.whatsapp` to generate a valid `https://wa.me/91XXXXXXXXXX?text=...` URL.

---

## 🖼️ How to Swap the Hero Image

The hero section displays a crisp white shirt hanging on a clothesline with wooden pins. To replace it with your own shop photograph or garment image:

1. Prepare your image (square aspect ratio `1:1`, recommended size: **800×800px** or **1000×1000px** in `.jpg` or `.png`).
2. Rename your new image file to:
   ```
   hero-shirt.jpg
   ```
3. Place it into the **`public/`** folder:
   ```
   balaji-dry-cleaners/public/hero-shirt.jpg
   ```
4. The image will automatically update on the website and inherit the gentle swaying animation (`rotate: [-2.2°, 2.2°, -2.2°]`).

> **Tip**: If you want to use a different filename or format (e.g., `hero-banner.png`), update line 218 in [`src/components/Hero.tsx`](src/components/Hero.tsx):
> ```tsx
> <Image src="/hero-banner.png" alt="Your description" fill priority ... />
> ```

---

## 🚀 How to Deploy on Vercel

The easiest way to deploy this Next.js app with global CDN, free SSL, and automatic continuous deployment:

### Method 1: Via Vercel Web Dashboard (Recommended)

1. Push this project to your GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of Balaji Dry Cleaners"
   git remote add origin https://github.com/your-username/balaji-dry-cleaners.git
   git branch -M main
   git push -u origin main
   ```
2. Go to [vercel.com](https://vercel.com/) and sign in with GitHub.
3. Click **"Add New Project"** and import your `balaji-dry-cleaners` repository.
4. If your project is inside a subfolder, select `balaji-dry-cleaners` as the **Root Directory**.
5. Framework preset will automatically detect **Next.js**.
6. Click **Deploy**. Vercel will build and deploy your site in ~60 seconds.

### Method 2: Via Vercel CLI

```bash
# Install Vercel CLI globally
npm i -g vercel

# Run inside balaji-dry-cleaners directory
vercel
```
Follow the interactive prompts to link and deploy to production.

---

## 💻 Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

### Build Verification
To test the production build locally:
```bash
npm run build
npm run start
```

---

## 🔔 Backend & Notifications Setup

The backend automatically dispatches:
1. **HTML Email to the owner** via Resend (with booking code, customer details, tap-to-call link, and a "Reply on WhatsApp" button).
2. **Instant WhatsApp alert to the owner** via Meta WhatsApp Cloud API.
3. **Confirmation email to the customer** (if an email was provided).
4. **Audit trail** logged to the `notification_logs` table in Supabase.

### 📧 How to Set Up Resend & Verify Your Domain

1. **Sign up**: Go to [resend.com](https://resend.com) and create a free account.
2. **Create API Key**:
   - Navigate to **API Keys** → **Create API Key** (Permissions: Full Access).
   - Copy the key and add it to your `.env.local`:
     ```env
     RESEND_API_KEY=re_1234567890abcdef
     OWNER_EMAIL=owner@balajidrycleaners.in
     ```
3. **Verify Your Custom Domain** (for sending emails from `orders@yourdomain.com`):
   - In Resend, go to **Domains** → click **Add Domain**.
   - Enter your domain (e.g., `balajidrycleaners.in` or `mail.balajidrycleaners.in`).
   - Resend will generate 3 DNS records:
     - **DKIM** (TXT record: `resend._domainkey`)
     - **SPF** (TXT record: `v=spf1 include:amazonses.com ~all`)
     - **MX** (Optional, for receiving bounces)
   - Log in to your domain registrar (Cloudflare, GoDaddy, Namecheap, etc.) and add these records in your DNS Management.
   - Click **Verify Domain** in Resend. DNS propagation typically takes 2–10 minutes.
   - Once verified, configure the sender address in `.env.local`:
     ```env
     RESEND_FROM_EMAIL="Balaji Dry Cleaners <orders@balajidrycleaners.in>"
     ```

---

### 💬 How to Set Up Meta WhatsApp Cloud API

1. **Create Meta Developer Account**:
   - Go to [developers.facebook.com](https://developers.facebook.com) and log in with your Facebook account.
2. **Create a Business App**:
   - Click **My Apps** → **Create App** → select **Other** → **Business**.
   - Enter an app name (e.g. `Balaji Notifications`) and link your Meta Business Account.
3. **Add WhatsApp Product**:
   - On the App Dashboard, find **WhatsApp** and click **Set up**.
4. **Retrieve Phone Number ID & Test Token**:
   - Under WhatsApp in the sidebar, click **API Setup**.
   - Note down the **Phone number ID** (e.g., `105938472910482`).
   - Copy the temporary access token to test immediately.
5. **Generate a Permanent System User Token** (Required for Production):
   - Go to [business.facebook.com/settings](https://business.facebook.com/settings).
   - Under **Users** → **System users** → click **Add**.
   - Assign the **Admin** role to the system user.
   - Click **Generate token**, select your WhatsApp App, and choose permissions:
     - `whatsapp_business_messaging`
     - `whatsapp_business_management`
   - Copy the generated permanent token.
6. **Set Environment Variables**:
   In your `.env.local`:
   ```env
   WHATSAPP_CLOUD_TOKEN=EAAxxxxxxx...
   WHATSAPP_PHONE_NUMBER_ID=105938472910482
   OWNER_WHATSAPP_NUMBER=919876543210
   ```
   *(Ensure `OWNER_WHATSAPP_NUMBER` includes the country code `91` without `+` or spaces).*

> **Note**: If `WHATSAPP_CLOUD_TOKEN` is not configured, the system skips WhatsApp messages silently, logs a warning, and continues without affecting the customer response.

---

## 🧪 Running Automated Tests

A test suite covers validation, honeypot spam protection, rate limiting, Turnstile verification, and notification templates:

```bash
# Run the API test suite (53 assertions)
npm test
```

---

## 📄 License & Credits

- Designed for **Balaji Dry Cleaners** (RK Colony, Bhilwara, Rajasthan).
- Website by **Rollix Media**.
