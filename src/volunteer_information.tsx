/**
 * volunteer_information.tsx
 *
 * Displays the `volunteer_info` Supabase VIEW in a compact, styled table.
 * This is a READ-ONLY tab — INSERT/UPDATE/DELETE are not available because
 * `volunteer_info` is a view. All edits should go through the Volunteers tab.
 *
 * Exports:
 *   useVolunteerInfo  — hook (fetch the view data anywhere in the app)
 *   VolunteerInfoList — React Admin list component (registered in App.tsx)
 */

import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import "./volunteer-table.css";

// ─── Type ─────────────────────────────────────────────────────────────────────
// Update these fields to exactly match the columns your volunteer_info view exposes.

export type VolunteerInfo = {
  id: string;       // uuid — volunteer.id from the view
  name: string;
  email: string;
  phone_number: string;
  volunteer_attributes: string; // aggregated / grouped data — likely long
  areas_of_interest: string;    // aggregated / grouped data — likely long
  availability: string;
  hours_needed: number;
  notes: string;
};

// ─── useVolunteerInfo hook ────────────────────────────────────────────────────
//
// HOW TO PASS THIS DATA TO ANOTHER COMPONENT:
//
//   Option A — Import the hook directly (simplest)
//     Any component that needs the view data calls the hook:
//
//       import { useVolunteerInfo } from "./volunteer_information";
//       const { data, loading, error } = useVolunteerInfo();
//
//   Option B — Props (parent → child)
//     Call the hook in a parent component and pass `data` as a prop:
//
//       const Parent = () => {
//         const { data } = useVolunteerInfo();
//         return <Child volunteers={data} />;
//       };
//
//   Option C — React Context (many unrelated components need the same data)
//     Wrap the hook in a context provider so any descendant can consume it
//     without prop-drilling. Useful once three or more components need it.

export function useVolunteerInfo() {
  const [data,    setData]    = useState<VolunteerInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    async function fetchVolunteerInfo() {
      setLoading(true);
      setError(null);
      const { data: rows, error: queryError } = await supabase
        .from("volunteer_info")
        .select("*");
      if (queryError) {
        console.error("volunteer_info fetch error:", queryError);
        setError(queryError.message);
      } else {
        setData((rows as VolunteerInfo[]) ?? []);
      }
      setLoading(false);
    }
    fetchVolunteerInfo();
  }, []);

  return { data, loading, error };
}

// ─── Column definitions ───────────────────────────────────────────────────────

type ColDef = { label: string; key: keyof VolunteerInfo };

const COLS: ColDef[] = [
  { label: "Name",                key: "name"                },
  { label: "Email",               key: "email"               },
  { label: "Phone",               key: "phone_number"        },
  { label: "BG Check / Transportation / Excel",key: "volunteer_attributes"},
  { label: "Areas of Interest",   key: "areas_of_interest"   },
  { label: "Availability",        key: "availability"        },
  { label: "Hrs Needed",          key: "hours_needed"        },
  { label: "Notes",               key: "notes"               },
];

// ─── ExpandableCell ───────────────────────────────────────────────────────────
//
// Same expand-on-click pattern as volunteers.tsx.
// See the comment block in volunteers.tsx for a full explanation.

function ExpandableCell({
  value, cellKey, expandedKey, onToggle,
}: {
  value: string;
  cellKey: string;
  expandedKey: string | null;
  onToggle: (key: string) => void;
}) {
  const isExpanded = expandedKey === cellKey;
  if (!value) return <span className="vt-cell-plain" style={{ color: "#a9b4b9" }}>—</span>;
  return (
    <span
      className={isExpanded ? "vt-cell-expanded" : "vt-cell-truncated"}
      onClick={e => { e.stopPropagation(); onToggle(cellKey); }}
      title={isExpanded ? "Click to collapse" : "Click to expand"}
    >
      {value}
    </span>
  );
}

// ─── VolunteerInfoList (main export) ──────────────────────────────────────────

export const VolunteerInfoList = () => {
  const { data: rows, loading, error } = useVolunteerInfo();

  // expandedKey format: "<rowId>-<columnKey>"
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const toggleExpand = (key: string) =>
    setExpandedKey(prev => (prev === key ? null : key));

  return (
    <div style={{ padding: 24 }}>

      {/* ── Toolbar ── */}
      <div className="vt-toolbar" style={{ borderRadius: "12px 12px 0 0" }}>
        <div>
          <h2 className="vt-toolbar-title">Volunteer Information</h2>
          <p className="vt-toolbar-sub">
            {rows.length} record{rows.length !== 1 ? "s" : ""} · read-only view
          </p>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="vt-container" style={{ borderRadius: "0 0 12px 12px", borderTop: "none" }}>
        {loading && <p className="vt-status">Loading…</p>}
        {error   && <p className="vt-error">Error: {error}</p>}

        {!loading && !error && (
          <div className="vt-scroll">
            <table className="vt-table">
              <thead className="vt-thead">
                <tr>
                  {COLS.map(col => (
                    <th key={col.key} className="vt-th">{col.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr
                    key={row.id}
                    className={`vt-row ${i % 2 === 0 ? "vt-row-even" : "vt-row-odd"}`}
                  >
                    {COLS.map(col => {
                      const val = String(row[col.key] ?? "");
                      return (
                        <td key={col.key} className="vt-td">
                          <ExpandableCell
                            value={val}
                            cellKey={`${row.id}-${col.key}`}
                            expandedKey={expandedKey}
                            onToggle={toggleExpand}
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
