# Database Schema (PostgreSQL + Prisma)

## Tables

### users
- id (UUID, PK)
- name
- email (unique)
- password (hashed, nullable for OAuth)
- image (avatar)
- role (enum: user/admin)
- createdAt
- updatedAt

### products
- id (UUID, PK)
- title
- description
- link
- image
- categoryId (FK)
- userId (FK → users)
- createdAt

### categories
- id (UUID, PK)
- name
- slug

### votes
- id (UUID, PK)
- userId (FK → users)
- productId (FK → products)
- createdAt
- UNIQUE(userId, productId)

### comments
- id (UUID, PK)
- body (text, markdown)
- parentId (nullable, FK → comments)
- productId (FK → products)
- userId (FK → users)
- createdAt

### notifications
- id (UUID, PK)
- type (comment, mention, product_approved)
- userId (FK → users)
- entityId (UUID reference)
- read (boolean)
- createdAt