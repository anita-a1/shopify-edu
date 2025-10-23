import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 1. Populate CarFuelType
  const fuelTypes = ['Petrol', 'Diesel', 'Electric', 'Hybrid'];

  const fuelTypeRecords = [];
  for (const name of fuelTypes) {
    const record = await prisma.carFuelType.create({
      data: { name },
    });
    fuelTypeRecords.push(record);
  }

  // 2. Populate Cars
  const cars = [
    { brand: 'Toyota', licensePlate: 'ABC123', year: 2019, fuelTypeName: 'Petrol' },
    { brand: 'Tesla', licensePlate: 'TESLA1', year: 2021, fuelTypeName: 'Electric' },
    { brand: 'Ford', licensePlate: 'FORD22', year: 2018, fuelTypeName: 'Diesel' },
    { brand: 'Honda', licensePlate: 'HONDA7', year: 2020, fuelTypeName: 'Hybrid' },
  ];

  for (const car of cars) {
    const fuelType = fuelTypeRecords.find(ft => ft.name === car.fuelTypeName);
    if (!fuelType) continue;

    await prisma.car.create({
      data: {
        brand: car.brand,
        licensePlate: car.licensePlate,
        year: car.year,
        fuelTypeId: fuelType.id,
        driverName: null, // optional
      },
    });
  }

  console.log('Seed finished.');
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
