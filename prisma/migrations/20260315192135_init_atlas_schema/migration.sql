-- CreateTable
CREATE TABLE "AtlasItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'PAGE',
    "area" TEXT NOT NULL DEFAULT 'ATLAS',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "content" TEXT,
    "metadata" TEXT,
    "viewType" TEXT NOT NULL DEFAULT 'LIST',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#C8A45A'
);

-- CreateTable
CREATE TABLE "AtlasRelation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fromItemId" TEXT NOT NULL,
    "toItemId" TEXT NOT NULL,
    "relationType" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AtlasRelation_fromItemId_fkey" FOREIGN KEY ("fromItemId") REFERENCES "AtlasItem" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AtlasRelation_toItemId_fkey" FOREIGN KEY ("toItemId") REFERENCES "AtlasItem" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_AtlasItemTags" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_AtlasItemTags_A_fkey" FOREIGN KEY ("A") REFERENCES "AtlasItem" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_AtlasItemTags_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "_AtlasItemTags_AB_unique" ON "_AtlasItemTags"("A", "B");

-- CreateIndex
CREATE INDEX "_AtlasItemTags_B_index" ON "_AtlasItemTags"("B");
