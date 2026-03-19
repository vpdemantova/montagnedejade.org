-- CreateTable
CREATE TABLE "RSSFeed" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "url" TEXT NOT NULL,
    "label" TEXT NOT NULL DEFAULT '',
    "area" TEXT NOT NULL DEFAULT 'ATLAS',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "RSSItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "feedId" TEXT NOT NULL,
    "guid" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "summary" TEXT,
    "author" TEXT,
    "publishedAt" DATETIME NOT NULL,
    "cachedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RSSItem_feedId_fkey" FOREIGN KEY ("feedId") REFERENCES "RSSFeed" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "RSSFeed_url_key" ON "RSSFeed"("url");

-- CreateIndex
CREATE UNIQUE INDEX "RSSItem_guid_key" ON "RSSItem"("guid");
