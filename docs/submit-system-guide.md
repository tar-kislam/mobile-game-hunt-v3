# Product Hunt Submit System - Implementasyon Kılavuzu

## Cursor Prompt

```
Mevcut Next.js projem için Product Hunt benzeri çok aşamalı (multi-step) bir submit sistemi oluştur. Sistem aşağıdaki özelliklere sahip olmalı:

### Teknik Gereksinimler:
- Next.js 14+ App Router yapısı
- TypeScript
- Prisma ORM ile database bağlantısı
- React Hook Form + Zod validation
- Tailwind CSS (mevcut stil ile uyumlu)
- Responsive tasarım
- Server Actions kullanarak form submission

### Sayfa Yapısı ve Akışı:

1. **Ana Submit Sayfası** (`/submit`)
   - "Submit your Game" butonu ile başlangıç
   - Mevcut projeler listesi (draft/published)

2. **Multi-Step Form** (`/submit/new`)
   - 5 aşamalı form sistemi
   - Sol sidebar ile ilerleme takibi
   - Her aşamada validation kontrolü

### Form Aşamaları:

**Aşama 1: Main Info**
- Product name (required, max 40 char)
- Tagline (required, max 60 char, açıklayıcı tooltip)
- Links to the launch (primary URL required)
- Additional links (App Store, Google Play, etc.)
- X account field
- Description (required, max 260 char)
- Launch tags selection (max 3)
- Open source checkbox

**Aşama 2: Images and Media**
- Thumbnail upload (required, 240x240 recommended)
- Gallery images (min 3 recommended, 1270x760px)
- Drag & drop interface
- Image preview ve crop functionality
- Video/Loom embed (optional)
- Interactive demo link (optional)

**Aşama 3: Makers**
- "Did you work on this launch?" selection
- Makers search ve add functionality
- Email invitation sistemi
- Team member roles

**Aşama 4: Extras**
- Pricing model selection (Free/Paid/Freemium)
- Promo code creation fields
- Advanced settings

**Aşama 5: Launch Checklist**
- Required field validation summary
- Recommended items checklist
- Draft save / Schedule launch options
- Final submission

### Database Schema (Prisma):

```prisma
model Product {
  id          String   @id @default(cuid())
  name        String
  tagline     String
  description String
  primaryUrl  String
  additionalUrls Json? // Array of {type, url}
  xAccount    String?
  isOpenSource Boolean @default(false)
  thumbnail   String?
  gallery     Json? // Array of image URLs
  videoUrl    String?
  demoUrl     String?
  pricing     PricingType
  promoCode   String?
  promoOffer  String?
  promoExpiry DateTime?
  status      ProductStatus @default(DRAFT)
  launchDate  DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  makers      ProductMaker[]
  tags        ProductTag[]
}

model ProductMaker {
  id        String @id @default(cuid())
  productId String
  userId    String
  role      MakerRole @default(MAKER)
  isCreator Boolean @default(false)
  product   Product @relation(fields: [productId], references: [id])
  user      User    @relation(fields: [userId], references: [id])
}

model ProductTag {
  id        String @id @default(cuid())
  productId String
  tagId     String
  product   Product @relation(fields: [productId], references: [id])
  tag       Tag     @relation(fields: [tagId], references: [id])
}

model Tag {
  id       String @id @default(cuid())
  name     String @unique
  products ProductTag[]
}

enum ProductStatus {
  DRAFT
  PENDING
  PUBLISHED
  REJECTED
}

enum PricingType {
  FREE
  PAID
  FREEMIUM
}

enum MakerRole {
  MAKER
  HUNTER
}
```

### Önemli Gereksinimler:
- Form state management için React Hook Form
- Validation için Zod schemas
- Image upload için file handling
- Progress tracking ve auto-save functionality
- Mobile-first responsive tasarım
- Loading states ve error handling
- Success/error notifications
- SEO optimization
- Accessibility (ARIA labels, keyboard navigation)

### Dosya Yapısı:
```
app/
├── submit/
│   ├── page.tsx (Ana submit sayfası)
│   ├── new/
│   │   ├── page.tsx (Multi-step form container)
│   │   └── components/
│   │       ├── StepSidebar.tsx
│   │       ├── steps/
│   │       │   ├── MainInfoStep.tsx
│   │       │   ├── MediaStep.tsx
│   │       │   ├── MakersStep.tsx
│   │       │   ├── ExtrasStep.tsx
│   │       │   └── ChecklistStep.tsx
│   │       └── FormProvider.tsx
├── api/
│   ├── products/
│   │   └── route.ts
│   └── upload/
│       └── route.ts
components/
├── ui/ (Mevcut UI components)
├── forms/ (Form components)
└── upload/ (File upload components)
lib/
├── schemas/ (Zod validation schemas)
├── actions/ (Server actions)
└── utils/
```

Lütfen bu gereksinimlere göre tam bir implementasyon oluştur. Mevcut projemin stil ve yapısıyla uyumlu olmalı.
```

## Detaylı Implementasyon Adımları

### 1. Database Schema Kurulumu

Prisma schema dosyanızda yukarıdaki model tanımlarını ekleyin ve migration çalıştırın:

```bash
npx prisma db push
```

### 2. Form Validation Schemas

`lib/schemas/product.ts` dosyası oluşturun:

```typescript
import { z } from "zod";

export const mainInfoSchema = z.object({
  name: z.string().min(1, "Product name is required").max(40, "Max 40 characters"),
  tagline: z.string().min(1, "Tagline is required").max(60, "Max 60 characters"),
  primaryUrl: z.string().url("Please enter a valid URL"),
  additionalUrls: z.array(z.object({
    type: z.string(),
    url: z.string().url()
  })).optional(),
  xAccount: z.string().optional(),
  description: z.string().min(1, "Description is required").max(260, "Max 260 characters"),
  tags: z.array(z.string()).max(3, "Max 3 tags allowed"),
  isOpenSource: z.boolean().default(false)
});

export const mediaSchema = z.object({
  thumbnail: z.string().min(1, "Thumbnail is required"),
  gallery: z.array(z.string()).min(1, "At least one image is required"),
  videoUrl: z.string().url().optional().or(z.literal("")),
  demoUrl: z.string().url().optional().or(z.literal(""))
});

// Diğer step şemaları...
```

### 3. Server Actions

`lib/actions/products.ts` dosyası oluşturun:

```typescript
'use server';

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { mainInfoSchema, mediaSchema } from "@/lib/schemas/product";

export async function createProduct(data: any) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const validatedData = mainInfoSchema.parse(data);
  
  const product = await prisma.product.create({
    data: {
      ...validatedData,
      userId: session.user.id,
      status: 'DRAFT'
    }
  });

  return product;
}

export async function updateProduct(productId: string, data: any) {
  // Implementation...
}
```

### 4. Ana Bileşenler

Form bileşenlerini oluştururken şu yapıyı takip edin:

- `FormProvider.tsx`: Context ile form state yönetimi
- Her step için ayrı component
- Validation ve error handling
- Auto-save functionality
- Progress tracking

### 5. Stil Uyumluluğu

Mevcut projenizin Tailwind sınıflarını kullanın:
- Form elementleri için consistent styling
- Button variants
- Color scheme
- Spacing ve typography

### 6. File Upload Sistemi

Image upload için:
- Next.js API route ile file handling
- Client-side preview
- Compression ve resize
- Cloud storage entegrasyonu (optional)

## Test Checklist

- [ ] Form validation çalışıyor
- [ ] Multi-step navigation
- [ ] Auto-save functionality
- [ ] File upload sistemi
- [ ] Database operations
- [ ] Responsive tasarım
- [ ] Error handling
- [ ] Success states

## Cursor Kullanım İpuçları

1. Bu prompt'u Cursor'a verin
2. Mevcut proje yapınızı gösterin
3. Step by step implementasyon isteyin
4. Her adımda test edin
5. Stil uyumluluğu için mevcut component'lerinizi referans gösterin