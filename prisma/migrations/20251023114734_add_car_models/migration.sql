-- CreateTable
CREATE TABLE "CarFuelType" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Car" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "brand" TEXT NOT NULL,
    "licensePlate" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "fuelTypeId" INTEGER NOT NULL,
    "driverName" TEXT,
    CONSTRAINT "Car_fuelTypeId_fkey" FOREIGN KEY ("fuelTypeId") REFERENCES "CarFuelType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Car_licensePlate_key" ON "Car"("licensePlate");
