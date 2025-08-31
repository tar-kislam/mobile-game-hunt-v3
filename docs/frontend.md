# Frontend Documentation

## 1. Overview
The frontend will be built using **Next.js with shadcn/ui**.  
The UI design will not copy Product Hunt but will **mirror its structure & functionality**.

## 2. Pages & Features
### Home Page
- Feed of trending & new products
- Daily leaderboard
- Categories & filters
- "Submit Product" button

### Product Page
- Product details (title, description, link, screenshots)
- Upvote button
- Comments & discussions
- Related products

### Submit Product Page
- Form with validation
- Title, tagline, description, link, media upload
- Category/tags selection

### User Profile
- Submitted products
- Voted products
- Comments
- Bio, avatar, links

### Authentication
- Login, signup, logout via NextAuth.js
- Social logins (Google, GitHub)

### Notifications
- Upvotes, comments, follows
- Dropdown with latest alerts

### Admin Panel
- Product moderation
- User management

## 3. UI Components (shadcn/ui)
- **Button** (primary, secondary, icon)
- **Card** (for products, comments, notifications)
- **Modal/Dialog** (submit product, confirm actions)
- **Form Elements** (inputs, selects, checkboxes)
- **Dropdowns** (user menu, filters)
- **Navbar & Sidebar**
- **Toast Notifications**

## 4. Styling
- TailwindCSS for layout and responsive design.
- shadcn/ui for consistent components.
- Dark mode support.