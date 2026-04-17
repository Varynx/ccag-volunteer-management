import { useEffect, useState, useCallback } from "react";
import { supabase } from "./supabaseClient";
import { TextField, MenuItem, Button } from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import ClearIcon      from "@mui/icons-material/Clear";
import "./volunteer-table.css";

// ─── Type ─────────────────────────────────────────────────────────────────────

export type VolunteerInfo = {
  id: string;
  name: string;
  email: string;
  phone_number: string;
  volunteer_attributes: string;
  areas_of_interest: string;
  availability: string;
  hours_needed: number;
  notes: string;
};

// ─── Availability filter options (must match Supabase seed data) ───────────────

const DAYS  = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const SLOTS = ["Mornings","Afternoons","Evenings"];

// ─── useVolunteerInfo hook ─────────────────────────────────────────────────────

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
  { label: "Name",                              key: "name"                 },
  { label: "Email",                             key: "email"                },
  { label: "Phone",                             key: "phone_number"         },
  { label: "BG Check / Transportation / Excel", key: "volunteer_attributes" },
  { label: "Areas of Interest",                 key: "areas_of_interest"    },
  { label: "Availability",                      key: "availability"         },
  { label: "Hrs Needed",                        key: "hours_needed"         },
  { label: "Notes",                             key: "notes"                },
];

// ─── ExpandableCell ───────────────────────────────────────────────────────────

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
  const { data: allRows, loading, error } = useVolunteerInfo();

  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const toggleExpand = (key: string) =>
    setExpandedKey(prev => (prev === key ? null : key));

  // ── Availability filter ────────────────────────────────────────────────────
  const [filterDay,   setFilterDay]   = useState("");
  const [filterSlot,  setFilterSlot]  = useState("");
  const [filterRows,  setFilterRows]  = useState<VolunteerInfo[]>([]);
  const [filtering,   setFiltering]   = useState(false);
  const [filterError, setFilterError] = useState<string | null>(null);

  const isFiltered = filterDay !== "" && filterSlot !== "";

  const runFilter = useCallback(async (day: string, slot: string) => {
    setFiltering(true);
    setFilterError(null);
    const { data, error } = await supabase.rpc(
      "get_volunteers_by_availability",
      { p_day: day, p_slot: slot }
    );
    if (error) {
      setFilterError(error.message);
      setFilterRows([]);
    } else {
      setFilterRows((data as VolunteerInfo[]) ?? []);
    }
    setFiltering(false);
  }, []);

  const handleDayChange = (day: string) => {
    setFilterDay(day);
    if (day && filterSlot) runFilter(day, filterSlot);
  };

  const handleSlotChange = (slot: string) => {
    setFilterSlot(slot);
    if (filterDay && slot) runFilter(filterDay, slot);
  };

  const clearFilter = () => {
    setFilterDay("");
    setFilterSlot("");
    setFilterRows([]);
    setFilterError(null);
  };

  const displayRows = isFiltered ? filterRows : allRows;
  const isLoading   = loading || filtering;

  return (
    <div style={{ padding: 24 }}>

      {/* ── Toolbar ── */}
      <div className="vt-toolbar" style={{ borderRadius: "12px 12px 0 0", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 className="vt-toolbar-title">Volunteer Information</h2>
          <p className="vt-toolbar-sub">
            {isFiltered
              ? `${displayRows.length} volunteer${displayRows.length !== 1 ? "s" : ""} available ${filterDay} ${filterSlot}`
              : `${allRows.length} record${allRows.length !== 1 ? "s" : ""} · read-only view`}
          </p>
        </div>

        {/* ── Availability filter controls ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <FilterListIcon sx={{ fontSize: 16, opacity: 0.6 }} />
          <TextField
            select
            size="small"
            label="Day"
            value={filterDay}
            onChange={e => handleDayChange(e.target.value)}
            sx={{ minWidth: 130, "& .MuiInputBase-root": { fontSize: 12 } }}
          >
            <MenuItem value=""><em>Any day</em></MenuItem>
            {DAYS.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
          </TextField>

          <TextField
            select
            size="small"
            label="Time"
            value={filterSlot}
            onChange={e => handleSlotChange(e.target.value)}
            sx={{ minWidth: 130, "& .MuiInputBase-root": { fontSize: 12 } }}
          >
            <MenuItem value=""><em>Any time</em></MenuItem>
            {SLOTS.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </TextField>

          {isFiltered && (
            <Button
              size="small"
              startIcon={<ClearIcon />}
              onClick={clearFilter}
              sx={{ fontSize: 11, textTransform: "none", color: "text.secondary" }}
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* ── Table ── */}
      <div className="vt-container" style={{ borderRadius: "0 0 12px 12px", borderTop: "none" }}>
        {isLoading   && <p className="vt-status">Loading…</p>}
        {filterError && <p className="vt-error">Filter error: {filterError}</p>}
        {error       && <p className="vt-error">Error: {error}</p>}

        {!isLoading && !error && !filterError && (
          <>
            {isFiltered && displayRows.length === 0 && (
              <p className="vt-status">
                No volunteers available {filterDay} {filterSlot}.
              </p>
            )}
            {(!isFiltered || displayRows.length > 0) && (
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
                    {displayRows.map((row, i) => (
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
          </>
        )}
      </div>

    </div>
  );
};
