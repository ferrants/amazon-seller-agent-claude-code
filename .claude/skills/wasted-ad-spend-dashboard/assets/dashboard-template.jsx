// Wasted Ad Spend Dashboard — Template
//
// To populate: replace the constants and the RAW array below. Connected mode
// fills them from the analyst responses (SKILL.md step 5); manual mode fills
// them from the uploaded report (references/manual-reports.md).
//
// RAW row schema: {
//   term: string,        // customer search term
//   campaign: string,    // top_campaign from analyst
//   impressions: number, // total impressions across matches
//   clicks: number,      // total clicks (≥5 by filter)
//   cost: number,        // total ad cost in the report's currency (no rounding)
//   ctr: number,         // clicks / impressions, as a decimal
//   cpc: number,         // cost / clicks
//   matches: string[],   // distinct match types: any of "EXACT","PHRASE","BROAD"
// }
//
// Do not modify the styling — the editorial-financial aesthetic is part of
// the skill and must stay in sync with fba-inventory-risk-dashboard.

import { useState, useMemo } from "react";
import { ArrowUp, ArrowDown, ChevronsUpDown, Search } from "lucide-react";

// ── REPLACE THESE ─────────────────────────────────────────────────────────────
const BRAND = "{{ BRAND_NAME }}";              // e.g., "Example Brand Name"
const MARKETPLACE = "{{ MARKETPLACE }}";        // e.g., "US Ads"
const SNAPSHOT = "{{ SNAPSHOT_UTC }}";          // e.g., "2026-05-11 · 15:35 UTC"
const WINDOW = "{{ DATE_WINDOW }}";             // e.g., "30D · 04-11 → 05-10"
const TOTAL_WASTED = 0;                         // e.g., 5787.33
const TOTAL_SPEND = 0;                          // e.g., 161796.77; null when no valid total exists (hides the %)
const WORST_TERM = "{{ WORST_TERM }}";          // e.g., "example product name gummies"
const SOURCE_LABEL = "Live";                    // "Live" (connected) or "Uploaded report" (manual)
const SOURCE = "sponsored_products_search_terms"; // report name (connected) or the uploaded file name(s)
const ATTRIBUTION = "14-day";                   // attribution window of the orders column; never relabel 7-day as 14-day
const SPEND_LABEL = "ad spend";                 // "ad spend", or "spend in this report" when the total comes from the search term file
const CURRENCY = "$";                           // currency symbol of the report, e.g., "€", "£"; no conversion
const TIERS = { critical: 100, high: 60 };      // cost thresholds in CURRENCY; re-anchor for other currencies or spend scales

const RAW = [
  // { term: "example product name gummies", campaign: "Example Product Line (Manual)",
  //   impressions: 4611, clicks: 49, cost: 177.34, ctr: 0.0106, cpc: 3.62,
  //   matches: ["EXACT", "PHRASE"] },
  // ... populate from analyst data field
];
// ──────────────────────────────────────────────────────────────────────────────

const palette = {
  bg: "#f4eee0",
  paper: "#fbf7ec",
  ink: "#1a1612",
  mute: "#7a6f5e",
  rule: "#d4cab3",
  oxblood: "#8a1c1c",
  amber: "#a86a16",
  olive: "#7a7320",
  forest: "#2c3a2c",
};

function tier(cost) {
  if (cost >= TIERS.critical) return { label: "CRITICAL", color: palette.oxblood };
  if (cost >= TIERS.high) return { label: "HIGH", color: palette.amber };
  return { label: "ELEVATED", color: palette.olive };
}

function Stat({ label, value, sub, last }) {
  return (
    <div
      className="flex flex-col gap-1 px-6 py-5"
      style={{ borderRight: last ? "none" : `1px solid ${palette.rule}` }}
    >
      <div
        className="text-xs uppercase tracking-widest"
        style={{ color: palette.mute, fontFamily: "'Geist Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace", letterSpacing: "0.18em" }}
      >
        {label}
      </div>
      <div
        className="text-4xl"
        style={{ fontFamily: "'Instrument Serif', Georgia, 'Times New Roman', serif", color: palette.ink, lineHeight: 1 }}
      >
        {value}
      </div>
      {sub && (
        <div className="text-xs" style={{ color: palette.mute, fontFamily: "'Geist', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif" }}>
          {sub}
        </div>
      )}
    </div>
  );
}

function SortHeader({ label, active, dir, onClick, align = "left" }) {
  const Icon = !active ? ChevronsUpDown : dir === "asc" ? ArrowUp : ArrowDown;
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 select-none"
      style={{
        color: active ? palette.ink : palette.mute,
        fontFamily: "'Geist Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
        fontSize: "10.5px",
        letterSpacing: "0.16em",
        textTransform: "uppercase",
        marginLeft: align === "right" ? "auto" : 0,
      }}
    >
      <span>{label}</span>
      <Icon size={12} strokeWidth={2} />
    </button>
  );
}

function MatchBadge({ type }) {
  const colorMap = {
    EXACT: palette.forest,
    PHRASE: palette.olive,
    BROAD: palette.amber,
  };
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 6px",
        marginRight: 4,
        fontFamily: "'Geist Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
        fontSize: "9px",
        letterSpacing: "0.1em",
        color: colorMap[type] || palette.mute,
        border: `1px solid ${colorMap[type] || palette.mute}`,
        background: "transparent",
        fontWeight: 500,
      }}
    >
      {type}
    </span>
  );
}

export default function WastedAdSpendDashboard() {
  const [sort, setSort] = useState({ key: "cost", dir: "desc" });
  const [query, setQuery] = useState("");

  const topThirtyWasted = useMemo(() => RAW.reduce((s, r) => s + r.cost, 0), []);
  const topThirtyClicks = useMemo(() => RAW.reduce((s, r) => s + r.clicks, 0), []);
  const criticalCount = useMemo(() => RAW.filter((r) => r.cost >= TIERS.critical).length, []);
  const longTailWasted = Math.max(0, TOTAL_WASTED - topThirtyWasted);
  const pctOfTotal = TOTAL_SPEND > 0 ? (TOTAL_WASTED / TOTAL_SPEND) * 100 : null;

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? RAW.filter(
          (r) =>
            r.term.toLowerCase().includes(q) ||
            r.campaign.toLowerCase().includes(q)
        )
      : RAW;
    const sorted = [...filtered].sort((a, b) => {
      const av = a[sort.key];
      const bv = b[sort.key];
      if (typeof av === "string") {
        return sort.dir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      return sort.dir === "asc" ? av - bv : bv - av;
    });
    return sorted;
  }, [sort, query]);

  const setSortKey = (key) => {
    setSort((cur) =>
      cur.key === key
        ? { key, dir: cur.dir === "asc" ? "desc" : "asc" }
        : { key, dir: key === "term" || key === "campaign" ? "asc" : "desc" }
    );
  };

  const maxCtr = RAW.length ? Math.max(...RAW.map((r) => r.ctr)) : 1;
  const maxCost = RAW.length ? Math.max(...RAW.map((r) => r.cost)) : 1;

  const fmtMoney = (n) =>
    CURRENCY + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: palette.bg, fontFamily: "'Geist', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif", color: palette.ink }}
    >
      <div className="max-w-6xl mx-auto px-6 py-10 md:px-12 md:py-14">
        <header
          className="pb-8 mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4"
          style={{ borderBottom: `2px solid ${palette.ink}` }}
        >
          <div>
            <div
              className="text-xs uppercase mb-3"
              style={{
                fontFamily: "'Geist Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
                letterSpacing: "0.24em",
                color: palette.oxblood,
              }}
            >
              ⏱ {SOURCE_LABEL} · {BRAND} · {MARKETPLACE}
            </div>
            <h1
              style={{
                fontFamily: "'Instrument Serif', Georgia, 'Times New Roman', serif",
                fontSize: "clamp(2.5rem, 5vw, 3.75rem)",
                lineHeight: 0.95,
                color: palette.ink,
                fontWeight: 400,
              }}
            >
              Ad Spend <em style={{ color: palette.oxblood }}>Waste</em>
            </h1>
            <p
              className="mt-3 max-w-xl"
              style={{ color: palette.mute, fontSize: "14px", lineHeight: 1.55 }}
            >
              Search terms generating clicks but zero conversions in the window shown.
              Sorted by total wasted spend — biggest leaks first.
            </p>
          </div>
          <div
            className="text-xs"
            style={{
              fontFamily: "'Geist Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
              color: palette.mute,
              letterSpacing: "0.08em",
              textAlign: "right",
            }}
          >
            <div>SNAPSHOT</div>
            <div style={{ color: palette.ink }}>{SNAPSHOT}</div>
            <div className="mt-2">WINDOW</div>
            <div style={{ color: palette.ink }}>{WINDOW}</div>
          </div>
        </header>

        <section
          className="grid grid-cols-2 md:grid-cols-4 mb-10"
          style={{ background: palette.paper, border: `1px solid ${palette.rule}` }}
        >
          <Stat
            label="Total wasted"
            value={fmtMoney(TOTAL_WASTED)}
            sub={
              pctOfTotal === null
                ? "Share of total spend not available"
                : `${pctOfTotal.toFixed(2)}% of ${CURRENCY}${(TOTAL_SPEND / 1000).toFixed(1)}K ${SPEND_LABEL}`
            }
          />
          <Stat
            label="Top 30 leakage"
            value={fmtMoney(topThirtyWasted)}
            sub={`${TOTAL_WASTED > 0 ? ((topThirtyWasted / TOTAL_WASTED) * 100).toFixed(0) : 0}% of waste · shown below`}
          />
          <Stat
            label="Long-tail bleed"
            value={fmtMoney(longTailWasted)}
            sub="Diffuse losses · beyond top 30"
          />
          <Stat
            label={`Critical · ≥ ${CURRENCY}${TIERS.critical}`}
            value={criticalCount}
            sub={`Worst: ${WORST_TERM}`}
            last
          />
        </section>

        <div className="flex items-center gap-3 mb-4">
          <div
            className="flex items-center gap-2 px-3 py-2 flex-1 max-w-md"
            style={{ background: palette.paper, border: `1px solid ${palette.rule}` }}
          >
            <Search size={14} style={{ color: palette.mute }} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter by search term or campaign…"
              className="flex-1 bg-transparent outline-none text-sm"
              style={{ color: palette.ink, fontFamily: "'Geist Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" }}
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="text-xs"
                style={{ color: palette.mute, fontFamily: "'Geist Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" }}
              >
                clear
              </button>
            )}
          </div>
          <div
            className="text-xs"
            style={{ color: palette.mute, fontFamily: "'Geist Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" }}
          >
            {rows.length} of {RAW.length} · {topThirtyClicks} clicks
          </div>
        </div>

        <div
          className="overflow-x-auto"
          style={{ background: palette.paper, border: `1px solid ${palette.rule}` }}
        >
          <table className="w-full" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: `1.5px solid ${palette.ink}` }}>
                <th className="px-4 py-3 text-left" style={{ width: "100px" }}>
                  <span
                    style={{
                      fontFamily: "'Geist Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
                      fontSize: "10.5px",
                      letterSpacing: "0.16em",
                      color: palette.mute,
                    }}
                  >
                    TIER
                  </span>
                </th>
                <th className="px-4 py-3 text-left">
                  <SortHeader
                    label="Search term"
                    active={sort.key === "term"}
                    dir={sort.dir}
                    onClick={() => setSortKey("term")}
                  />
                </th>
                <th className="px-4 py-3 text-left">
                  <SortHeader
                    label="Top campaign"
                    active={sort.key === "campaign"}
                    dir={sort.dir}
                    onClick={() => setSortKey("campaign")}
                  />
                </th>
                <th className="px-4 py-3 text-left" style={{ width: "120px" }}>
                  <span
                    style={{
                      fontFamily: "'Geist Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
                      fontSize: "10.5px",
                      letterSpacing: "0.16em",
                      color: palette.mute,
                    }}
                  >
                    MATCH
                  </span>
                </th>
                <th className="px-4 py-3 text-right">
                  <SortHeader
                    label="Clicks · CTR"
                    active={sort.key === "clicks"}
                    dir={sort.dir}
                    onClick={() => setSortKey("clicks")}
                    align="right"
                  />
                </th>
                <th className="px-4 py-3 text-right">
                  <SortHeader
                    label="Wasted spend"
                    active={sort.key === "cost"}
                    dir={sort.dir}
                    onClick={() => setSortKey("cost")}
                    align="right"
                  />
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => {
                const t = tier(r.cost);
                const intensity = r.ctr / maxCtr;
                return (
                  <tr
                    key={r.term + r.campaign}
                    style={{
                      borderBottom:
                        i === rows.length - 1 ? "none" : `1px dashed ${palette.rule}`,
                      background: r.cost >= TIERS.critical ? "rgba(138, 28, 28, 0.04)" : "transparent",
                    }}
                  >
                    <td className="px-4 py-3" style={{ verticalAlign: "middle" }}>
                      <div className="flex items-center gap-2">
                        <span
                          style={{
                            display: "inline-block",
                            width: 8,
                            height: 8,
                            borderRadius: 999,
                            background: t.color,
                          }}
                        />
                        <span
                          style={{
                            fontFamily: "'Geist Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
                            fontSize: "9.5px",
                            letterSpacing: "0.12em",
                            color: t.color,
                            fontWeight: 500,
                          }}
                        >
                          {t.label}
                        </span>
                      </div>
                    </td>
                    <td
                      className="px-4 py-3"
                      style={{
                        fontFamily: "'Geist Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
                        fontSize: "13px",
                        color: palette.ink,
                        fontWeight: 500,
                        maxWidth: "260px",
                      }}
                    >
                      {r.term}
                    </td>
                    <td
                      className="px-4 py-3"
                      style={{
                        fontFamily: "'Geist Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
                        fontSize: "11px",
                        color: palette.mute,
                        maxWidth: "200px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                      title={r.campaign}
                    >
                      {r.campaign}
                    </td>
                    <td className="px-4 py-3" style={{ verticalAlign: "middle" }}>
                      <div className="flex flex-wrap" style={{ rowGap: 3 }}>
                        {r.matches.map((m) => (
                          <MatchBadge key={m} type={m} />
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right" style={{ verticalAlign: "middle" }}>
                      <div className="flex items-center justify-end gap-2.5">
                        <div
                          style={{
                            width: 50,
                            height: 4,
                            background: palette.rule,
                            position: "relative",
                          }}
                          title={`CTR ${(r.ctr * 100).toFixed(2)}%`}
                        >
                          <div
                            style={{
                              position: "absolute",
                              left: 0,
                              top: 0,
                              bottom: 0,
                              width: `${intensity * 100}%`,
                              background: palette.forest,
                            }}
                          />
                        </div>
                        <span
                          style={{
                            fontFamily: "'Geist Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
                            fontSize: "13px",
                            color: palette.ink,
                            minWidth: 36,
                            textAlign: "right",
                          }}
                        >
                          {r.clicks}
                        </span>
                        <span
                          style={{
                            fontFamily: "'Geist Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
                            fontSize: "10px",
                            color: palette.mute,
                            minWidth: 44,
                            textAlign: "right",
                          }}
                        >
                          {(r.ctr * 100).toFixed(1)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right" style={{ verticalAlign: "middle" }}>
                      <div className="flex items-center justify-end gap-3">
                        <div
                          style={{
                            width: 70,
                            height: 6,
                            background: palette.rule,
                            position: "relative",
                          }}
                          title={`${CURRENCY}${r.cost.toFixed(2)} of ${CURRENCY}${maxCost.toFixed(2)} max`}
                        >
                          <div
                            style={{
                              position: "absolute",
                              left: 0,
                              top: 0,
                              bottom: 0,
                              width: `${(r.cost / maxCost) * 100}%`,
                              background: t.color,
                            }}
                          />
                        </div>
                        <span
                          style={{
                            fontFamily: "'Instrument Serif', Georgia, 'Times New Roman', serif",
                            fontSize: "22px",
                            color: t.color,
                            fontWeight: 400,
                            minWidth: 88,
                            textAlign: "right",
                          }}
                        >
                          {CURRENCY}{r.cost.toFixed(2)}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <footer
          className="mt-8 pt-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-xs"
          style={{
            borderTop: `1px solid ${palette.rule}`,
            color: palette.mute,
            fontFamily: "'Geist', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif",
            lineHeight: 1.6,
          }}
        >
          <div>
            <div
              className="uppercase mb-1.5"
              style={{
                fontFamily: "'Geist Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
                fontSize: "10px",
                letterSpacing: "0.16em",
                color: palette.ink,
              }}
            >
              Methodology
            </div>
            Waste = clicks ≥ 5 AND zero {ATTRIBUTION} orders. Aggregated at search-term level across all
            campaigns and match types. Sales window:&nbsp;
            <span style={{ color: palette.ink, fontFamily: "'Geist Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" }}>
              {WINDOW}
            </span>
            .
          </div>
          <div>
            <div
              className="uppercase mb-1.5"
              style={{
                fontFamily: "'Geist Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
                fontSize: "10px",
                letterSpacing: "0.16em",
                color: palette.ink,
              }}
            >
              Excluded
            </div>
            Terms with fewer than 5 clicks (insufficient signal) and terms with any {ATTRIBUTION}{" "}
            conversions (no matter how poor the ACOS). View shows top 30 by cost; total includes
            all qualifying terms.
          </div>
          <div>
            <div
              className="uppercase mb-1.5"
              style={{
                fontFamily: "'Geist Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
                fontSize: "10px",
                letterSpacing: "0.16em",
                color: palette.ink,
              }}
            >
              Source
            </div>
            {SOURCE} · {ATTRIBUTION} attribution. Snapshot:{" "}
            <span style={{ color: palette.ink, fontFamily: "'Geist Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" }}>
              {SNAPSHOT}
            </span>
            .
          </div>
        </footer>
      </div>
    </div>
  );
}
