-- CreateTable
CREATE TABLE "DailyEntry" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" TEXT NOT NULL,
    "steps" INTEGER,
    "caloriesBurned" INTEGER,
    "strain" REAL,
    "readiness" TEXT,
    "insights" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "StravaAuth" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "expiresAt" INTEGER NOT NULL,
    "lastSync" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Workout" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "providerActivityId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "startDateLocal" DATETIME NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "distance" REAL,
    "elevation" REAL,
    "averageHeartrate" REAL,
    "rawData" TEXT,
    "dailyEntryId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Workout_dailyEntryId_fkey" FOREIGN KEY ("dailyEntryId") REFERENCES "DailyEntry" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "DailyEntry_date_key" ON "DailyEntry"("date");

-- CreateIndex
CREATE UNIQUE INDEX "Workout_providerActivityId_key" ON "Workout"("providerActivityId");

-- CreateIndex
CREATE INDEX "Workout_date_idx" ON "Workout"("date");
