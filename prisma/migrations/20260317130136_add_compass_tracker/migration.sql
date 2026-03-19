-- CreateTable
CREATE TABLE "StudyDiscipline" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL DEFAULT '',
    "professor" TEXT,
    "semester" TEXT NOT NULL DEFAULT '',
    "totalHours" INTEGER NOT NULL DEFAULT 60,
    "color" TEXT NOT NULL DEFAULT '#C8A45A',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "StudySession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "disciplineId" TEXT NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "durationMin" INTEGER NOT NULL DEFAULT 30,
    "note" TEXT,
    CONSTRAINT "StudySession_disciplineId_fkey" FOREIGN KEY ("disciplineId") REFERENCES "StudyDiscipline" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Goal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "horizon" TEXT NOT NULL DEFAULT 'short',
    "status" TEXT NOT NULL DEFAULT 'active',
    "dueDate" DATETIME,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
