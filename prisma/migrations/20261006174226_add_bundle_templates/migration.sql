-- CreateTable
CREATE TABLE "BundleTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BundleTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BundleTemplateItem" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sku" TEXT,
    "attributes" JSONB DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BundleTemplateItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BundleTemplateItem_templateId_idx" ON "BundleTemplateItem"("templateId");

-- AddForeignKey
ALTER TABLE "BundleTemplateItem" ADD CONSTRAINT "BundleTemplateItem_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "BundleTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
