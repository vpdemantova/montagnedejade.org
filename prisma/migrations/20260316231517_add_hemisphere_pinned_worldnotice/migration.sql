-- CreateTable
CREATE TABLE "WorldNotice" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'AVISO',
    "area" TEXT NOT NULL DEFAULT 'ATLAS',
    "author" TEXT,
    "sourceUrl" TEXT,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AtlasItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'PAGE',
    "area" TEXT NOT NULL DEFAULT 'ATLAS',
    "hemisphere" TEXT NOT NULL DEFAULT 'PORTAL',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "isFavorite" BOOLEAN NOT NULL DEFAULT false,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "content" TEXT,
    "contentPath" TEXT,
    "metadata" TEXT,
    "viewType" TEXT NOT NULL DEFAULT 'LIST',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_AtlasItem" ("area", "content", "createdAt", "id", "metadata", "status", "title", "type", "updatedAt", "viewType") SELECT "area", "content", "createdAt", "id", "metadata", "status", "title", "type", "updatedAt", "viewType" FROM "AtlasItem";
DROP TABLE "AtlasItem";
ALTER TABLE "new_AtlasItem" RENAME TO "AtlasItem";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
