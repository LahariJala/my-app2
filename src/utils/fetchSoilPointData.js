// utils/fetchSoilPointData.js
// Query SoilGrids v2 – pH (H₂O), organic‑carbon density, clay %
export async function fetchSoilPointData(lat, lon) {
  const url =
    "https://rest.isric.org/soilgrids/v2.0/properties/query" +
    `?lon=${lon}&lat=${lat}` +
    "&property=ocd&property=phh2o&property=clay" +
    "&depth=0-5cm";       // single shallow layer

  const res = await fetch(url);
  if (!res.ok) throw new Error(`SoilGrids request failed (${res.status})`);
  const json = await res.json();

  // SoilGrids returns one layer object per property
  const out = { pH: null, ocd: null, clay: null };

  json.properties?.layers?.forEach(layer => {
    const factor = layer.unit_measure?.d_factor ?? 1;      // e.g. 10
    const mean   = layer.depths?.[0]?.values?.mean ?? null; // 0‑5 cm
    if (mean == null) return;

    switch (layer.name) {
      case "phh2o": out.pH   = mean / factor; break; // e.g. 73 → 7.3
      case "ocd":   out.ocd  = mean / factor; break; // g kg‑¹
      case "clay":  out.clay = mean / factor; break; // %
      default:
    }
  });

  return out;   // { pH: 7.3, ocd: 17.1, clay: 42.2 }
}
