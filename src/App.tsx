import { useMemo, useState } from "react";
import { CASES, COUNTIES, STATE_GROWTH, UNITY_DENIED, type CrackingCase, type Group } from "./data";
import { CountyMap } from "./CountyMap";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  LabelList,
} from "recharts";

const COUNTY_ORDER: (keyof typeof COUNTIES)[] = ["gwinnett", "hall", "cobb", "forsyth", "whitfield"];

const GROUP_LABEL: Record<Group, string> = {
  latino: "Latino",
  aapi: "AAPI",
  black: "Black",
  white: "White",
  poc: "POC",
};

function caseCount(county: string): number {
  return CASES.filter((c) => c.county === county).length;
}

function Logo() {
  // Geometric mark: a square being cracked diagonally (the visual idea of redistricting)
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" aria-label="Cracking logo" fill="none">
      <rect x="2" y="2" width="32" height="32" stroke="currentColor" strokeWidth="2" />
      <line x1="2" y1="2" x2="34" y2="34" stroke="currentColor" strokeWidth="2" />
      <line x1="18" y1="2" x2="2" y2="18" stroke="#A9CBE0" strokeWidth="2" />
      <line x1="34" y1="18" x2="18" y2="34" stroke="#A9CBE0" strokeWidth="2" />
    </svg>
  );
}

function CaseCard({ c }: { c: CrackingCase }) {
  return (
    <article className={`case sev-${c.severity}`}>
      <div className="case-head">
        <div>
          <div className="eyebrow">{c.level}</div>
          <div className="dist tabular">{c.district}</div>
        </div>
        <span className={`case-type t-${c.type}`}>{c.type.replace("-", " ")}</span>
      </div>

      <h3>{c.headline}</h3>
      <p className="detail">{c.detail}</p>

      <div className="affects" aria-label="Communities affected">
        {c.affects.map((g) => (
          <span key={g} className={`chip ${g}`}>
            {GROUP_LABEL[g]}
          </span>
        ))}
      </div>

      {c.metrics.length > 0 && (
        <div className="metrics">
          {c.metrics.map((m, i) => (
            <div className="metric" key={i}>
              <div className="v tabular">{m.value ?? `${m.before} → ${m.after}`}</div>
              <div className="l">{m.label}</div>
            </div>
          ))}
        </div>
      )}

      <div className="case-foot">
        <span className="geo">{c.geography.join(" · ")}</span>
        <a href={c.source.url} target="_blank" rel="noreferrer">
          {c.source.label} ↗
        </a>
      </div>
    </article>
  );
}

function CountyDemographics({ key_: ck }: { key_: keyof typeof COUNTIES }) {
  const c = COUNTIES[ck];
  const rows: { key: Group; pct: number }[] = [
    { key: "white", pct: c.shares.white },
    { key: "black", pct: c.shares.black },
    { key: "latino", pct: c.shares.latino },
    { key: "aapi", pct: c.shares.aapi },
  ];
  const max = Math.max(...rows.map((r) => r.pct));
  return (
    <section className="demo-block">
      <div>
        <div className="eyebrow">{c.name} County · 2020 population</div>
        <h3 className="tabular">{c.pop2020.toLocaleString()} residents</h3>
        <p className="note">{c.note}</p>
        <div style={{ marginTop: 16 }}>
          {rows.map((r) => (
            <div className="bar-row" key={r.key}>
              <div className="gname">{GROUP_LABEL[r.key]}</div>
              <div className="bar-track">
                <div
                  className={`bar-fill ${r.key}`}
                  style={{ width: `${(r.pct / Math.max(max, 50)) * 100}%` }}
                />
              </div>
              <div className="pct">{r.pct.toFixed(1)}%</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ borderLeft: "1px solid var(--rule)", paddingLeft: 28 }}>
        <div className="eyebrow">Cracking cases documented</div>
        <div
          style={{
            fontFamily: "var(--serif)",
            fontSize: 64,
            lineHeight: 1,
            marginTop: 8,
            color: "var(--accent)",
          }}
          className="tabular"
        >
          {caseCount(ck)}
        </div>
        <p className="note" style={{ marginTop: 8 }}>
          Distinct documented cracking, packing, dilution, or fake-majority cases in the 2021 GA enacted maps.
        </p>
      </div>
    </section>
  );
}

function GrowthChart() {
  const data = [
    { group: "White", pct: STATE_GROWTH.white, color: "#BFBEB9" },
    { group: "Black", pct: STATE_GROWTH.black, color: "#1F3A5F" },
    { group: "Latino", pct: STATE_GROWTH.latino, color: "#A84B2F" },
    { group: "AAPI", pct: STATE_GROWTH.aapi, color: "#3D7B89" },
  ];
  return (
    <div style={{ width: "100%", height: 260 }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 24, right: 24, left: 8, bottom: 8 }}>
          <CartesianGrid stroke="#E4E2DC" strokeDasharray="2 4" vertical={false} />
          <XAxis
            dataKey="group"
            stroke="#6B6A66"
            tick={{ fontSize: 13, fontFamily: "inherit", fontWeight: 600 }}
            axisLine={{ stroke: "#E4E2DC" }}
            tickLine={false}
          />
          <YAxis
            stroke="#6B6A66"
            tick={{ fontSize: 12, fontFamily: "inherit" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}%`}
          />
          <Bar dataKey="pct" radius={[3, 3, 0, 0]}>
            {data.map((d, i) => (
              <Cell key={i} fill={d.color} />
            ))}
            <LabelList
              dataKey="pct"
              position="top"
              formatter={((v: unknown) => {
                const n = Number(v);
                return `${n > 0 ? "+" : ""}${n.toFixed(1)}%`;
              }) as never}
              style={{ fontFamily: "inherit", fontSize: 14, fontWeight: 700, fill: "#1F3A5F" }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

type GroupFilter = "all" | "latino" | "aapi";
type LevelFilter = "all" | "Congressional" | "State Senate" | "State House" | "County Commission";

export default function App() {
  const [countyKey, setCountyKey] = useState<keyof typeof COUNTIES | "all">("all");
  const [groupFilter, setGroupFilter] = useState<GroupFilter>("all");
  const [levelFilter, setLevelFilter] = useState<LevelFilter>("all");

  const filtered = useMemo(() => {
    return CASES.filter((c) => {
      if (countyKey !== "all" && c.county !== countyKey) return false;
      if (groupFilter !== "all" && !c.affects.includes(groupFilter)) return false;
      if (levelFilter !== "all" && c.level !== levelFilter) return false;
      return true;
    });
  }, [countyKey, groupFilter, levelFilter]);

  const totalLatino = CASES.filter((c) => c.affects.includes("latino")).length;
  const totalAAPI = CASES.filter((c) => c.affects.includes("aapi")).length;

  return (
    <div className="shell">
      {/* Masthead */}
      <header className="masthead">
        <Logo />
        <div className="logo">After Callais GA: Cracking Atlas</div>
        <div className="meta">
          <div><strong>Steering committee briefing</strong></div>
          <div>Common Cause GA · Coalition for Redistricting</div>
          <div>Updated May 2026 · Special session Jun 17, 2026</div>
        </div>
      </header>

      {/* Hero */}
      <section className="hero">
        <div>
          <div className="eyebrow" style={{ marginBottom: 12 }}>The 2021 receipts</div>
          <h1>
            Latino and AAPI Georgians were targeted in the last redraw.{" "}
            <em>The 2026 maps will be drawn over the same fault lines.</em>
          </h1>
          <p className="deck">
            Georgia's 2021 enacted maps cracked, packed, and diluted Latino and AAPI communities
            across five counties (Gwinnett, Hall, Cobb, Forsyth, and Whitfield), even though those
            groups drove nearly all of the state's population growth. The 2023 court-ordered
            remedial map then dismantled Gwinnett's coalition district to preserve the GOP's seat
            count. This dashboard documents the cases, district by district.
          </p>
        </div>
        <div className="kpi-strip">
          <div className="kpi accent">
            <div className="label">Documented cases</div>
            <div className="value tabular">{CASES.length}</div>
            <div className="sub">across 5 counties, 4 redistricting levels</div>
          </div>
          <div className="kpi">
            <div className="label">Cases affecting Latino voters</div>
            <div className="value tabular">{totalLatino}</div>
            <div className="sub">cracking, packing, fake-majority</div>
          </div>
          <div className="kpi">
            <div className="label">Cases affecting AAPI voters</div>
            <div className="value tabular">{totalAAPI}</div>
            <div className="sub">dilution and denied opportunity</div>
          </div>
          <div className="kpi">
            <div className="label">AAPI growth, 2010–2020</div>
            <div className="value tabular" style={{ color: "var(--c-aapi)" }}>+52.3%</div>
            <div className="sub">Fastest-growing group in Georgia</div>
          </div>
        </div>
      </section>

      {/* Growth context */}
      <section className="section">
        <div className="eyebrow">The growth that wasn't represented</div>
        <h2>Communities of color drove nearly all of Georgia's growth. New maps drew them out.</h2>
        <p className="lede">
          Between 2010 and 2020 Georgia's White population shrank by 4%, while AAPI and Latino
          populations grew by 52% and 32% respectively. Despite this, the enacted maps created zero
          new AAPI opportunity districts and no new performing Latino districts.
        </p>

        <div className="growth-wrap">
          <GrowthChart />
          <div className="growth-copy">
            <h3>Population change by group, 2010–2020</h3>
            <p>
              Source: 2020 Decennial Census, cited in the Lawyers' Committee complaint against
              Georgia's 2021 enacted plans.
            </p>
            <p>
              The proposed{" "}
              <a
                href="https://galeo.org/georgia-unity-maps/"
                target="_blank"
                rel="noreferrer"
              >
                Unity Maps
              </a>{" "}
              from NAACP, GALEO, People's Agenda and the Urban League included an AAPI opportunity
              Senate district and a Latino Senate district. Neither was adopted.
            </p>
          </div>
        </div>
      </section>

      {/* County selector */}
      <section className="section">
        <div className="eyebrow">Filter by county</div>
        <h2>Cracking by county <span className="count">{filtered.length} of {CASES.length} cases shown</span></h2>
        <p className="lede">
          Five counties carry the bulk of Georgia's Latino and AAPI population, and the bulk of the
          documented cracking. Select a county to focus.
        </p>

        <div className="county-bar" role="tablist">
          <button
            className={`county-pill ${countyKey === "all" ? "active" : ""}`}
            onClick={() => setCountyKey("all")}
            aria-pressed={countyKey === "all"}
          >
            All counties <span className="small">{CASES.length}</span>
          </button>
          {COUNTY_ORDER.map((k) => (
            <button
              key={k}
              className={`county-pill ${countyKey === k ? "active" : ""}`}
              onClick={() => setCountyKey(k)}
              aria-pressed={countyKey === k}
            >
              {COUNTIES[k].name} <span className="small">{caseCount(k)}</span>
            </button>
          ))}
        </div>

        {countyKey !== "all" && (
          <>
            <CountyDemographics key_={countyKey} />
            <CountyMap countyKey={countyKey} />
          </>
        )}

        {/* Secondary filters */}
        <div className="filters">
          <div className="filter-group">
            <span className="lab">Community</span>
            {(["all", "latino", "aapi"] as GroupFilter[]).map((g) => (
              <button
                key={g}
                className={`filter-btn ${groupFilter === g ? "active" : ""}`}
                onClick={() => setGroupFilter(g)}
              >
                {g === "all" ? "All" : GROUP_LABEL[g]}
              </button>
            ))}
          </div>
          <div className="filter-group">
            <span className="lab">Level</span>
            {(["all", "Congressional", "State Senate", "State House", "County Commission"] as LevelFilter[]).map(
              (l) => (
                <button
                  key={l}
                  className={`filter-btn ${levelFilter === l ? "active" : ""}`}
                  onClick={() => setLevelFilter(l)}
                >
                  {l === "all" ? "All" : l}
                </button>
              )
            )}
          </div>
        </div>

        <div className="card-grid">
          {filtered.map((c) => (
            <CaseCard key={c.id} c={c} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{
            padding: 40,
            textAlign: "center",
            border: "1px dashed var(--rule)",
            color: "var(--ink-muted)",
            fontFamily: "var(--serif)",
            fontSize: 18,
          }}>
            No cases match these filters.
          </div>
        )}
      </section>

      {/* Unity denied */}
      <section className="section">
        <div className="unity">
          <div className="eyebrow" style={{ color: "rgba(251,248,242,0.7)" }}>What could have been drawn</div>
          <h3>The Unity Maps coalition proposed two new opportunity districts. Neither was adopted.</h3>
          <p className="lede">
            In October 2021, the NAACP State Conference, GALEO Latino Community Development Fund,
            Georgia Coalition for the People's Agenda, and the Urban League of Greater Atlanta
            jointly published proposed maps that would have unpacked over-concentrated districts
            and drawn new opportunity districts for AAPI and Latino communities. The Joint
            Reapportionment Committee rejected them.
          </p>
          <div className="unity-grid">
            {UNITY_DENIED.map((u) => (
              <div className="unity-item" key={u.title}>
                <div className="t">{u.title}</div>
                <div className="w">{u.where}</div>
                <div className="s">{u.status}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer / methodology */}
      <footer className="foot">
        <div>
          <h4>Methodology</h4>
          <p>
            Cases are drawn from the Lawyers' Committee for Civil Rights Under Law complaint filed
            December 30, 2021 against Georgia's enacted Congressional, State Senate, and State
            House plans, with additional context from the 2023 NPR coverage of the post-Alpha Phi
            Alpha remedial maps and contemporaneous county-commission reporting. Demographic
            baselines are from the 2020 Decennial Census via Census.gov QuickFacts. Each case
            preserves the original district identifiers, demographic metrics, and named geographies
            from the source documents. Severity weighting reflects the magnitude of the change to
            voting-age population or coalition district status.
          </p>
        </div>
        <div>
          <h4>Sources</h4>
          <ul>
            <li>
              <a
                href="https://www.lawyerscommittee.org/wp-content/uploads/2021/12/GA-Redistricting-Compl.-filed.pdf"
                target="_blank"
                rel="noreferrer"
              >
                Lawyers' Committee complaint (Dec 30, 2021)
              </a>
            </li>
            <li>
              <a
                href="https://www.npr.org/2023/12/20/1220384013/georgia-redistricting-voting-rights-act-coalition-districts"
                target="_blank"
                rel="noreferrer"
              >
                NPR: Georgia's coalition districts (Dec 20, 2023)
              </a>
            </li>
            <li>
              <a href="https://galeo.org/georgia-unity-maps/" target="_blank" rel="noreferrer">
                GALEO Unity Maps (Oct 28, 2021)
              </a>
            </li>
            <li>
              <a
                href="https://theatlantavoice.com/republicans-take-cobb-and-gwinnett-redistricting-fights-to-the-state-capitol/"
                target="_blank"
                rel="noreferrer"
              >
                Atlanta Voice: Cobb and Gwinnett commission maps (Feb 2022)
              </a>
            </li>
            <li>
              <a
                href="https://33n.atlantaregional.com/friday-factday/examining-change-in-the-11-county-area-2010-2020"
                target="_blank"
                rel="noreferrer"
              >
                Atlanta Regional Commission: 11-county demographic change (2021)
              </a>
            </li>
            <li>
              <a
                href="https://www.census.gov/quickfacts/fact/table/whitfieldcountygeorgia/PST045224"
                target="_blank"
                rel="noreferrer"
              >
                Census QuickFacts: county-level demographics
              </a>
            </li>
          </ul>
          <p style={{ marginTop: 16, fontSize: 12, color: "var(--ink-faint)" }}>
            Built for the GA redistricting coalition steering committee, May 2026. Not legal advice.
          </p>
        </div>
      </footer>
    </div>
  );
}
