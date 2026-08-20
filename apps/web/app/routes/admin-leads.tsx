import { useEffect, useMemo, useState } from "react";
import type { Route } from "./+types/admin-leads";
import { AdminShell, useAdminGuard } from "../components/admin";
import { getSupabase } from "../lib/supabase";

/* ============================================================
   /admin/leads: bandeja de leads de Studios y del assessment.
   Los leads entran por el form de cada sede (POST /leads) con
   atribución utm y sync best-effort a Mindbody. Acá el equipo
   comercial los trabaja todos los días: resumen por canal,
   filtros, WhatsApp con un click, respuestas del assessment
   legibles y cambio de estado del pipeline.

   Client-rendered tras useAdminGuard (RLS: staff all).
   Fuentes: tabla leads (lectura + update de status/notes) y
   vista v_leads_by_channel (resumen por canal, mismo
   clasificador channel_of() que usa el dashboard de ventas).
   ============================================================ */

export function meta({}: Route.MetaArgs) {
  return [{ title: "54D: Leads" }, { name: "robots", content: "noindex" }];
}

type LeadStatus = "new" | "contacted" | "booked" | "converted" | "lost";

interface LeadRow {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  status: LeadStatus;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  notes: string | null;
  mindbody_client_id: string | null;
  created_at: string;
  locations: { name: string; slug: string } | null;
}

/** Fila de v_leads_by_channel (una por canal, orden por total desc). */
interface ChannelRow {
  channel: string | null;
  leads_total: number | null;
  nuevos: number | null;
  contactados: number | null;
  ultimos_30d: number | null;
  sincronizados_mindbody: number | null;
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
  lost: "rgba(255,255,255,0.55)",
};

const ORDER: LeadStatus[] = ["new", "contacted", "booked", "converted", "lost"];

/* ------------------------------------------------------------
   Canal. Espejo exacto en cliente de channel_of() tal como la
   llama v_leads_by_channel: solo utm_source y utm_medium
   (la tabla leads no guarda referrer, fbclid ni gclid, así que
   esas ramas de la función nunca se activan para un lead).
   Sirve para filtrar y etiquetar fila por fila con el MISMO
   criterio con el que la vista agrupa el resumen de arriba.
   Cambió la migración: actualizar las dos cosas juntas.
   ------------------------------------------------------------ */
const META_SOURCES = ["meta", "facebook", "fb", "ig", "instagram"];
const META_PAID_MEDIUMS = ["paid", "cpc", "ppc", "paid_social"];
const PAID_MEDIUMS = ["cpc", "ppc", "paid"];
const EMAIL_MEDIUMS = ["email", "newsletter", "mail"];
const EMAIL_SOURCES = ["newsletter", "klaviyo", "mailchimp", "email"];

function channelOf(source: string | null, medium: string | null): string {
  const s = (source ?? "").toLowerCase();
  const m = (medium ?? "").toLowerCase();
  if (META_SOURCES.includes(s) && META_PAID_MEDIUMS.includes(m))
    return "meta_ads";
  if (META_SOURCES.includes(s)) return "meta_organic";
  if (PAID_MEDIUMS.includes(m)) return "paid_other";
  if (EMAIL_MEDIUMS.includes(m) || EMAIL_SOURCES.includes(s))
    return "newsletter";
  if (m === "organic") return "seo";
  if (source === null) return "direct";
  return s;
}

/** Etiquetas humanas de canal. Mismas que usa el resumen de ventas. */
const CHANNEL_LABEL: Record<string, string> = {
  meta_ads: "Meta Ads",
  meta_organic: "Meta orgánico",
  google_ads: "Google Ads",
  paid_other: "Otro pago",
  newsletter: "Newsletter",
  seo: "Búsqueda orgánica",
  social_organic: "Social orgánico",
  direct: "Directo",
  referral: "Referidos",
};

/** Canal desconocido (utm_source suelto): se muestra tal cual, capitalizado. */
function channelLabel(channel: string | null | undefined): string {
  if (!channel) return "Sin origen";
  return (
    CHANNEL_LABEL[channel] ?? channel.charAt(0).toUpperCase() + channel.slice(1)
  );
}

/* ------------------------------------------------------------
   Notas. El assessment de ON serializa sus respuestas en el
   campo notes con el formato que arma buildNotes() en
   routes/assessment.tsx:

     Assessment ON (es)
     Categoría: pregunta -> respuesta
     ...

   Acá se parsea a una lista legible. Todo lo que no entre en
   ese molde (nota escrita a mano por el equipo, mensaje del
   form de contacto) se conserva como texto libre.
   ------------------------------------------------------------ */
interface QA {
  cat: string;
  q: string;
  a: string;
}
interface ParsedNotes {
  isAssessment: boolean;
  header: string | null;
  answers: QA[];
  free: string;
}

function parseNotes(notes: string | null): ParsedNotes {
  const empty: ParsedNotes = {
    isAssessment: false,
    header: null,
    answers: [],
    free: "",
  };
  if (!notes || !notes.trim()) return empty;

  const lines = notes.split("\n");
  const isAssessment = /^assessment\b/i.test(lines[0]?.trim() ?? "");
  const answers: QA[] = [];
  const free: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (i === 0 && isAssessment) continue;
    const arrow = line.lastIndexOf(" -> ");
    const colon = line.indexOf(":");
    if (arrow > 0 && colon > 0 && colon < arrow) {
      answers.push({
        cat: line.slice(0, colon).trim(),
        q: line.slice(colon + 1, arrow).trim(),
        a: line.slice(arrow + 4).trim(),
      });
    } else if (line.trim()) {
      free.push(line);
    }
  }

  return {
    isAssessment,
    header: isAssessment ? (lines[0]?.trim() ?? null) : null,
    answers,
    free: free.join("\n"),
  };
}

const fmtFecha = (iso: string) => {
  const d = new Date(iso);
  return (
    d.toLocaleDateString("es-MX", { day: "2-digit", month: "short" }) +
    " · " +
    d.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })
  );
};

/* wa.me exige solo dígitos, código de país incluido y sin '+'. */
const onlyDigits = (phone: string) => phone.replace(/\D/g, "");
/** Teléfono utilizable: al menos 8 dígitos (evita basura del form). */
const hasRealPhone = (phone: string | null): phone is string =>
  !!phone && onlyDigits(phone).length >= 8;

/** Primer mensaje del equipo comercial. Nombra la sede si el lead tiene. */
function waHref(lead: LeadRow): string {
  const first = (lead.name ?? "").trim().split(/\s+/)[0];
  const saludo = first ? `Hola ${first}` : "Hola";
  const quien = lead.locations?.name ? `54D ${lead.locations.name}` : "54D";
  const msg =
    `${saludo}, te escribimos de ${quien}. ` +
    "Recibimos tu solicitud y queremos ayudarte a arrancar. " +
    "¿Cuándo te queda cómodo que te llamemos?";
  return `https://wa.me/${onlyDigits(lead.phone as string)}?text=${encodeURIComponent(msg)}`;
}

/** Corta sin partir la palabra a la mitad sin avisar. */
const truncate = (text: string, max: number) =>
  text.length > max ? text.slice(0, max).trimEnd() + "…" : text;

const LIMIT = 500;

export default function AdminLeads() {
  const { ready } = useAdminGuard();
  const [rows, setRows] = useState<LeadRow[]>([]);
  const [channels, setChannels] = useState<ChannelRow[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [fStatus, setFStatus] = useState<"all" | LeadStatus>("all");
  const [fSede, setFSede] = useState<string>("all");
  const [fChannel, setFChannel] = useState<string>("all");
  const [q, setQ] = useState("");
  const [sortDesc, setSortDesc] = useState(true);

  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());
  const [editing, setEditing] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    const supabase = getSupabase();
    void (async () => {
      const [l, c] = await Promise.all([
        supabase
          .from("leads")
          .select(
            "id, name, email, phone, status, utm_source, utm_medium, utm_campaign, notes, mindbody_client_id, created_at, locations(name, slug)",
          )
          .order("created_at", { ascending: false })
          .limit(LIMIT),
        supabase.from("v_leads_by_channel").select("*"),
      ]);
      if (cancelled) return;
      if (l.error) setLoadError(l.error.message);
      else setRows((l.data ?? []) as unknown as LeadRow[]);
      /* El resumen por canal es complementario: si falla, la bandeja
         igual sirve. No se pisa el error de la tabla, que es el grave. */
      if (!c.error) setChannels((c.data ?? []) as ChannelRow[]);
      setLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [ready]);

  /* Canal por lead, calculado una vez. */
  const channelById = useMemo(() => {
    const m = new Map<string, string>();
    for (const r of rows) m.set(r.id, channelOf(r.utm_source, r.utm_medium));
    return m;
  }, [rows]);

  const sedes = useMemo(() => {
    const m = new Map<string, string>();
    for (const r of rows)
      if (r.locations) m.set(r.locations.slug, r.locations.name);
    return [...m.entries()].sort((a, b) => a[1].localeCompare(b[1], "es"));
  }, [rows]);

  /* Opciones de canal: primero las de la vista (ya vienen por volumen),
     después cualquier canal presente en las filas cargadas que la vista
     no haya devuelto todavía. */
  const channelOptions = useMemo(() => {
    const out: string[] = [];
    for (const c of channels)
      if (c.channel && !out.includes(c.channel)) out.push(c.channel);
    for (const v of channelById.values())
      if (v && !out.includes(v)) out.push(v);
    return out;
  }, [channels, channelById]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const out = rows.filter((r) => {
      if (fStatus !== "all" && r.status !== fStatus) return false;
      if (fSede !== "all" && r.locations?.slug !== fSede) return false;
      if (fChannel !== "all" && channelById.get(r.id) !== fChannel)
        return false;
      if (
        needle &&
        !`${r.name ?? ""} ${r.phone ?? ""} ${r.email ?? ""}`
          .toLowerCase()
          .includes(needle)
      )
        return false;
      return true;
    });
    out.sort((a, b) => {
      const d =
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      return sortDesc ? -d : d;
    });
    return out;
  }, [rows, fStatus, fSede, fChannel, q, sortDesc, channelById]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { total: rows.length, week: 0 };
    for (const s of ORDER) c[s] = 0;
    const weekAgo = Date.now() - 7 * 86400_000;
    for (const r of rows) {
      c[r.status] = (c[r.status] ?? 0) + 1;
      if (new Date(r.created_at).getTime() > weekAgo) c.week++;
    }
    return c;
  }, [rows]);

  const anyFilter =
    fStatus !== "all" ||
    fSede !== "all" ||
    fChannel !== "all" ||
    q.trim() !== "";

  function toggleRow(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function updateLead(
    lead: LeadRow,
    patch: Partial<Pick<LeadRow, "status" | "notes">>,
  ): Promise<boolean> {
    setSaving(lead.id);
    setSaveError(null);
    const { error } = await getSupabase()
      .from("leads")
      .update(patch)
      .eq("id", lead.id);
    setSaving(null);
    if (error) {
      /* Sin cambio local: el select vuelve solo al valor de la base. */
      setSaveError(
        `No pudimos guardar el cambio de ${lead.name || "este lead"}: ${error.message}`,
      );
      return false;
    }
    setRows((prev) =>
      prev.map((r) => (r.id === lead.id ? { ...r, ...patch } : r)),
    );
    return true;
  }

  const showChannelSummary = channels.length > 0;
  /* Base vacía de verdad (no un error de carga disfrazado de cero): un
     solo estado vacío, sin filtros ni tabla que no filtran nada. */
  const noLeadsAtAll = loaded && rows.length === 0 && !loadError;

  if (noLeadsAtAll) {
    return (
      <AdminShell active="/admin/leads">
        <h1 className="admin-title">Leads</h1>
        <div className="leads-empty">
          <h3>La bandeja está vacía</h3>
          <p>
            Todavía no entró ningún lead. Cuando alguien complete el formulario
            de una sede o termine el assessment, aparece acá con su origen, su
            teléfono y el botón para escribirle por WhatsApp.
          </p>
          <p>
            Con el primero se arma también el desglose por canal (Meta Ads,
            newsletter, búsqueda orgánica, directo, referidos) con el mismo
            criterio que usa el resumen de ventas, así que los números se
            comparan entre sí.
          </p>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell active="/admin/leads">
      <h1 className="admin-title">Leads</h1>

      {loadError && (
        <p
          className="leads-alert"
          role="alert"
          style={{ marginBottom: "1.4rem" }}
        >
          No pudimos cargar los leads: {loadError}. Recarga la página.
        </p>
      )}

      {/* ---------- Resumen por canal (v_leads_by_channel) ---------- */}
      <section style={{ marginBottom: "2rem" }}>
        <h2 className="leads-sectitle" style={{ marginBottom: "0.9rem" }}>
          De dónde vienen
        </h2>

        {!loaded ? (
          <p className="leads-hint">Cargando canales…</p>
        ) : showChannelSummary ? (
          <div className="leads-chan-grid">
            {channels.map((c) => {
              const key = c.channel ?? "sin_origen";
              const active = fChannel === c.channel;
              return (
                <button
                  key={key}
                  type="button"
                  className={`leads-chan-card${active ? " is-active" : ""}`}
                  aria-pressed={active}
                  onClick={() =>
                    setFChannel(active ? "all" : (c.channel ?? "all"))
                  }
                >
                  <span className="leads-chan-label">
                    {channelLabel(c.channel)}
                  </span>
                  <span className="leads-chan-total">{c.leads_total ?? 0}</span>
                  <span className="leads-chan-sub">
                    <em>{c.nuevos ?? 0}</em> sin contactar ·{" "}
                    {c.ultimos_30d ?? 0} en 30 días
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          /* Con leads cargados pero sin filas de la vista, lo que falló es la
             vista: la bandeja de abajo se sigue pudiendo trabajar. */
          <div className="leads-empty">
            <h3>El desglose por canal no cargó</h3>
            <p>
              La bandeja de abajo funciona igual. Recarga la página para
              reintentar el resumen por canal; mientras tanto, cada lead muestra
              su canal en la columna correspondiente.
            </p>
          </div>
        )}
      </section>

      {/* ---------- Filtros: estado (chips con conteo) + sede + canal ---------- */}
      <div className="leads-filters" style={{ marginBottom: "0.9rem" }}>
        <div className="leads-chips">
          <button
            type="button"
            className={`leads-chip${fStatus === "all" ? " is-active" : ""}`}
            aria-pressed={fStatus === "all"}
            onClick={() => setFStatus("all")}
          >
            Todos <b>{counts.total}</b>
          </button>
          {ORDER.map((s) => (
            <button
              key={s}
              type="button"
              className={`leads-chip${fStatus === s ? " is-active" : ""}`}
              aria-pressed={fStatus === s}
              onClick={() => setFStatus(fStatus === s ? "all" : s)}
            >
              <i
                className="leads-dot"
                style={{ background: STATUS_COLOR[s] }}
                aria-hidden="true"
              />
              {STATUS_LABEL[s]} <b>{counts[s] ?? 0}</b>
            </button>
          ))}
        </div>
      </div>

      <div className="leads-filters" style={{ marginBottom: "1.2rem" }}>
        <input
          type="search"
          className="leads-input"
          placeholder="Buscar por nombre, teléfono o email…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Buscar leads"
        />
        <select
          className="leads-select"
          value={fSede}
          onChange={(e) => setFSede(e.target.value)}
          aria-label="Filtrar por sede"
        >
          <option value="all">Todas las sedes</option>
          {sedes.map(([slug, name]) => (
            <option key={slug} value={slug}>
              {name}
            </option>
          ))}
        </select>
        <select
          className="leads-select"
          value={fChannel}
          onChange={(e) => setFChannel(e.target.value)}
          aria-label="Filtrar por canal"
        >
          <option value="all">Todos los canales</option>
          {channelOptions.map((c) => (
            <option key={c} value={c}>
              {channelLabel(c)}
            </option>
          ))}
        </select>
        <select
          className="leads-select"
          value={sortDesc ? "desc" : "asc"}
          onChange={(e) => setSortDesc(e.target.value === "desc")}
          aria-label="Ordenar por fecha"
        >
          <option value="desc">Más recientes primero</option>
          <option value="asc">Más antiguos primero</option>
        </select>
        {anyFilter && (
          <button
            type="button"
            className="leads-chip"
            onClick={() => {
              setFStatus("all");
              setFSede("all");
              setFChannel("all");
              setQ("");
            }}
          >
            Limpiar filtros
          </button>
        )}
        <span className="leads-hint">
          {filtered.length} de {rows.length}
          {rows.length === LIMIT ? ` (últimos ${LIMIT})` : ""}
          {" · "}
          {counts.week} esta semana
        </span>
      </div>

      {saveError && (
        <p
          className="leads-alert"
          role="alert"
          style={{ marginBottom: "1rem" }}
        >
          {saveError}
        </p>
      )}

      {/* ---------- Bandeja ---------- */}
      <div className="leads-tablewrap">
        <table className="leads-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Lead</th>
              <th>WhatsApp</th>
              <th>Sede</th>
              <th>Canal</th>
              <th>Estado</th>
              <th>Detalle</th>
            </tr>
          </thead>
          <tbody>
            {!loaded && (
              <tr className="leads-row">
                <td colSpan={7} style={{ padding: "2rem 1.1rem" }}>
                  Cargando leads…
                </td>
              </tr>
            )}

            {loaded && filtered.length === 0 && (
              <tr className="leads-row">
                <td colSpan={7} style={{ padding: "2rem 1.1rem" }}>
                  {loadError
                    ? "No hay leads para mostrar: la carga falló."
                    : "Ningún lead coincide con estos filtros."}
                </td>
              </tr>
            )}

            {filtered.map((r) => {
              const parsed = parseNotes(r.notes);
              const isOpen = expanded.has(r.id);
              const channel = channelById.get(r.id) ?? "direct";
              const detalle = parsed.isAssessment
                ? `Assessment · ${parsed.answers.length} respuestas`
                : parsed.free
                  ? truncate(parsed.free.split("\n")[0], 42)
                  : "Sin notas";

              return [
                <tr
                  key={r.id}
                  className={`leads-row${saving === r.id ? " is-saving" : ""}`}
                  style={{ borderLeft: `3px solid ${STATUS_COLOR[r.status]}` }}
                >
                  <td className="leads-nowrap">{fmtFecha(r.created_at)}</td>

                  <td>
                    <span className="leads-name">
                      {r.name || "(sin nombre)"}
                    </span>
                    {r.email && <span className="leads-sub">{r.email}</span>}
                    {r.mindbody_client_id && (
                      <span
                        className="leads-sub"
                        title="Sincronizado con Mindbody"
                      >
                        Mindbody #{r.mindbody_client_id}
                      </span>
                    )}
                  </td>

                  <td className="leads-nowrap">
                    {hasRealPhone(r.phone) ? (
                      <>
                        <a
                          className="leads-wa"
                          href={waHref(r)}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={`Escribir por WhatsApp a ${r.name || "este lead"}`}
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            aria-hidden="true"
                          >
                            <path d="M12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413A11.815 11.815 0 0012.05 0zm0 2.008c2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884zm-4.4 3.335c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01z" />
                          </svg>
                          WhatsApp
                        </a>
                        <span className="leads-sub leads-num">{r.phone}</span>
                      </>
                    ) : r.phone ? (
                      <>
                        <span className="leads-hint">Número incompleto</span>
                        <span className="leads-sub leads-num">{r.phone}</span>
                      </>
                    ) : (
                      <span className="leads-hint">Sin teléfono</span>
                    )}
                  </td>

                  <td className="leads-nowrap">
                    {r.locations?.name ?? (
                      <span className="leads-hint">Sin sede</span>
                    )}
                  </td>

                  <td>
                    <span className="leads-badge">{channelLabel(channel)}</span>
                    {r.utm_campaign && (
                      <span className="leads-sub" title={r.utm_campaign}>
                        {truncate(r.utm_campaign, 28)}
                      </span>
                    )}
                  </td>

                  <td className="leads-nowrap">
                    <select
                      className="leads-status"
                      value={r.status}
                      disabled={saving === r.id}
                      onChange={(e) =>
                        void updateLead(r, {
                          status: e.target.value as LeadStatus,
                        })
                      }
                      style={{ color: STATUS_COLOR[r.status] }}
                      aria-label={`Estado de ${r.name ?? "lead"}`}
                    >
                      {ORDER.map((s) => (
                        <option key={s} value={s}>
                          {STATUS_LABEL[s]}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td>
                    <button
                      type="button"
                      className="leads-toggle"
                      aria-expanded={isOpen}
                      onClick={() => toggleRow(r.id)}
                    >
                      <span className="leads-caret" aria-hidden="true">
                        {isOpen ? "▾" : "▸"}
                      </span>
                      {detalle}
                    </button>
                  </td>
                </tr>,

                isOpen && (
                  <tr key={`${r.id}-drawer`} className="leads-drawer">
                    <td colSpan={7}>
                      <div className="leads-drawer-inner">
                        {parsed.isAssessment && (
                          <div>
                            <p className="leads-drawer-title">
                              Respuestas del assessment
                              {parsed.header && (
                                <span className="leads-hint">
                                  {" "}
                                  · {parsed.header}
                                </span>
                              )}
                            </p>
                            <div className="leads-qa">
                              {parsed.answers.map((qa, i) => (
                                <div
                                  className="leads-qa-item"
                                  key={`${r.id}-qa-${i}`}
                                >
                                  <span className="leads-qa-cat">{qa.cat}</span>
                                  <span className="leads-qa-q">{qa.q}</span>
                                  <span className="leads-qa-a">
                                    {qa.a || "Sin responder"}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {!parsed.isAssessment && parsed.answers.length > 0 && (
                          <div className="leads-qa">
                            {parsed.answers.map((qa, i) => (
                              <div
                                className="leads-qa-item"
                                key={`${r.id}-qa-${i}`}
                              >
                                <span className="leads-qa-cat">{qa.cat}</span>
                                <span className="leads-qa-q">{qa.q}</span>
                                <span className="leads-qa-a">
                                  {qa.a || "Sin responder"}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        <div>
                          <p className="leads-drawer-title">
                            Nota interna
                            {parsed.isAssessment && (
                              <span className="leads-hint">
                                {" "}
                                · el texto incluye las respuestas de arriba, no
                                las borres
                              </span>
                            )}
                          </p>

                          {editing === r.id ? (
                            <div style={{ display: "grid", gap: "0.6rem" }}>
                              <textarea
                                className="leads-textarea"
                                value={noteDraft}
                                onChange={(e) => setNoteDraft(e.target.value)}
                                rows={parsed.isAssessment ? 10 : 4}
                                aria-label={`Nota de ${r.name ?? "lead"}`}
                                autoFocus
                              />
                              <div style={{ display: "flex", gap: "0.6rem" }}>
                                <button
                                  type="button"
                                  className="btn btn-primary btn-nav"
                                  disabled={saving === r.id}
                                  onClick={() => {
                                    void updateLead(r, {
                                      notes: noteDraft.trim()
                                        ? noteDraft
                                        : null,
                                    }).then((ok) => {
                                      if (ok) setEditing(null);
                                    });
                                  }}
                                >
                                  Guardar nota
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
                            <div style={{ display: "grid", gap: "0.6rem" }}>
                              <p className="leads-note">
                                {parsed.isAssessment
                                  ? parsed.free || "Sin comentarios del equipo."
                                  : parsed.free || "Sin notas todavía."}
                              </p>
                              <div>
                                <button
                                  type="button"
                                  className="btn btn-ghost btn-nav"
                                  onClick={() => {
                                    setEditing(r.id);
                                    setNoteDraft(r.notes ?? "");
                                  }}
                                >
                                  {r.notes ? "Editar nota" : "Agregar nota"}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ),
              ];
            })}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
