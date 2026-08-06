import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import type { Route } from "./+types/admin-leads";
import { AdminShell, useAdminGuard } from "../components/admin";
import { getSupabase } from "../lib/supabase";

/* ============================================================
   /admin/leads — Bandeja de leads de Studios.
   Los leads entran por el form de cada sede (POST /leads) con
   atribución utm y sync best-effort a Mindbody. Acá el equipo
   los trabaja: estado del pipeline, WhatsApp directo con un
   click, notas internas. Client-rendered tras useAdminGuard
   (RLS: staff all). Pipeline = enum lead_status de la base.
   ============================================================ */

export function meta({}: Route.MetaArgs) {
  return [
    { title: "54D: Leads" },
    { name: "robots", content: "noindex" },
  ];
}

type LeadStatus = "new" | "contacted" | "booked" | "converted" | "lost";

interface LeadRow {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  status: LeadStatus;
  utm_source: string | null;
  utm_campaign: string | null;
  notes: string | null;
  mindbody_client_id: string | null;
  created_at: string;
  locations: { name: string; slug: string } | null;
}

const STATUS_LABEL: Record<LeadStatus, string> = {
  new: "Nuevo",
  contacted: "Contactado",
  booked: "Consulta agendada",
  converted: "Ganado",
  lost: "Perdido",
};

/* Color sutil por estado (borde izquierdo de la fila + texto del select) */
const STATUS_COLOR: Record<LeadStatus, string> = {
  new: "var(--c-yellow)",
  contacted: "#7FB6FF",
  booked: "#B78CFF",
  converted: "#3ECF8E",
  lost: "rgba(255,255,255,0.35)",
};

const ORDER: LeadStatus[] = ["new", "contacted", "booked", "converted", "lost"];

const fmtFecha = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
  }) +
    " · " +
    d.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
};

const th: CSSProperties = {
  textAlign: "left",
  padding: "0.9rem 1.2rem",
  fontSize: "0.68rem",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.14em",
  color: "var(--c-faint)",
  whiteSpace: "nowrap",
};
const td: CSSProperties = {
  padding: "0.85rem 1.2rem",
  color: "var(--c-mist)",
  verticalAlign: "top",
};

const selectStyle: CSSProperties = {
  background: "var(--glass)",
  border: "1px solid var(--hairline)",
  borderRadius: "var(--r-control)",
  color: "var(--c-white)",
  padding: "0.45rem 0.6rem",
  fontSize: "0.85rem",
};

export default function AdminLeads() {
  const { ready } = useAdminGuard();
  const [rows, setRows] = useState<LeadRow[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [fStatus, setFStatus] = useState<"all" | LeadStatus>("all");
  const [fSede, setFSede] = useState<string>("all");
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    void (async () => {
      const { data, error } = await getSupabase()
        .from("leads")
        .select(
          "id, name, email, phone, status, utm_source, utm_campaign, notes, mindbody_client_id, created_at, locations(name, slug)"
        )
        .order("created_at", { ascending: false })
        .limit(500);
      if (cancelled) return;
      if (error) setLoadError(error.message);
      else setRows((data ?? []) as unknown as LeadRow[]);
      setLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [ready]);

  const sedes = useMemo(() => {
    const m = new Map<string, string>();
    for (const r of rows) if (r.locations) m.set(r.locations.slug, r.locations.name);
    return [...m.entries()];
  }, [rows]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (fStatus !== "all" && r.status !== fStatus) return false;
      if (fSede !== "all" && r.locations?.slug !== fSede) return false;
      if (
        needle &&
        !`${r.name ?? ""} ${r.phone ?? ""} ${r.email ?? ""}`
          .toLowerCase()
          .includes(needle)
      )
        return false;
      return true;
    });
  }, [rows, fStatus, fSede, q]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { total: rows.length };
    for (const s of ORDER) c[s] = 0;
    const weekAgo = Date.now() - 7 * 86400_000;
    let week = 0;
    for (const r of rows) {
      c[r.status] = (c[r.status] ?? 0) + 1;
      if (new Date(r.created_at).getTime() > weekAgo) week++;
    }
    c.week = week;
    return c;
  }, [rows]);

  async function updateLead(id: string, patch: Partial<Pick<LeadRow, "status" | "notes">>) {
    setSaving(id);
    const { error } = await getSupabase().from("leads").update(patch).eq("id", id);
    if (!error) {
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
    }
    setSaving(null);
  }

  const waLink = (phone: string) =>
    `https://wa.me/${phone.replace(/\D/g, "")}`;

  return (
    <AdminShell active="/admin/leads">
      <h1 className="admin-title">Leads</h1>

      {/* Métricas rápidas */}
      <div className="metric-grid" style={{ marginBottom: "1.6rem" }}>
        {[
          ["Total", counts.total],
          ["Últimos 7 días", counts.week],
          ["Nuevos", counts.new],
          ["Contactados", counts.contacted],
          ["Consulta agendada", counts.booked],
          ["Ganados", counts.converted],
        ].map(([label, value]) => (
          <div key={label as string} className="metric-card">
            <div className="label">{label}</div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "1.8rem",
                color: "var(--c-white)",
              }}
            >
              {value ?? 0}
            </div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div
        style={{
          display: "flex",
          gap: "0.8rem",
          flexWrap: "wrap",
          marginBottom: "1.2rem",
          alignItems: "center",
        }}
      >
        <input
          type="search"
          placeholder="Buscar por nombre o teléfono…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ ...selectStyle, minWidth: "16rem", flex: "0 1 20rem" }}
        />
        <select
          value={fStatus}
          onChange={(e) => setFStatus(e.target.value as "all" | LeadStatus)}
          style={selectStyle}
          aria-label="Filtrar por estado"
        >
          <option value="all">Todos los estados</option>
          {ORDER.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </select>
        <select
          value={fSede}
          onChange={(e) => setFSede(e.target.value)}
          style={selectStyle}
          aria-label="Filtrar por sede"
        >
          <option value="all">Todas las sedes</option>
          {sedes.map(([slug, name]) => (
            <option key={slug} value={slug}>
              {name}
            </option>
          ))}
        </select>
        <span style={{ fontSize: "0.8rem", color: "var(--c-faint)" }}>
          {filtered.length} de {rows.length}
        </span>
      </div>

      {loadError && (
        <p style={{ color: "var(--c-red)", marginBottom: "1rem" }}>
          Error cargando leads: {loadError}
        </p>
      )}

      <div
        style={{
          border: "1px solid var(--hairline)",
          borderRadius: "var(--r-card)",
          overflow: "auto",
          background: "var(--glass)",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "880px" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--hairline)" }}>
              <th style={th}>Fecha</th>
              <th style={th}>Nombre</th>
              <th style={th}>WhatsApp</th>
              <th style={th}>Sede</th>
              <th style={th}>Fuente</th>
              <th style={th}>Estado</th>
              <th style={th}>Notas</th>
            </tr>
          </thead>
          <tbody>
            {!loaded && (
              <tr>
                <td style={{ ...td, padding: "2rem 1.2rem" }} colSpan={7}>
                  Cargando…
                </td>
              </tr>
            )}
            {loaded && filtered.length === 0 && (
              <tr>
                <td style={{ ...td, padding: "2rem 1.2rem" }} colSpan={7}>
                  {rows.length === 0
                    ? "Todavía no hay leads. Cuando alguien aplique desde una página de sede, aparece acá."
                    : "Sin resultados con estos filtros."}
                </td>
              </tr>
            )}
            {filtered.map((r) => (
              <tr
                key={r.id}
                style={{
                  borderBottom: "1px solid var(--hairline)",
                  borderLeft: `3px solid ${STATUS_COLOR[r.status]}`,
                  opacity: saving === r.id ? 0.5 : 1,
                }}
              >
                <td style={{ ...td, whiteSpace: "nowrap", fontSize: "0.85rem" }}>
                  {fmtFecha(r.created_at)}
                </td>
                <td style={{ ...td, color: "var(--c-white)", fontWeight: 600 }}>
                  {r.name || "(sin nombre)"}
                  {r.mindbody_client_id && (
                    <div
                      style={{ fontSize: "0.7rem", color: "var(--c-faint)" }}
                      title="Sincronizado con Mindbody"
                    >
                      MB #{r.mindbody_client_id}
                    </div>
                  )}
                </td>
                <td style={{ ...td, whiteSpace: "nowrap" }}>
                  {r.phone ? (
                    <a
                      href={waLink(r.phone)}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        color: "#3ECF8E",
                        textDecoration: "none",
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {r.phone} ↗
                    </a>
                  ) : (
                    "—"
                  )}
                </td>
                <td style={{ ...td, whiteSpace: "nowrap" }}>
                  {r.locations?.name ?? "—"}
                </td>
                <td style={{ ...td, fontSize: "0.82rem" }}>
                  {r.utm_source ? (
                    <span title={r.utm_campaign ?? undefined}>
                      {r.utm_source}
                      {r.utm_campaign ? ` · ${r.utm_campaign.slice(0, 24)}` : ""}
                    </span>
                  ) : (
                    <span style={{ color: "var(--c-faint)" }}>directo</span>
                  )}
                </td>
                <td style={{ ...td, whiteSpace: "nowrap" }}>
                  <select
                    value={r.status}
                    onChange={(e) =>
                      void updateLead(r.id, { status: e.target.value as LeadStatus })
                    }
                    style={{ ...selectStyle, color: STATUS_COLOR[r.status] }}
                    aria-label={`Estado de ${r.name ?? "lead"}`}
                  >
                    {ORDER.map((s) => (
                      <option key={s} value={s}>
                        {STATUS_LABEL[s]}
                      </option>
                    ))}
                  </select>
                </td>
                <td style={{ ...td, minWidth: "14rem", maxWidth: "20rem" }}>
                  {editing === r.id ? (
                    <div style={{ display: "grid", gap: "0.4rem" }}>
                      <textarea
                        value={noteDraft}
                        onChange={(e) => setNoteDraft(e.target.value)}
                        rows={3}
                        style={{ ...selectStyle, width: "100%", resize: "vertical" }}
                        autoFocus
                      />
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button
                          type="button"
                          className="btn btn-primary btn-nav"
                          onClick={() => {
                            void updateLead(r.id, { notes: noteDraft || null });
                            setEditing(null);
                          }}
                        >
                          Guardar
                        </button>
                        <button
                          type="button"
                          className="btn btn-ghost btn-nav"
                          onClick={() => setEditing(null)}
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(r.id);
                        setNoteDraft(r.notes ?? "");
                      }}
                      style={{
                        background: "none",
                        border: 0,
                        padding: 0,
                        color: r.notes ? "var(--c-mist)" : "var(--c-faint)",
                        cursor: "pointer",
                        textAlign: "left",
                        fontSize: "0.85rem",
                        lineHeight: 1.5,
                      }}
                      title="Click para editar"
                    >
                      {r.notes || "+ Agregar nota"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
