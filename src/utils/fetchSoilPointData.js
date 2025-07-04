// Query SoilGrids v2 for pH (H₂O), organic‑C content (ocd, g kg‑1), clay %
export async function fetchSoilPointData(lat, lon) {
  const url =
    "https://rest.isric.org/soilgrids/v2.0/properties/query" +
    `?lon=${lon}&lat=${lat}` +
    "&property=ocd&property=phh2o&property=clay" +
    "&depth=0-5cm";

  const res = await fetch(url);
  if (!res.ok) throw new Error("SoilGrids request failed");
  const json = await res.json();

  const layer = json.properties?.layers?.[0]; // 0–5 cm
  return {
    pH:   layer?.values?.phh2o?.mean ?? null,
    ocd:  layer?.values?.ocd?.mean   ?? null,
    clay: layer?.values?.clay?.mean  ?? null,
  };
}
