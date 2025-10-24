import { useState, useMemo } from "react";
import { useLoaderData } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export const loader = async ({ request }) => {
  await authenticate.admin(request);

  const cars = await prisma.car.findMany({
    include: { fuelType: true },
    orderBy: { id: 'asc' },
  });

  const fuelTypes = await prisma.carFuelType.findMany({
    orderBy: { name: 'asc' },
  });

  return { cars, fuelTypes };
};

export default function Cars() {
  const { cars, fuelTypes } = useLoaderData();
  const [searchValue, setSearchValue] = useState("");
  const [sortField, setSortField] = useState("id");
  const [sortDirection, setSortDirection] = useState("asc");
  const [selectedFuelTypes, setSelectedFuelTypes] = useState([]);

  const filteredAndSortedCars = useMemo(() => {
    let filtered = cars;

    if (searchValue) {
      const searchLower = searchValue.toLowerCase();
      filtered = filtered.filter(car => 
        car.brand.toLowerCase().includes(searchLower) ||
        car.licensePlate.toLowerCase().includes(searchLower) ||
        car.driverName?.toLowerCase().includes(searchLower) ||
        car.fuelType.name.toLowerCase().includes(searchLower) ||
        car.year.toString().includes(searchLower)
      );
    }

    if (selectedFuelTypes.length > 0) {
      filtered = filtered.filter(car => 
        selectedFuelTypes.includes(car.fuelType.name)
      );
    }

    filtered.sort((a, b) => {
      let aValue, bValue;
      switch (sortField) {
        case "brand": aValue = a.brand; bValue = b.brand; break;
        case "licensePlate": aValue = a.licensePlate; bValue = b.licensePlate; break;
        case "year": aValue = a.year; bValue = b.year; break;
        case "driverName": aValue = a.driverName || ""; bValue = b.driverName || ""; break;
        case "fuelType": aValue = a.fuelType.name; bValue = b.fuelType.name; break;
        default: aValue = a.id; bValue = b.id;
      }

      if (typeof aValue === "string") return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
    });

    return filtered;
  }, [cars, searchValue, sortField, sortDirection, selectedFuelTypes]);

  const handleSort = (field) => {
    if (sortField === field) setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDirection("asc"); }
  };

  const handleFuelTypeFilter = (fuelType) => {
    setSelectedFuelTypes(prev => 
      prev.includes(fuelType) ? prev.filter(f => f !== fuelType) : [...prev, fuelType]
    );
  };

  const clearFilters = () => {
    setSearchValue("");
    setSelectedFuelTypes([]);
  };

  return (
    <s-page heading="Cars Management">
      <s-section padding="loose">
        <s-stack direction="inline" gap="base" align="center" wrap>
          <s-text-field
            labelHidden
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search by brand, license plate, driver, fuel, year..."
            clearButton
            size="large"
            inline
          />

          <s-button onClick={clearFilters} variant="secondary" size="large">
            Clear filters
          </s-button>

          <s-stack direction="inline" gap="extraTight" align="center" wrap>
            {fuelTypes.map((fuelType) => (
              <s-button
                key={fuelType.id}
                variant={selectedFuelTypes.includes(fuelType.name) ? "primary" : "tertiary"}
                onClick={() => handleFuelTypeFilter(fuelType.name)}
                size="slim"
              >
                {fuelType.name}
              </s-button>
            ))}
          </s-stack>

          <s-text variant="subdued" fontStyle="italic" size="small">
            Showing {filteredAndSortedCars.length} of {cars.length} cars
          </s-text>
        </s-stack>
      </s-section>

      <s-section padding="loose">
        <s-index-table
          headings={[
            { content: "ID", onSort: () => handleSort("id") },
            { content: "Brand", onSort: () => handleSort("brand") },
            { content: "License Plate", onSort: () => handleSort("licensePlate") },
            { content: "Year", onSort: () => handleSort("year") },
            { content: "Driver Name", onSort: () => handleSort("driverName") },
            { content: "Fuel Type", onSort: () => handleSort("fuelType") },
          ]}
          itemCount={filteredAndSortedCars.length}
          zebraStriped
        >
          {filteredAndSortedCars.map((car) => (
            <s-index-table-row key={car.id}>
              <s-index-table-cell>
                <s-text variant="bodyMd" fontWeight="semibold">{car.id}</s-text>
              </s-index-table-cell>
              <s-index-table-cell>
                <s-text variant="bodyMd">{car.brand}</s-text>
              </s-index-table-cell>
              <s-index-table-cell>
                <s-text variant="bodyMd" fontWeight="semibold">{car.licensePlate}</s-text>
              </s-index-table-cell>
              <s-index-table-cell>
                <s-text variant="bodyMd">{car.year}</s-text>
              </s-index-table-cell>
              <s-index-table-cell>
                <s-text variant="bodyMd">{car.driverName || "—"}</s-text>
              </s-index-table-cell>
              <s-index-table-cell>
                <s-badge tone={
                  car.fuelType.name === "Electric" ? "success" :
                  car.fuelType.name === "Diesel" ? "warning" :
                  car.fuelType.name === "Petrol" ? "info" : "subdued"
                }>
                  {car.fuelType.name}
                </s-badge>
              </s-index-table-cell>
            </s-index-table-row>
          ))}
        </s-index-table>

        {filteredAndSortedCars.length === 0 && (
          <s-empty-state
            heading="No cars found"
            image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
            layout="centered"
          >
            <s-text variant="bodyMd" size="small">
              {searchValue || selectedFuelTypes.length > 0
                ? "Try adjusting your search or filters"
                : "No cars have been added yet"}
            </s-text>
          </s-empty-state>
        )}
      </s-section>
    </s-page>
  );
}

export const headers = (headersArgs) => boundary.headers(headersArgs);
