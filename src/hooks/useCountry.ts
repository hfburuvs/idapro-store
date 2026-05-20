import { useLocation, useParams, useNavigate } from "react-router";
import { useCallback, useMemo } from "react";
import { getCountryFromPath, t, type CountryCode, DEFAULT_COUNTRY, countryConfig, getPath } from "@/lib/i18n";

export function useCountry() {
  const location = useLocation();
  const params = useParams<{ country?: string }>();
  const navigate = useNavigate();

  const country: CountryCode = useMemo(() => {
    // Accept any 2-letter path param as a country code
    if (params.country && /^[a-z]{2}$/i.test(params.country)) {
      return params.country.toLowerCase();
    }
    return getCountryFromPath(location.pathname);
  }, [params.country, location.pathname]);

  const isDefault = country === DEFAULT_COUNTRY;
  const config = countryConfig[country] || countryConfig[DEFAULT_COUNTRY];

  const translate = useCallback(
    (key: string) => t(country, key),
    [country]
  );

  // Build a localized path
  const path = useCallback(
    (p: string) => getPath(country, p),
    [country]
  );

  // Switch to another country
  const switchCountry = useCallback(
    (newCountry: CountryCode) => {
      const currentPath = location.pathname;
      // Remove existing country prefix (any 2-letter code)
      const pathWithoutCountry = currentPath.replace(/^\/[a-z]{2}\b/i, "").replace(/\/$/, "") || "/";
      const newPath = newCountry === DEFAULT_COUNTRY ? pathWithoutCountry : `/${newCountry}${pathWithoutCountry}`;
      navigate(newPath);
    },
    [location.pathname, navigate]
  );

  return { country, isDefault, config, t: translate, path, switchCountry };
}
