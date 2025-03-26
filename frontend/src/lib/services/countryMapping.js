import { countries } from "@/components/ui/country-selector";

export const mapNationalityToCountryValue = (nationalityName) => {
  if (!nationalityName) return "";

  const normalizedName = nationalityName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "_");

  const matchedCountry = countries.find((country) =>
    country.label
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "_")
      .includes(normalizedName)
  );

  return matchedCountry ? matchedCountry.value : "";
};

export const mapCountryValueToNationalityName = (countryValue) => {
  const matchedCountry = countries.find(
    (country) => country.value === countryValue
  );
  return matchedCountry ? matchedCountry.label : "";
};
