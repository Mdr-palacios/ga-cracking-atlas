import { useEffect, useRef, useState } from "react";
import { CASES, type CrackingCase } from "./data";

// Leaflet is loaded as a side-effect import below. We use `any` for L to avoid
// pulling in heavy types at build time (we typed only what we touch).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LMap = any;

type LayerKey = "cd" | "sldu" | "sldl";

type Feature = {
  type: "Feature";
  properties: {
    layer: "county" | LayerKey;
    district?: string;
    NAMELSAD?: string;
  };
  geometry: GeoJSON.Geometry;
};

type GeoBundle = {
  type: "FeatureCollection";
  bbox: [number, number, number, number];
  properties: { county_key: string; county_name: string; county_fips: string };
  features: Feature[];
};

const LAYER_INFO: Record<LayerKey, { label: string; short: string }> = {
  cd: { label: "U.S. Congress (119th, post-Alpha Phi Alpha remedial)", short: "Congressional" },
  sldu: { label: "State Senate (2021 enacted plan)", short: "State Senate" },
  sldl: { label: "State House (2021 enacted plan)", short: "State House" },
};

// Distinct color cycle for districts, picked to read on the warm cream basemap.
const PALETTE = [
  "#A84B2F", "#3D7B89", "#1F3A5F", "#C28A2B", "#7A5410",
  "#5B3A7A", "#C97B8A", "#6B6A66", "#14263F", "#9F2D2D",
  "#3F6B3F", "#7E5832", "#456F8C",
];

/**
 * Extract numeric district IDs that the case implicates, per layer.
 * Used to highlight which polygons the case is *about*.
 */
function caseDistrictsByLayer(c: CrackingCase): Partial<Record<LayerKey, string[]>> {
  const out: Partial<Record<LayerKey, string[]>> = {};
  const txt = c.district;
  const nums = (re: RegExp) =>
    Array.from(txt.matchAll(re)).map((m) => String(parseInt(m[1], 10)));

  if (c.level === "Congressional") {
    out.cd = nums(/CD-?(\d+)/gi);
  } else if (c.level === "State Senate") {
    out.sldu = nums(/SD-?(\d+)/gi);
  } else if (c.level === "State House") {
    out.sldl = nums(/HD-?(\d+)/gi);
  }
  return out;
}

export function CountyMap({ countyKey }: { countyKey: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LMap | null>(null);
  const [bundle, setBundle] = useState<GeoBundle | null>(null);
  const [layer, setLayer] = useState<LayerKey>("sldl");
  const [hover, setHover] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Cases for this county, with the districts they implicate.
  const countyCases = CASES.filter((c) => c.county === countyKey);
  const highlights = (() => {
    const set: Record<LayerKey, Set<string>> = { cd: new Set(), sldu: new Set(), sldl: new Set() };
    for (const c of countyCases) {
      const ds = caseDistrictsByLayer(c);
      (Object.keys(ds) as LayerKey[]).forEach((k) => ds[k]!.forEach((d) => set[k].add(d)));
    }
    return set;
  })();

  // Default to the layer with the most case-implicated districts.
  useEffect(() => {
    const counts: [LayerKey, number][] = [
      ["sldl", highlights.sldl.size],
      ["sldu", highlights.sldu.size],
      ["cd", highlights.cd.size],
    ];
    counts.sort((a, b) => b[1] - a[1]);
    if (counts[0][1] > 0) setLayer(counts[0][0]);
    else setLayer("sldl");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countyKey]);

  // Load the GeoJSON bundle for the county.
  useEffect(() => {
    setBundle(null);
    setLoadError(null);
    const base = (import.meta as { env: { BASE_URL: string } }).env.BASE_URL || "/";
    const url = `${base}geo/${countyKey}.json`;
    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((b: GeoBundle) => setBundle(b))
      .catch((e: Error) => setLoadError(e.message));
  }, [countyKey]);

  // Render with Leaflet.
  useEffect(() => {
    if (!bundle || !containerRef.current) return;
    let cancelled = false;

    (async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const L: any = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");
      if (cancelled) return;

      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      const [minx, miny, maxx, maxy] = bundle.bbox;
      const map = L.map(containerRef.current!, {
        zoomControl: true,
        attributionControl: true,
        scrollWheelZoom: false,
        preferCanvas: true,
      });
      map.fitBounds([
        [miny, minx],
        [maxy, maxx],
      ], { padding: [12, 12] });
      mapRef.current = map;

      // Light basemap tiles (CartoDB Positron, free / OSM-based, neutral look)
      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        subdomains: "abcd",
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        maxZoom: 16,
      }).addTo(map);

      const districtFeatures = bundle.features.filter((f) => f.properties.layer === layer);
      const highlightedSet = highlights[layer];

      // Color per district id
      const colorFor = (district: string) => {
        const idx = (parseInt(district, 10) || 0) % PALETTE.length;
        return PALETTE[idx];
      };

      const districtLayer = L.geoJSON(
        { type: "FeatureCollection", features: districtFeatures } as GeoJSON.FeatureCollection,
        {
          style: (f: { properties?: Feature["properties"] }) => {
            const d = f.properties?.district ?? "";
            const flagged = highlightedSet.has(d);
            const base = colorFor(d);
            return {
              color: flagged ? "#14263F" : "#6B6A66",
              weight: flagged ? 2.5 : 1,
              opacity: 1,
              fillColor: base,
              fillOpacity: flagged ? 0.55 : 0.18,
              dashArray: flagged ? undefined : "2 3",
            };
          },
          onEachFeature: (f: Feature, lyr: { on: (e: string, h: () => void) => void; bindTooltip: (s: string, o: object) => void; setStyle: (s: object) => void; bringToFront: () => void; bringToBack: () => void }) => {
            const d = f.properties.district ?? "";
            const flagged = highlightedSet.has(d);
            const labelPrefix =
              layer === "cd" ? "CD-" : layer === "sldu" ? "SD-" : "HD-";
            const districtLabel = `${labelPrefix}${d}`;
            const tip = flagged
              ? `<b>${districtLabel}</b><br/><span style="color:#A84B2F;font-weight:600">Documented cracking case</span>`
              : `${districtLabel}`;
            lyr.bindTooltip(tip, { sticky: true, direction: "top", className: "dist-tip" });
            lyr.on("mouseover", () => {
              setHover(districtLabel + (flagged ? " (case)" : ""));
              lyr.setStyle({ weight: 3.5, fillOpacity: flagged ? 0.7 : 0.45 });
              lyr.bringToFront();
            });
            lyr.on("mouseout", () => {
              setHover(null);
              districtLayer.resetStyle(lyr);
              // Keep county outline on top
              if (countyOutline) countyOutline.bringToFront();
            });
          },
        }
      ).addTo(map);

      // County outline drawn on top for legibility
      const countyFeats = bundle.features.filter((f) => f.properties.layer === "county");
      const countyOutline = L.geoJSON(
        { type: "FeatureCollection", features: countyFeats } as GeoJSON.FeatureCollection,
        {
          style: () => ({
            color: "#14263F",
            weight: 3,
            opacity: 1,
            fill: false,
          }),
          interactive: false,
        }
      ).addTo(map);
      countyOutline.bringToFront();
    })();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [bundle, layer, highlights, countyKey]);

  return (
    <div className="map-card">
      <div className="map-head">
        <div>
          <div className="eyebrow">How the maps slice this county</div>
          <h3>District boundaries over {bundle?.properties.county_name ?? "the county"}</h3>
        </div>
        <div className="map-tabs" role="tablist" aria-label="Map layer">
          {(["cd", "sldu", "sldl"] as LayerKey[]).map((k) => {
            const flagged = highlights[k].size;
            return (
              <button
                key={k}
                className={`map-tab ${layer === k ? "active" : ""}`}
                onClick={() => setLayer(k)}
                aria-pressed={layer === k}
                title={LAYER_INFO[k].label}
              >
                <span>{LAYER_INFO[k].short}</span>
                {flagged > 0 && <span className="badge">{flagged} flagged</span>}
              </button>
            );
          })}
        </div>
      </div>

      <div className="map-wrap">
        <div className="map-canvas" ref={containerRef} role="img"
             aria-label={`Map of ${bundle?.properties.county_name ?? "county"} districts at the ${LAYER_INFO[layer].short} level`}>
          {!bundle && !loadError && <div className="map-loading">Loading map…</div>}
          {loadError && <div className="map-loading">Map data unavailable: {loadError}</div>}
        </div>
        <div className="map-legend">
          <div className="leg-row">
            <span className="leg-swatch swatch-flagged" />
            <div>
              <div className="leg-title">Districts in documented cases</div>
              <div className="leg-sub">Solid fill, navy outline</div>
            </div>
          </div>
          <div className="leg-row">
            <span className="leg-swatch swatch-other" />
            <div>
              <div className="leg-title">Other districts touching the county</div>
              <div className="leg-sub">Faint fill, dashed outline</div>
            </div>
          </div>
          <div className="leg-row">
            <span className="leg-swatch swatch-outline" />
            <div>
              <div className="leg-title">County boundary</div>
              <div className="leg-sub">{bundle?.properties.county_name ?? ""} County</div>
            </div>
          </div>
          {hover && <div className="leg-hover">{hover}</div>}
          <div className="leg-note">
            {LAYER_INFO[layer].label}.<br />
            Source: U.S. Census TIGER/Line 2021 (state legislative) and 2024 (congressional).
          </div>
        </div>
      </div>
    </div>
  );
}
