/**
 * volunteers.tsx
 *
 * Custom volunteer table that fetches from Supabase directly.
 * Registered as a React Admin Resource in App.tsx — RA handles routing
 * and the sidebar link; this component owns everything inside the page.
 *
 * Features:
 *  • Compact Excel-style rows with alternating stripe colours
 *  • Click any cell to expand / collapse its text               ← expandable cells
 *  • Add Volunteer modal   → 4-step Supabase INSERT             ← create
 *  • Edit Volunteer modal  → supabase UPDATE                    ← update
 *  • Delete confirmation   → supabase DELETE                    ← delete
 */

import { useState, useEffect, useCallback } from "react";
import { supabase } from "./supabaseClient";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, MenuItem, IconButton, Tooltip,
  Checkbox, FormControlLabel, FormGroup,
  Radio, RadioGroup, FormControl, FormLabel,
} from "@mui/material";
import EditIcon   from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon    from "@mui/icons-material/Add";
import "./volunteer-table.css";

// ─── Core volunteer type ───────────────────────────────────────────────────────

type Volunteer = {
  id: string;       // uuid — gen_random_uuid() in Supabase
  created_at?: string;
  name: string;
  email: string;
  phone_number: string;
  city: string;
  zip_code: string;
  birthdate: string;
  reliable_transportation: string;
  background_check_completed: string;
  excel_familiarity: string;
  weekly_hours_available: number;
  one_time_or_ongoing: string;
  physical_activity: string;
  hours_needed: number;
  student_classification: string;
  notes: string;
};

// ─── Lookup table types ────────────────────────────────────────────────────────

type DayRow      = { id: number; day_of_week: string };
type SlotRow     = { id: number; slot_name: string };
type InterestRow = { id: number; interest_name: string };
type SourceRow   = { id: number; source_name: string };

// Interests and sources come from Supabase (dynamic).
// Days and slots are hardcoded — they never change and the IDs must match
// the rows seeded into the `days` and `time_slots` tables (see seed SQL below).
type Lookups = {
  interests: InterestRow[];
  sources:   SourceRow[];
};

// ─── Hardcoded availability options ───────────────────────────────────────────
//
// IMPORTANT: these IDs must match the rows in your Supabase `days` and
// `time_slots` tables. Run the following seed SQL once in Supabase SQL Editor:
//
//   INSERT INTO public.days (day_of_week) VALUES
//     ('Monday'),('Tuesday'),('Wednesday'),('Thursday'),
//     ('Friday'),('Saturday'),('Sunday');
//
//   INSERT INTO public.time_slots (slot_name) VALUES
//     ('Mornings'),('Afternoons'),('Evenings');
//
// With identity columns starting at 1, Monday = id 1 … Sunday = id 7,
// Mornings = id 1, Afternoons = id 2, Evenings = id 3.

const DAYS: DayRow[] = [
  { id: 1, day_of_week: "Monday"    },
  { id: 2, day_of_week: "Tuesday"   },
  { id: 3, day_of_week: "Wednesday" },
  { id: 4, day_of_week: "Thursday"  },
  { id: 5, day_of_week: "Friday"    },
  { id: 6, day_of_week: "Saturday"  },
  { id: 7, day_of_week: "Sunday"    },
];

const SLOTS: SlotRow[] = [
  { id: 1, slot_name: "Mornings"   },
  { id: 2, slot_name: "Afternoons" },
  { id: 3, slot_name: "Evenings"   },
];

// ─── Create form defaults ──────────────────────────────────────────────────────

const EMPTY_CORE: Omit<Volunteer, "id" | "created_at"> = {
  name: "", email: "", phone_number: "", city: "", zip_code: "",
  birthdate: "", reliable_transportation: "", background_check_completed: "",
  excel_familiarity: "", weekly_hours_available: 0, one_time_or_ongoing: "",
  physical_activity: "", hours_needed: 0, student_classification: "", notes: "",
};

// ─── Column definitions ───────────────────────────────────────────────────────
//
// Drive the table headers, cell rendering, and VolunteerForm text fields.
// type: "text" | "date" | "number" | "textarea"
// showInTable: false = form-only field (hidden in main table)

type ColDef = {
  label: string;
  key: keyof Volunteer;
  type: "text" | "date" | "number" | "textarea" | "select";
  options?: string[];   // required when type === "select"
  showInTable?: boolean;
};

const COLS: ColDef[] = [
  { label: "Name",                    key: "name",                       type: "text"     },
  { label: "Email",                   key: "email",                      type: "text"     },
  { label: "Phone",                   key: "phone_number",               type: "text"     },
  { label: "City",                    key: "city",                       type: "text"     },
  { label: "Zip",                     key: "zip_code",                   type: "text"     },
  { label: "Birthdate",               key: "birthdate",                  type: "date"     },
  { label: "Reliable Transportation", key: "reliable_transportation",    type: "select",
    options: ["Yes", "No"] },
  { label: "Background Check",        key: "background_check_completed", type: "select",
    options: ["Yes", "No"] },
  { label: "Excel Familiarity",       key: "excel_familiarity",          type: "select",
    options: ["I know a lot", "I know some", "I know nothing"] },
  { label: "Hrs / Wk",               key: "weekly_hours_available",     type: "number"   },
  { label: "Frequency",               key: "one_time_or_ongoing",        type: "select",
    options: ["One-time events", "Ongoing roles", "Both"] },
  { label: "Physical Activity",       key: "physical_activity",          type: "select",
    options: ["Yes", "No", "Depends on the work"] },
  { label: "Hrs Needed",              key: "hours_needed",               type: "number"   },
  { label: "Classification",          key: "student_classification",     type: "select",
    options: ["Freshman", "Sophomore", "Junior", "Senior"] },
  { label: "Notes",                   key: "notes",                      type: "textarea" },
];

const TABLE_COLS = COLS.filter(c => c.showInTable !== false);

// ─── Small helpers ─────────────────────────────────────────────────────────────

/** Thin grey label used to separate form sections inside the Create modal. */
function SectionLabel({ children }: { children: string }) {
  return (
    <p style={{
      fontSize: 9, fontWeight: 700, textTransform: "uppercase",
      letterSpacing: "0.12em", color: "#566166",
      margin: "12px 0 4px",
      paddingBottom: 4,
      borderBottom: "1px solid #e8eff3",
    }}>
      {children}
    </p>
  );
}

// ─── ExpandableCell ───────────────────────────────────────────────────────────
//
// HOW EXPAND-ON-CLICK WORKS:
//   • Parent keeps expandedKey (string | null).
//   • Each cell's key = "<rowId>-<columnName>".
//   • Clicking toggles between .vt-cell-truncated and .vt-cell-expanded.
//   • Only one cell is open at a time.
//
// To make a column non-expandable, replace with:
//   <span className="vt-cell-plain">{val}</span>

function ExpandableCell({
  value, cellKey, expandedKey, onToggle,
}: {
  value: string; cellKey: string;
  expandedKey: string | null; onToggle: (k: string) => void;
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

// ─── VolunteerForm ────────────────────────────────────────────────────────────
// Shared text-field block used in both Edit and Create modals.

function VolunteerForm({
  values, onChange,
}: {
  values: Partial<Volunteer>;
  onChange: (key: keyof Volunteer, val: string) => void;
}) {
  return (
    <>
      {COLS.map(col => {
        const value = (values as any)[col.key] ?? "";

        // ── Dropdown (select) ──────────────────────────────────────────────
        // MUI TextField with select=true renders a <select>-style dropdown.
        // The empty first MenuItem lets the user clear the selection.
        if (col.type === "select") {
          return (
            <TextField
              key={col.key}
              select
              label={col.label}
              value={value}
              onChange={e => onChange(col.key, e.target.value)}
              size="small"
              fullWidth
            >
              <MenuItem value=""><em style={{ color: "#a9b4b9" }}>— Select —</em></MenuItem>
              {col.options!.map(opt => (
                <MenuItem key={opt} value={opt}>{opt}</MenuItem>
              ))}
            </TextField>
          );
        }

        // ── All other field types ──────────────────────────────────────────
        return (
          <TextField
            key={col.key}
            label={col.label}
            value={value}
            onChange={e => onChange(col.key, e.target.value)}
            type={col.type === "textarea" ? "text" : col.type}
            multiline={col.type === "textarea"}
            rows={col.type === "textarea" ? 3 : undefined}
            size="small"
            fullWidth
            slotProps={col.type === "date" ? { inputLabel: { shrink: true } } : undefined}
          />
        );
      })}
    </>
  );
}

// ─── VolunteerList (main export) ──────────────────────────────────────────────

export const VolunteerList = () => {

  // ── Main table data ────────────────────────────────────────────────────────
  const [rows,    setRows]    = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  // ── Lookup reference data (days, slots, interests, sources) ───────────────
  //
  // Fetched once on mount. These are static reference tables that rarely change.
  // They feed the checkboxes and radio buttons in the Create modal.
  const [lookups, setLookups] = useState<Lookups>({
    interests: [], sources: [],
  });

  // ── Cell expand / collapse ─────────────────────────────────────────────────
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const toggleExpand  = (k: string) => setExpandedKey(p => p === k ? null : k);

  // ── Edit modal ─────────────────────────────────────────────────────────────
  const [editRow,  setEditRow]  = useState<Volunteer | null>(null);
  const [editForm, setEditForm] = useState<Partial<Volunteer>>({});
  const [saving,   setSaving]   = useState(false);

  // ── Delete modal ───────────────────────────────────────────────────────────
  const [deleteRow, setDeleteRow] = useState<Volunteer | null>(null);
  const [deleting,  setDeleting]  = useState(false);

  // ── Create modal — core fields ─────────────────────────────────────────────
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<typeof EMPTY_CORE>({ ...EMPTY_CORE });
  const [creating,   setCreating]   = useState(false);

  // ── Create modal — junction table selections ───────────────────────────────
  //
  // selectedInterests  : number[]        — interest_id values checked by user
  // selectedAvailability : Set<string>   — keys like "3-2" = day_id 3, slot_id 2
  // selectedSourceId   : number | null   — chosen referral_source.id
  // customValue        : string          — free-text for volunteer_referral.custom_value
  const [selectedInterests,    setSelectedInterests]    = useState<number[]>([]);
  const [selectedAvailability, setSelectedAvailability] = useState<Set<string>>(new Set());
  const [selectedSourceId,     setSelectedSourceId]     = useState<number | null>(null);
  const [customValue,          setCustomValue]          = useState("");

  // ── Fetch: main volunteer rows ─────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from("volunteer").select("*");
    if (error) { setError(error.message); }
    else       { setRows((data as Volunteer[]) ?? []); setError(null); }
    setLoading(false);
  }, []);

  // ── Fetch: static lookup tables ────────────────────────────────────────────
  //
  // All four reference tables are fetched in parallel with Promise.all once
  // on mount. They feed the Create modal's checkboxes and radio buttons.
  // If any lookup fails, the others still load; missing data shows as empty.
  // Days and slots are hardcoded constants (DAYS / SLOTS) — no DB fetch needed.
  const fetchLookups = useCallback(async () => {
    const [interests, sources] = await Promise.all([
      supabase.from("area_of_interest").select("*").order("interest_name"),
      supabase.from("referral_source").select("*").order("source_name"),
    ]);
    setLookups({
      interests: (interests.data as InterestRow[]) ?? [],
      sources:   (sources.data   as SourceRow[])   ?? [],
    });
  }, []);

  useEffect(() => {
    fetchAll();
    fetchLookups();
  }, [fetchAll, fetchLookups]);

  // ── Create: toggle helpers ─────────────────────────────────────────────────

  const toggleInterest = (id: number) =>
    setSelectedInterests(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );

  // Availability key = "<day_id>-<slot_id>"  e.g. "2-3"
  const toggleAvailability = (dayId: number, slotId: number) => {
    const key = `${dayId}-${slotId}`;
    setSelectedAvailability(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  // Resets all create-modal state back to defaults
  const resetCreate = () => {
    setCreateForm({ ...EMPTY_CORE });
    setSelectedInterests([]);
    setSelectedAvailability(new Set());
    setSelectedSourceId(null);
    setCustomValue("");
    setCreateOpen(false);
  };

  // ── Edit handlers ──────────────────────────────────────────────────────────
  const openEdit  = (row: Volunteer) => { setEditRow(row); setEditForm({ ...row }); };
  const closeEdit = () => { setEditRow(null); setEditForm({}); };

  const handleEditChange = (key: keyof Volunteer, val: string) =>
    setEditForm(prev => ({ ...prev, [key]: val }));

  const handleSaveEdit = async () => {
    if (!editRow) return;
    setSaving(true);
    const { error } = await supabase
      .from("volunteer")
      .update(editForm)
      .eq("id", editRow.id);
    setSaving(false);
    if (error) { alert("Save failed: " + error.message); return; }
    closeEdit();
    fetchAll();
  };

  // ── Delete handler ─────────────────────────────────────────────────────────
  const handleConfirmDelete = async () => {
    if (!deleteRow) return;
    setDeleting(true);
    const { error } = await supabase
      .from("volunteer")
      .delete()
      .eq("id", deleteRow.id);
    setDeleting(false);
    setDeleteRow(null);
    // Junction rows cascade-delete automatically (ON DELETE CASCADE in schema)
    if (error) { alert("Delete failed: " + error.message); return; }
    fetchAll();
  };

  // ── Create handler — 4-step multi-table INSERT ─────────────────────────────
  //
  // WHY 4 STEPS:
  //   A volunteer's data spans 4 tables. The volunteer.id UUID generated in
  //   step 1 must be threaded into steps 2–4 as the foreign key.
  //
  // ATOMICITY NOTE:
  //   Supabase JS does not support client-side transactions. If step 1 succeeds
  //   but a later step fails, the volunteer row exists but is partially saved.
  //   The user is alerted to which steps failed. For full atomicity, wrap this
  //   in a Postgres function (SECURITY DEFINER) and call via supabase.rpc().

  const handleSaveCreate = async () => {
    setCreating(true);

    // ── Step 1: Insert core volunteer row ────────────────────────────────────
    // .select("id").single() returns the generated UUID immediately.
    const { data: newVol, error: e1 } = await supabase
      .from("volunteer")
      .insert(createForm)
      .select("id")
      .single();

    if (e1 || !newVol) {
      alert("Failed to create volunteer: " + e1?.message);
      setCreating(false);
      return;
    }

    const volunteerId: string = newVol.id;
    const partialErrors: string[] = [];

    // ── Step 2: Insert selected interests ────────────────────────────────────
    // Each checked interest becomes one row in volunteer_interests.
    // volunteer_id must be supplied explicitly — do NOT rely on the column
    // default (see FK defaults note below).
    if (selectedInterests.length > 0) {
      const { error: e2 } = await supabase
        .from("volunteer_interests")
        .insert(
          selectedInterests.map(interest_id => ({
            volunteer_id: volunteerId,
            interest_id,
          }))
        );
      if (e2) partialErrors.push("Interests: " + e2.message);
    }

    // ── Step 3: Insert availability grid selections ───────────────────────────
    // Each checked cell in the day × slot grid becomes one row.
    // The key format "dayId-slotId" is split and parsed back to numbers.
    if (selectedAvailability.size > 0) {
      const pairs = Array.from(selectedAvailability).map(key => {
        const [day_id, slot_id] = key.split("-").map(Number);
        return { volunteer_id: volunteerId, day_id, slot_id };
      });
      const { error: e3 } = await supabase
        .from("volunteer_availability")
        .insert(pairs);
      if (e3) partialErrors.push("Availability: " + e3.message);
    }

    // ── Step 4: Insert referral source ───────────────────────────────────────
    // Only inserted if the user selected a source.
    // custom_value is stored as null when the text field is left empty.
    if (selectedSourceId !== null) {
      const { error: e4 } = await supabase
        .from("volunteer_referral")
        .insert({
          volunteer_id: volunteerId,
          source_id:    selectedSourceId,
          custom_value: customValue.trim() || null,
        });
      if (e4) partialErrors.push("Referral: " + e4.message);
    }

    setCreating(false);

    if (partialErrors.length > 0) {
      alert(
        `Volunteer created, but some related data failed to save:\n${partialErrors.join("\n")}\n\n` +
        `You can re-add the missing data by editing the volunteer row.`
      );
    }

    resetCreate();
    fetchAll();
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ padding: 24 }}>

      {/* ── Toolbar ── */}
      <div className="vt-toolbar" style={{ borderRadius: "12px 12px 0 0" }}>
        <div>
          <h2 className="vt-toolbar-title">Volunteer Directory</h2>
          <p className="vt-toolbar-sub">{rows.length} volunteer{rows.length !== 1 ? "s" : ""} total</p>
        </div>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateOpen(true)}
          sx={{
            backgroundColor: "#565e74", fontSize: 12,
            textTransform: "none", borderRadius: "6px",
            "&:hover": { backgroundColor: "#4a5268" },
          }}
        >
          Add Volunteer
        </Button>
      </div>

      {/* ── Main table ── */}
      <div className="vt-container" style={{ borderRadius: "0 0 12px 12px", borderTop: "none" }}>
        {loading && <p className="vt-status">Loading…</p>}
        {error   && <p className="vt-error">Error: {error}</p>}

        {!loading && !error && (
          <div className="vt-scroll">
            <table className="vt-table">
              <thead className="vt-thead">
                <tr>
                  {TABLE_COLS.map(col => (
                    <th key={col.key} className="vt-th">{col.label}</th>
                  ))}
                  <th className="vt-th vt-th-actions" />
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr
                    key={row.id}
                    className={`vt-row ${i % 2 === 0 ? "vt-row-even" : "vt-row-odd"}`}
                  >
                    {TABLE_COLS.map(col => {
                      const val     = String(row[col.key] ?? "");
                      const cellKey = `${row.id}-${col.key}`;
                      return (
                        <td key={col.key} className="vt-td">
                          <ExpandableCell
                            value={val} cellKey={cellKey}
                            expandedKey={expandedKey} onToggle={toggleExpand}
                          />
                        </td>
                      );
                    })}
                    <td className="vt-td" style={{ textAlign: "right" }}>
                      <div className="vt-actions">
                        <Tooltip title="Edit volunteer">
                          <IconButton size="small" onClick={() => openEdit(row)}>
                            <EditIcon sx={{ fontSize: 15, color: "#566166" }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete volunteer">
                          <IconButton size="small" onClick={() => setDeleteRow(row)}>
                            <DeleteIcon sx={{ fontSize: 15, color: "#9f403d" }} />
                          </IconButton>
                        </Tooltip>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── EDIT MODAL ── */}
      <Dialog open={!!editRow} onClose={closeEdit} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontSize: 14, fontWeight: 700, pb: 0 }}>Edit Volunteer</DialogTitle>
        <DialogContent
          dividers
          sx={{ display: "flex", flexDirection: "column", gap: 1.5, pt: "16px !important" }}
        >
          <VolunteerForm values={editForm} onChange={handleEditChange} />
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 1.5 }}>
          <Button onClick={closeEdit} sx={{ textTransform: "none", color: "#566166" }}>Cancel</Button>
          <Button
            onClick={handleSaveEdit} variant="contained" disabled={saving}
            sx={{ backgroundColor: "#565e74", textTransform: "none",
                  "&:hover": { backgroundColor: "#4a5268" } }}
          >
            {saving ? "Saving…" : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── DELETE MODAL ── */}
      <Dialog open={!!deleteRow} onClose={() => setDeleteRow(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontSize: 14, fontWeight: 700 }}>Confirm Delete</DialogTitle>
        <DialogContent>
          <p style={{ fontSize: 13, color: "#566166", margin: 0 }}>
            Permanently delete <strong>{deleteRow?.name}</strong>?
            All availability, interests, and referral data will also be removed
            (ON DELETE CASCADE). This cannot be undone.
          </p>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 1.5 }}>
          <Button onClick={() => setDeleteRow(null)} sx={{ textTransform: "none", color: "#566166" }}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete} variant="contained" disabled={deleting}
            sx={{ backgroundColor: "#9f403d", textTransform: "none",
                  "&:hover": { backgroundColor: "#752121" } }}
          >
            {deleting ? "Deleting…" : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── CREATE MODAL ────────────────────────────────────────────────────────
       *
       * The modal is split into four sections that match the four INSERT steps:
       *
       *   Section 1 – Volunteer Details   → INSERT into volunteer
       *   Section 2 – Areas of Interest   → INSERT into volunteer_interests
       *   Section 3 – Availability        → INSERT into volunteer_availability
       *   Section 4 – Referral Source     → INSERT into volunteer_referral
       *
       * ──────────────────────────────────────────────────────────────────────── */}
      <Dialog open={createOpen} onClose={resetCreate} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontSize: 14, fontWeight: 700, pb: 0 }}>Add Volunteer</DialogTitle>

        <DialogContent
          dividers
          sx={{ display: "flex", flexDirection: "column", gap: 1, pt: "16px !important" }}
        >
          {/* ── Section 1: Core volunteer fields ── */}
          <SectionLabel>Volunteer Details</SectionLabel>
          <VolunteerForm
            values={createForm}
            onChange={(key, val) => setCreateForm(prev => ({ ...prev, [key]: val as any }))}
          />

          {/* ── Section 2: Areas of Interest ──────────────────────────────────
           *
           * Each checkbox maps to one area_of_interest row. Checking it adds
           * { volunteer_id, interest_id } to volunteer_interests in step 2.
           *
           * selectedInterests holds the checked interest_id numbers.
           * toggleInterest() adds or removes an id from the array.
           * ─────────────────────────────────────────────────────────────────── */}
          <SectionLabel>Areas of Interest</SectionLabel>
          {lookups.interests.length === 0 ? (
            <p style={{ fontSize: 11, color: "#a9b4b9", margin: 0 }}>
              No interest categories found in database.
            </p>
          ) : (
            <FormGroup row sx={{ gap: 0 }}>
              {lookups.interests.map(interest => (
                <FormControlLabel
                  key={interest.id}
                  control={
                    <Checkbox
                      size="small"
                      checked={selectedInterests.includes(interest.id)}
                      onChange={() => toggleInterest(interest.id)}
                      sx={{ color: "#a9b4b9", "&.Mui-checked": { color: "#565e74" }, p: "4px" }}
                    />
                  }
                  label={
                    <span style={{ fontSize: 12, color: "#2a3439" }}>
                      {interest.interest_name}
                    </span>
                  }
                  sx={{ mr: 2, mb: 0.5 }}
                />
              ))}
            </FormGroup>
          )}

          {/* ── Section 3: Availability grid ──────────────────────────────────
           *
           * Renders a day-of-week × time-slot matrix of checkboxes.
           * Rows = days table  (ordered by id, so insertion order matters)
           * Cols = time_slots table (ordered by id)
           *
           * Each checkbox's state key is "<day_id>-<slot_id>" stored in a Set.
           * toggleAvailability() adds or removes from that Set.
           *
           * On submit, the Set is iterated and each key split back into
           * { volunteer_id, day_id, slot_id } for the batch INSERT.
           * ─────────────────────────────────────────────────────────────────── */}
          <SectionLabel>Availability — check all that apply</SectionLabel>
          {/*
           * CSS Grid replaces a plain <table> here.
           * MUI's emotion CSS baseline resets plain HTML table elements inside
           * a flex Dialog, collapsing them to zero height. Divs are unaffected.
           *
           * gridTemplateColumns: first col = day label (120px fixed),
           * remaining cols = one equal fraction per time slot.
           */}
          {/* flexShrink: 0 prevents the flex DialogContent from crushing this
              div to height: 0. overflowX is not needed — CSS Grid 1fr columns
              adapt to the available width automatically. */}
          <div style={{ flexShrink: 0 }}>
            {/* Header row */}
            <div style={{
              display: "grid",
              gridTemplateColumns: `120px repeat(${SLOTS.length}, 1fr)`,
              borderBottom: "1px solid #e8eff3",
              marginBottom: 2,
            }}>
              <div style={{ padding: "4px 8px", fontSize: 9, fontWeight: 700,
                            textTransform: "uppercase", letterSpacing: "0.08em",
                            color: "#566166" }}>
                Day / Time
              </div>
              {SLOTS.map(slot => (
                <div key={slot.id} style={{ padding: "4px 8px", fontSize: 9, fontWeight: 700,
                                            textTransform: "uppercase", letterSpacing: "0.08em",
                                            color: "#566166", textAlign: "center",
                                            whiteSpace: "nowrap" }}>
                  {slot.slot_name}
                </div>
              ))}
            </div>

            {/* One row per day */}
            {DAYS.map((day, rowIdx) => (
              <div key={day.id} style={{
                display: "grid",
                gridTemplateColumns: `120px repeat(${SLOTS.length}, 1fr)`,
                background: rowIdx % 2 === 0 ? "#ffffff" : "#f7f9fb",
                alignItems: "center",
              }}>
                <div style={{ padding: "2px 8px", fontWeight: 600, fontSize: 12,
                              color: "#2a3439", whiteSpace: "nowrap" }}>
                  {day.day_of_week}
                </div>
                {SLOTS.map(slot => (
                  <div key={slot.id} style={{ display: "flex", justifyContent: "center" }}>
                    <Checkbox
                      size="small"
                      checked={selectedAvailability.has(`${day.id}-${slot.id}`)}
                      onChange={() => toggleAvailability(day.id, slot.id)}
                      sx={{ color: "#a9b4b9", "&.Mui-checked": { color: "#565e74" }, p: "3px" }}
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* ── Section 4: Referral Source ────────────────────────────────────
           *
           * Radio group — only one source can be selected (matches the schema:
           * volunteer_referral has a composite PK of (volunteer_id, source_id),
           * but a volunteer typically has one primary referral source).
           *
           * custom_value is a free-text field for additional context, e.g.
           * if source = "Other", the volunteer can describe how they heard.
           *
           * To allow multiple sources, change RadioGroup → FormGroup with
           * Checkboxes, and insert multiple rows in step 4.
           * ─────────────────────────────────────────────────────────────────── */}
          <SectionLabel>How Did They Hear About Us?</SectionLabel>
          {lookups.sources.length === 0 ? (
            <p style={{ fontSize: 11, color: "#a9b4b9", margin: 0 }}>
              No referral sources found in database.
            </p>
          ) : (
            <>
              <FormControl>
                <FormLabel sx={{ fontSize: 11, color: "#566166", mb: 0.5 }}>
                  Select a source (optional)
                </FormLabel>
                <RadioGroup
                  value={selectedSourceId ?? ""}
                  onChange={e => setSelectedSourceId(e.target.value ? Number(e.target.value) : null)}
                  row
                  sx={{ gap: 0 }}
                >
                  {lookups.sources.map(source => (
                    <FormControlLabel
                      key={source.id}
                      value={source.id}
                      control={
                        <Radio
                          size="small"
                          sx={{ color: "#a9b4b9", "&.Mui-checked": { color: "#565e74" }, p: "4px" }}
                        />
                      }
                      label={
                        <span style={{ fontSize: 12, color: "#2a3439" }}>
                          {source.source_name}
                        </span>
                      }
                      sx={{ mr: 2, mb: 0.5 }}
                    />
                  ))}
                </RadioGroup>
              </FormControl>

              {/* custom_value — only shown when a source is selected */}
              {selectedSourceId !== null && (
                <TextField
                  label="Additional details (optional)"
                  value={customValue}
                  onChange={e => setCustomValue(e.target.value)}
                  size="small"
                  fullWidth
                  placeholder="e.g. 'Saw flyer at City Hall'"
                />
              )}
            </>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 1.5 }}>
          <Button onClick={resetCreate} sx={{ textTransform: "none", color: "#566166" }}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveCreate} variant="contained" disabled={creating}
            sx={{ backgroundColor: "#565e74", textTransform: "none",
                  "&:hover": { backgroundColor: "#4a5268" } }}
          >
            {creating ? "Adding…" : "Add Volunteer"}
          </Button>
        </DialogActions>
      </Dialog>

    </div>
  );
};
