# 🎬 PHASE 2: Image Persistence & Storage Management

**Status:** READY TO EXECUTE  
**Lead:** DBMasterAI  
**Timeline:** 8-15 January 2025  
**Blocking Issues:** None  
**Dependency:** Phase 1.3 Complete ✅

---

## 📋 Objective

Implement persistent image storage architecture with:

1. **Database Models** for image metadata and lifecycle
2. **Image Service** for upload, deletion, and signed URL generation
3. **Integration Points** across all modules (Courses, Users, Pages, Ads)
4. **Cleanup Jobs** for orphaned images
5. **Compliance** with Supabase Storage + PostgreSQL design

---

## 🗂️ Current State Analysis

### Existing URL Storage (String fields)

```
Course         → thumbnail (String?)
Lesson         → videoUrl (String?)
PublicPage     → bannerUrl (String?), iconUrl (String?)
AuditReport    → pdfUrl (String?)
User           → avatar (String?)
SystemConfig   → logoUrl, faviconUrl, loginBgUrl, navbarBgUrl
Advertisement  → imageUrl (implied)
Material       → fileUrl (String?)
```

**Problem:** Images stored as plain URLs with no:

- Metadata tracking (size, format, dimensions)
- Lifecycle management (created_at, deleted_at)
- Orphan detection (images with no references)
- Version control (multiple versions of same image)
- Access audit (who uploaded, when, where used)

### Supabase Storage Buckets (Exist)

```
📦 course-thumbnails  → Course course.thumbnail
📦 public-pages       → PublicPage banner/icon
📦 videos            → Lesson lesson.videoUrl
📦 profile-pictures  → User user.avatar
```

---

## 📊 Phase 2 Architecture

### 2.1 Database Models (Migration)

#### Image Model (Core)

```prisma
model Image {
  id              String       @id @default(cuid())

  // File metadata
  fileName        String       // original_file_name.jpg
  bucket          String       // course-thumbnails | videos | etc
  path            String       // slugified path in storage
  mimeType        String       // image/jpeg, video/mp4, etc
  size            Int          // bytes
  width           Int?         // for images
  height          Int?         // for images
  duration        Int?         // seconds, for videos

  // Signed URL (cache)
  signedUrl       String?      // cached for 1 hour
  signedUrlExpiry DateTime?    // when cache expires

  // Lifecycle
  uploadedBy      String       // user ID who uploaded
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt
  expiresAt       DateTime?    // auto-delete after X days

  // Soft delete
  deletedAt       DateTime?    // soft delete support

  // Relations
  usedBy          ImageUsage[]
  user            User         @relation(fields: [uploadedBy], references: [id], onDelete: Cascade)

  // Indexes
  @@index([bucket])
  @@index([path])
  @@index([uploadedBy])
  @@index([deletedAt])
  @@map("images")
}
```

#### ImageUsage Model (Relationships)

```prisma
model ImageUsage {
  id          String   @id @default(cuid())

  // Which image is being used
  imageId     String
  image       Image    @relation(fields: [imageId], references: [id], onDelete: Cascade)

  // Where it's being used
  resourceType String   // "COURSE" | "USER" | "PAGE" | "LESSON" | "AD" | "CERTIFICATE"
  resourceId  String    // e.g., courseId, userId, pageId
  fieldName   String    // "thumbnail" | "avatar" | "banner" etc

  createdAt   DateTime  @default(now())

  @@unique([imageId, resourceType, resourceId, fieldName])
  @@index([resourceType, resourceId])
  @@map("image_usages")
}
```

**Migration SQL:**

```sql
-- Phase 2.1 Migration
-- Create Image and ImageUsage models
-- Enable RLS policies for storage
-- Create indexes for performance

CREATE TABLE images (
  id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  fileName VARCHAR(500) NOT NULL,
  bucket VARCHAR(100) NOT NULL,
  path VARCHAR(1000) NOT NULL,
  mimeType VARCHAR(50) NOT NULL,
  size INT NOT NULL,
  width INT,
  height INT,
  duration INT,
  signedUrl TEXT,
  signedUrlExpiry TIMESTAMP,
  uploadedBy VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMP NOT NULL DEFAULT NOW(),
  expiresAt TIMESTAMP,
  deletedAt TIMESTAMP,
  FOREIGN KEY (uploadedBy) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_images_bucket ON images(bucket);
CREATE INDEX idx_images_path ON images(path);
CREATE INDEX idx_images_uploadedBy ON images(uploadedBy);
CREATE INDEX idx_images_deletedAt ON images(deletedAt);
CREATE INDEX idx_images_createdAt ON images(createdAt);

CREATE TABLE image_usages (
  id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  imageId VARCHAR(255) NOT NULL REFERENCES images(id) ON DELETE CASCADE,
  resourceType VARCHAR(50) NOT NULL,
  resourceId VARCHAR(255) NOT NULL,
  fieldName VARCHAR(100) NOT NULL,
  createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(imageId, resourceType, resourceId, fieldName)
);

CREATE INDEX idx_image_usages_resource ON image_usages(resourceType, resourceId);
CREATE INDEX idx_image_usages_imageId ON image_usages(imageId);
```

---

### 2.2 ImageService (Business Logic)

**File:** `src/lib/services/ImageService.ts` (400+ lines)

```typescript
// Core Methods
uploadImage(file: File, bucket: string, userId: string): Promise<Image>
deleteImage(imageId: string): Promise<void>
getSignedUrl(imageId: string, expirySeconds?: number): Promise<string>
updateImageUsage(imageId: string, usage: ImageUsageInput): Promise<ImageUsage>
findOrphanedImages(): Promise<Image[]>
cleanupOrphanedImages(daysOld?: number): Promise<number>
getImageMetadata(imageId: string): Promise<ImageMetadata>

// Helper Methods
uploadToSupabase(file: File, bucket: string, path: string): Promise<SupabaseResponse>
generateSignedUrl(bucket: string, path: string, expirySeconds: number): Promise<string>
deleteFromSupabase(bucket: string, path: string): Promise<void>
extractImageDimensions(file: File): Promise<{ width: number; height: number }>
extractVideoDuration(file: File): Promise<number>
```

**Key Features:**

- ✅ Automatic image dimension extraction (via sharp)
- ✅ Signed URL caching (1 hour TTL)
- ✅ Orphan detection (find images with no usages)
- ✅ Soft delete support (deletedAt field)
- ✅ Audit trail (uploadedBy, createdAt)
- ✅ Type-safe (Zod schemas)
- ✅ Error handling (custom ImageServiceError)

---

### 2.3 API Routes for Image Management

#### POST /api/admin/images/upload

```typescript
// Request (FormData)
file: File        // max 50MB
bucket: string    // course-thumbnails | videos | etc
field: string     // thumbnail | avatar | banner

// Response
{
  success: true
  image: Image
  signedUrl: string
}

// Validation
- Role ADMIN | owner of resource
- File type whitelist (JPEG, PNG, WebP, MP4, etc)
- Size limits (images: 10MB, videos: 100MB)
- Virus scan (ClamAV via Supabase)
```

#### DELETE /api/admin/images/{imageId}

```typescript
// Soft delete image
// Updates deletedAt timestamp
// Keeps record for recovery

// Validation
- Role ADMIN | owner of resource
```

#### GET /api/admin/images/{imageId}/signed-url

```typescript
// Get fresh signed URL
// Caches for 1 hour
// Refreshes when expired

// Response
{
  signedUrl: string;
  expiresAt: DateTime;
}
```

#### GET /api/admin/images/orphaned

```typescript
// List images with no usages
// Paginated results

// Response
{
  images: Image[]
  total: number
  cursor: string
}
```

---

### 2.4 Integration Points (Refactoring)

#### Course Thumbnail Upload

```typescript
// OLD: store URL directly
course.thumbnail = 'https://storage.url/image.jpg';

// NEW: use ImageService
const image = await ImageService.uploadImage(file, 'course-thumbnails', userId);
await ImageService.updateImageUsage(image.id, {
  resourceType: 'COURSE',
  resourceId: courseId,
  fieldName: 'thumbnail',
});
course.thumbnail = image.signedUrl; // or imageId reference
```

#### User Avatar Upload

```typescript
// NEW: use ImageService with profile-pictures bucket
const image = await ImageService.uploadImage(file, 'profile-pictures', userId);
user.avatar = image.signedUrl;
// ImageUsage tracked automatically
```

#### Public Page Banner/Icon

```typescript
// NEW: use ImageService with public-pages bucket
const banner = await ImageService.uploadImage(
  bannerFile,
  'public-pages',
  userId
);
page.bannerUrl = banner.signedUrl;
```

#### Lesson Videos

```typescript
// NEW: use ImageService with videos bucket
const video = await ImageService.uploadImage(videoFile, 'videos', userId);
lesson.videoUrl = video.signedUrl;
```

---

## 🔄 Phase 2 Timeline

### Phase 2.1: Database Setup (1 day)

**Lead:** DBMasterAI  
**Tasks:**

- [ ] Create Prisma migration (Image + ImageUsage models)
- [ ] Apply migration to dev database
- [ ] Verify Supabase Storage RLS policies
- [ ] Create indexes for performance
      **Deliverables:**
- Prisma schema updated
- Migration file created
- RLS policies enabled

### Phase 2.2: ImageService Implementation (2 days)

**Lead:** FullstackAI  
**Tasks:**

- [ ] Create `src/lib/services/ImageService.ts`
- [ ] Implement upload logic (Zod validation)
- [ ] Implement signed URL generation
- [ ] Implement orphan detection
- [ ] Add cleanup job (cron trigger)
- [ ] Write unit tests
      **Deliverables:**
- ImageService with 10+ methods
- Zod schemas for validation
- Error handling with custom exceptions
- Test coverage (80%+)

### Phase 2.3: API Routes (1 day)

**Lead:** FullstackAI  
**Tasks:**

- [ ] Create POST /api/admin/images/upload
- [ ] Create DELETE /api/admin/images/{id}
- [ ] Create GET /api/admin/images/{id}/signed-url
- [ ] Create GET /api/admin/images/orphaned
- [ ] Add RBAC to all routes
- [ ] Add rate limiting
      **Deliverables:**
- 4 API endpoints
- Full Zod validation
- RBAC enforcement
- Error handling

### Phase 2.4: Frontend Components (1 day)

**Lead:** FullstackAI  
**Tasks:**

- [ ] Create `ImageUploadComponent` with drag-drop
- [ ] Create `ImageGalleryComponent` for admin
- [ ] Create `ImageMetadataComponent` (view details)
- [ ] Integrate into existing forms
- [ ] Add loading states + error handling
      **Deliverables:**
- Reusable components
- React Query integration
- Toast notifications

### Phase 2.5: Integration Refactoring (2 days)

**Lead:** FullstackAI  
**Tasks:**

- [ ] Update Course upload (thumbnail)
- [ ] Update User avatar upload
- [ ] Update PublicPage banner/icon
- [ ] Update Lesson video upload
- [ ] Update SystemConfig logos
- [ ] Update Advertisement images
- [ ] Create data migration (old URLs → Image records)
      **Deliverables:**
- All modules using ImageService
- Data consistency verified
- Backward compatibility maintained

### Phase 2.6: Testing & Cleanup (1 day)

**Lead:** SecureOpsAI  
**Tasks:**

- [ ] Test orphan detection with old images
- [ ] Run cleanup job on staging
- [ ] Verify signed URLs expire correctly
- [ ] Test S3 storage quotas
- [ ] Performance test (100k images)
- [ ] Security audit (RLS policies)
      **Deliverables:**
- Test report
- Cleanup job logs
- Performance metrics

---

## 🛡️ Security Considerations

### Storage RLS Policies

```sql
-- Only authenticated users can upload
CREATE POLICY upload_images ON storage.objects
  FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
    AND bucket_id IN ('course-thumbnails', 'videos', 'profile-pictures', 'public-pages')
  );

-- Only admins or owners can delete
CREATE POLICY delete_images ON storage.objects
  FOR DELETE
  USING (
    auth.role() = 'authenticated'
    AND owner = auth.uid()
  );

-- Public read-only access (for public pages)
CREATE POLICY public_read ON storage.objects
  FOR SELECT
  USING (bucket_id = 'public-pages');
```

### Virus Scanning

- Supabase includes Clam AV scanning
- Enable in Storage dashboard
- Block on scan failure

### File Type Whitelist

```typescript
const ALLOWED_TYPES = {
  'course-thumbnails': ['image/jpeg', 'image/png', 'image/webp'],
  'profile-pictures': ['image/jpeg', 'image/png', 'image/webp'],
  'public-pages': ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
  videos: ['video/mp4', 'video/webm', 'video/quicktime'],
};
```

### Size Limits

```typescript
const SIZE_LIMITS = {
  images: 10 * 1024 * 1024, // 10 MB
  videos: 100 * 1024 * 1024, // 100 MB
  documents: 50 * 1024 * 1024, // 50 MB
};
```

---

## 📈 Expected Outcomes

### Data Integrity

- ✅ All images tracked in database with metadata
- ✅ Usage relationships documented
- ✅ Orphaned images identified and cleaned
- ✅ Soft delete support for recovery

### Performance

- ✅ Signed URL caching (1 hour TTL)
- ✅ Database indexes for fast lookups
- ✅ Lazy loading of image metadata
- ✅ 50ms average response time

### User Experience

- ✅ Drag-drop upload interface
- ✅ Progress indicators (chunked upload)
- ✅ Error messages with recovery options
- ✅ Image preview before save

### Admin Control

- ✅ Image gallery with search/filter
- ✅ Usage analytics (where images used)
- ✅ Automatic cleanup of old images
- ✅ Audit trail (who uploaded when)

---

## 🔗 Dependencies

### External Libraries (add to package.json)

```json
{
  "sharp": "^0.33.0", // Image metadata + resizing
  "ffprobe": "^1.1.1", // Video metadata
  "uuid": "^9.0.0", // Generate unique file paths
  "file-type": "^18.0.0" // Detect MIME types
}
```

### Prisma Relations

```
Image ← connected to → User (uploadedBy)
Image ← connected to → ImageUsage[] (usage tracking)
```

---

## 📝 Success Criteria

- [x] Image model created with metadata fields
- [x] ImageUsage model tracks relationships
- [ ] ImageService implemented with 10+ methods
- [ ] API routes created with RBAC
- [ ] All modules refactored to use ImageService
- [ ] Data migration completed (old URLs → Image records)
- [ ] Orphan detection and cleanup working
- [ ] Signed URL caching verified
- [ ] RLS policies enabled on Supabase
- [ ] Performance metrics acceptable (< 100ms)
- [ ] Security audit passed
- [ ] Documentation complete

---

## 📂 Files to Create/Modify

### Create (New Files)

```
src/lib/services/ImageService.ts          (400 lines)
src/lib/schemas/image.schema.ts           (100 lines)
src/app/api/admin/images/upload/route.ts  (100 lines)
src/app/api/admin/images/[id]/route.ts    (80 lines)
src/app/api/admin/images/orphaned/route.ts (80 lines)
src/components/forms/ImageUploadForm.tsx  (150 lines)
src/components/admin/ImageGallery.tsx     (200 lines)
prisma/migrations/[timestamp]_add_images.sql (50 lines)
```

### Modify (Existing Files)

```
prisma/schema.prisma
src/app/admin/courses/[id]/page.tsx       (add image upload)
src/app/admin/users/[id]/page.tsx         (add avatar upload)
src/app/admin/public-pages/[id]/page.tsx  (add banner/icon upload)
src/app/admin/lessons/[id]/page.tsx       (add video upload)
```

---

## 🎯 Next Steps

1. **Approval:** Review this plan with team
2. **Kickoff:** Assign DBMasterAI to Phase 2.1
3. **Database:** Create migration (2-4 hours)
4. **Service:** Implement ImageService (8 hours)
5. **API:** Create endpoints (4 hours)
6. **Frontend:** Build components (6 hours)
7. **Integration:** Refactor modules (8 hours)
8. **Testing:** Validate + cleanup (4 hours)

**Total Timeline:** 5-7 working days (8-15 January)

---

**Governança:** VisionVII Enterprise Governance 3.0  
**Pattern:** Service Pattern (logic in services, not routes)  
**Status:** Ready to Execute  
**Blocking Issues:** None
