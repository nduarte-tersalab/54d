import { useEffect, useRef, useState } from "react";
import type { Route } from "./+types/admin-programs";
import { AdminShell } from "../components/admin";
import { getSupabase } from "../lib/supabase";

/* ============================================================
   ABM de Programas (admin 54D) — client-rendered.
   - Lista programs ordenados por sort, cards glass.
   - Toggle de published con update optimista.
   - Edición inline expandible por card (Guardar por card).
   - program_prices en solo lectura (stripe_price_id).
   Sin alta ni borrado: los programas los define el negocio.
   ============================================================ */

export function meta({}: Route.MetaArgs) {
  return [
    { title: "54D: Programas (admin)" },
    { name: "robots", content: "noindex" },
  ];
}

interface ProgramRow {
  id: string;
  slug: string;
  type: "online" | "studio";
  name: string;
  tagline: string | null;
  description: string | null;
  duration_days: number | null;
  hero_image: string | null;
  hero_video: string | null;
  published: boolean;
  sort: number;
}

interface PriceRow {
  program_id: string;
  stripe_price_id: string;
  currency: string;
  unit_amount: number;
  interval: "month" | "quarter" | "year" | "one_time" | null;
  active: boolean;
}

const INTERVAL_LABEL: Record<string, string> = {
  month: "mensual",
  quarter: "trimestral",
  year: "anual",
  one_time: "pago único",
};

function formatPrice(p: PriceRow): string {
  const amount = (p.unit_amount / 100).toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const interval = p.interval ? ` · ${INTERVAL_LABEL[p.interval] ?? p.interval}` : "";
  return `${p.currency.toUpperCase()} ${amount}${interval}`;
}

/* ---------- Toggle de published (switch accesible) ---------- */

function PublishedToggle({
  checked,
  disabled,
  onToggle,
}: {
  checked: boolean;
  disabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={checked ? "Publicado (clic para despublicar)" : "No publicado (clic para publicar)"}
      disabled={disabled}
      onClick={onToggle}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.55rem",
        background: "none",
        border: "none",
        padding: 0,
        cursor: disabled ? "wait" : "pointer",
        color: checked ? "var(--c-yellow)" : "var(--c-faint)",
        fontSize: "0.72rem",
        textTransform: "uppercase",
        letterSpacing: "0.14em",
        fontFamily: "inherit",
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: 38,
          height: 21,
          borderRadius: 999,
          border: "1px solid " + (checked ? "rgba(255, 210, 0, 0.6)" : "var(--hairline)"),
          background: checked ? "rgba(255, 210, 0, 0.25)" : "var(--glass)",
          position: "relative",
          transition: "background 0.2s ease, border-color 0.2s ease",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            position: "absolute",
            top: 2,
            left: checked ? 18 : 2,
            width: 15,
            height: 15,
            borderRadius: "50%",
            background: checked ? "var(--c-yellow)" : "rgba(255, 255, 255, 0.45)",
            transition: "left 0.2s ease, background 0.2s ease",
          }}
        />
      </span>
      {checked ? "Publicado" : "Borrador"}
    </button>
  );
}

/* ---------- Card de programa con edición inline ---------- */

interface ProgramForm {
  name: string;
  tagline: string;
  description: string;
  duration_days: string;
  hero_image: string;
  hero_video: string;
  sort: string;
}

function formFromProgram(p: ProgramRow): ProgramForm {
  return {
    name: p.name,
    tagline: p.tagline ?? "",
    description: p.description ?? "",
    duration_days: String(p.duration_days ?? 54),
    hero_image: p.hero_image ?? "",
    hero_video: p.hero_video ?? "",
    sort: String(p.sort),
  };
}

type SaveState = "idle" | "saving" | "saved" | "error";

function ProgramCard({
  program,
  prices,
  toggling,
  toggleError,
  onTogglePublished,
  onSaved,
}: {
  program: ProgramRow;
  prices: PriceRow[];
  toggling: boolean;
  toggleError: string | null;
  onTogglePublished: () => void;
  onSaved: (updated: ProgramRow) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [form, setForm] = useState<ProgramForm>(() => formFromProgram(program));
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (savedTimer.current) clearTimeout(savedTimer.current);
    };
  }, []);

  function set<K extends keyof ProgramForm>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    if (saveState === "saved" || saveState === "error") setSaveState("idle");
  }

  function toggleExpanded() {
    if (!expanded) {
      // Al abrir, resincroniza el formulario con los datos actuales.
      setForm(formFromProgram(program));
      setSaveState("idle");
      setSaveError(null);
    }
    setExpanded((e) => !e);
  }

  async function handleSave() {
    const name = form.name.trim();
    if (!name) {
      setSaveState("error");
      setSaveError("El nombre no puede quedar vacío.");
      return;
    }
    const duration = Number(form.duration_days);
    if (!Number.isInteger(duration) || duration <= 0) {
      setSaveState("error");
      setSaveError("Duración (días) debe ser un entero mayor a 0.");
      return;
    }
    const sort = Number(form.sort);
    if (!Number.isInteger(sort)) {
      setSaveState("error");
      setSaveError("Orden debe ser un número entero.");
      return;
    }

    const payload = {
      name,
      tagline: form.tagline.trim() || null,
      description: form.description.trim() || null,
      duration_days: duration,
      hero_image: form.hero_image.trim() || null,
      hero_video: form.hero_video.trim() || null,
      sort,
    };

    setSaveState("saving");
    setSaveError(null);
    const { error } = await getSupabase()
      .from("programs")
      .update(payload)
      .eq("id", program.id);

    if (error) {
      setSaveState("error");
      setSaveError(error.message);
      return;
    }

    setSaveState("saved");
    onSaved({ ...program, ...payload });
    if (savedTimer.current) clearTimeout(savedTimer.current);
    savedTimer.current = setTimeout(() => setSaveState("idle"), 2500);
  }

  const isOnline = program.type === "online";

  return (
    <article
      style={{
        background: "var(--glass)",
        border: "1px solid var(--hairline)",
        borderRadius: "var(--r-md)",
        padding: "1.4rem 1.5rem",
      }}
    >
      {/* Cabecera de la card */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          flexWrap: "wrap",
        }}
      >
        <div style={{ flex: 1, minWidth: 220 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.7rem", flexWrap: "wrap" }}>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                fontSize: "1.25rem",
                textTransform: "uppercase",
                color: "var(--c-white)",
                margin: 0,
              }}
            >
              {program.name}
            </h2>
            <span
              style={{
                fontSize: "0.66rem",
                textTransform: "uppercase",
                letterSpacing: "0.14em",
                padding: "0.25rem 0.6rem",
                borderRadius: 999,
                border: "1px solid " + (isOnline ? "rgba(255, 210, 0, 0.4)" : "var(--hairline)"),
                background: isOnline ? "rgba(255, 210, 0, 0.1)" : "var(--glass)",
                color: isOnline ? "var(--c-yellow)" : "var(--c-mist)",
              }}
            >
              {isOnline ? "Online" : "Studio"}
            </span>
          </div>
          <div
            style={{
              marginTop: "0.35rem",
              fontSize: "0.78rem",
              color: "var(--c-faint)",
              fontFamily: "monospace",
            }}
          >
            /{program.slug} · orden {program.sort}
          </div>
        </div>

        <PublishedToggle
          checked={program.published}
          disabled={toggling}
          onToggle={onTogglePublished}
        />

        <button type="button" className="btn btn-ghost" onClick={toggleExpanded}>
          {expanded ? "Cerrar" : "Editar"}
        </button>
      </div>

      {toggleError && (
        <p style={{ marginTop: "0.6rem", fontSize: "0.82rem", color: "#ff6b6b" }}>
          {toggleError}
        </p>
      )}

      {/* Precios Stripe (solo lectura) */}
      <div style={{ marginTop: "0.9rem" }}>
        <div
          style={{
            fontSize: "0.68rem",
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            color: "var(--c-faint)",
            marginBottom: "0.4rem",
          }}
        >
          Precios de Stripe (solo lectura)
        </div>
        {prices.length === 0 ? (
          <p style={{ fontSize: "0.82rem", color: "var(--c-faint)", margin: 0 }}>
            Sin precios de Stripe vinculados todavía.
          </p>
        ) : (
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: "0.35rem" }}>
            {prices.map((price) => (
              <li
                key={price.stripe_price_id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.7rem",
                  flexWrap: "wrap",
                  fontSize: "0.8rem",
                  color: "var(--c-mist)",
                }}
              >
                <code
                  style={{
                    fontFamily: "monospace",
                    fontSize: "0.76rem",
                    padding: "0.2rem 0.5rem",
                    borderRadius: 6,
                    background: "var(--glass)",
                    border: "1px solid var(--hairline)",
                    color: "var(--c-mist)",
                    wordBreak: "break-all",
                  }}
                >
                  {price.stripe_price_id}
                </code>
                <span>{formatPrice(price)}</span>
                {!price.active && (
                  <span style={{ color: "var(--c-faint)", fontSize: "0.72rem" }}>(inactivo)</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Edición inline */}
      {expanded && (
        <div
          style={{
            marginTop: "1.2rem",
            paddingTop: "1.2rem",
            borderTop: "1px solid var(--hairline)",
          }}
        >
          <div className="field">
            <label htmlFor={`name-${program.id}`}>Nombre</label>
            <input
              id={`name-${program.id}`}
              type="text"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor={`tagline-${program.id}`}>Tagline</label>
            <input
              id={`tagline-${program.id}`}
              type="text"
              value={form.tagline}
              placeholder="Frase corta del programa"
              onChange={(e) => set("tagline", e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor={`description-${program.id}`}>Descripción (markdown)</label>
            <textarea
              id={`description-${program.id}`}
              rows={6}
              value={form.description}
              placeholder="Descripción larga del programa…"
              onChange={(e) => set("description", e.target.value)}
            />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: "0 1rem",
            }}
          >
            <div className="field">
              <label htmlFor={`duration-${program.id}`}>Duración (días)</label>
              <input
                id={`duration-${program.id}`}
                type="number"
                min={1}
                step={1}
                value={form.duration_days}
                onChange={(e) => set("duration_days", e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor={`sort-${program.id}`}>Orden</label>
              <input
                id={`sort-${program.id}`}
                type="number"
                step={1}
                value={form.sort}
                onChange={(e) => set("sort", e.target.value)}
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor={`hero-image-${program.id}`}>Hero image (URL)</label>
            <input
              id={`hero-image-${program.id}`}
              type="url"
              value={form.hero_image}
              placeholder="https://…"
              onChange={(e) => set("hero_image", e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor={`hero-video-${program.id}`}>Hero video (URL)</label>
            <input
              id={`hero-video-${program.id}`}
              type="url"
              value={form.hero_video}
              placeholder="https://…"
              onChange={(e) => set("hero_video", e.target.value)}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.9rem", flexWrap: "wrap" }}>
            <button
              type="button"
              className="btn btn-primary"
              disabled={saveState === "saving"}
              onClick={() => void handleSave()}
            >
              {saveState === "saving" ? "Guardando…" : "Guardar"}
            </button>
            {saveState === "saved" && (
              <span style={{ fontSize: "0.82rem", color: "var(--c-yellow)" }}>
                Guardado ✓
              </span>
            )}
            {saveState === "error" && saveError && (
              <span style={{ fontSize: "0.82rem", color: "#ff6b6b" }}>{saveError}</span>
            )}
          </div>
        </div>
      )}
    </article>
  );
}

/* ---------- Página ---------- */

type LoadState = "loading" | "error" | "ready";

function ProgramsPanel() {
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [programs, setPrograms] = useState<ProgramRow[]>([]);
  const [pricesByProgram, setPricesByProgram] = useState<Record<string, PriceRow[]>>({});
  const [togglingIds, setTogglingIds] = useState<Record<string, boolean>>({});
  const [toggleErrors, setToggleErrors] = useState<Record<string, string>>({});

  async function load() {
    setLoadState("loading");
    setLoadError(null);
    const supabase = getSupabase();

    const [programsRes, pricesRes] = await Promise.all([
      supabase
        .from("programs")
        .select(
          "id, slug, type, name, tagline, description, duration_days, hero_image, hero_video, published, sort"
        )
        .order("sort", { ascending: true }),
      supabase
        .from("program_prices")
        .select("program_id, stripe_price_id, currency, unit_amount, interval, active")
        .order("unit_amount", { ascending: true }),
    ]);

    if (programsRes.error) {
      setLoadState("error");
      setLoadError(programsRes.error.message);
      return;
    }

    const priceRows: PriceRow[] = pricesRes.error
      ? [] // los precios son informativos: si fallan, la lista sigue funcionando
      : ((pricesRes.data ?? []) as PriceRow[]);
    const grouped: Record<string, PriceRow[]> = {};
    for (const price of priceRows) {
      (grouped[price.program_id] ??= []).push(price);
    }

    setPrograms((programsRes.data ?? []) as ProgramRow[]);
    setPricesByProgram(grouped);
    setLoadState("ready");
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function togglePublished(program: ProgramRow) {
    const next = !program.published;
    // Update optimista
    setPrograms((list) =>
      list.map((p) => (p.id === program.id ? { ...p, published: next } : p))
    );
    setTogglingIds((m) => ({ ...m, [program.id]: true }));
    setToggleErrors(({ [program.id]: _removed, ...rest }) => rest);

    const { error } = await getSupabase()
      .from("programs")
      .update({ published: next })
      .eq("id", program.id);

    setTogglingIds(({ [program.id]: _removed, ...rest }) => rest);
    if (error) {
      // Revertir
      setPrograms((list) =>
        list.map((p) =>
          p.id === program.id ? { ...p, published: program.published } : p
        )
      );
      setToggleErrors((m) => ({
        ...m,
        [program.id]: `No se pudo actualizar la publicación: ${error.message}`,
      }));
    }
  }

  function handleSaved(updated: ProgramRow) {
    setPrograms((list) =>
      list
        .map((p) => (p.id === updated.id ? updated : p))
        .sort((a, b) => a.sort - b.sort)
    );
  }

  if (loadState === "loading") {
    return (
      <p
        style={{
          color: "var(--c-faint)",
          fontSize: "0.78rem",
          textTransform: "uppercase",
          letterSpacing: "0.18em",
        }}
      >
        Cargando programas…
      </p>
    );
  }

  if (loadState === "error") {
    return (
      <div>
        <p style={{ color: "#ff6b6b", fontSize: "0.9rem", marginBottom: "1rem" }}>
          Error al cargar los programas: {loadError}
        </p>
        <button type="button" className="btn btn-ghost" onClick={() => void load()}>
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <>
      {programs.length === 0 ? (
        <p style={{ color: "var(--c-faint)", fontSize: "0.9rem" }}>
          No hay programas cargados.
        </p>
      ) : (
        <div style={{ display: "grid", gap: "1rem", maxWidth: 860 }}>
          {programs.map((program) => (
            <ProgramCard
              key={program.id}
              program={program}
              prices={pricesByProgram[program.id] ?? []}
              toggling={Boolean(togglingIds[program.id])}
              toggleError={toggleErrors[program.id] ?? null}
              onTogglePublished={() => void togglePublished(program)}
              onSaved={handleSaved}
            />
          ))}
        </div>
      )}

      <p
        style={{
          marginTop: "1.6rem",
          fontSize: "0.78rem",
          color: "var(--c-faint)",
          maxWidth: 860,
        }}
      >
        Para crear o eliminar programas, hablar con el equipo de desarrollo.
      </p>
    </>
  );
}

export default function AdminPrograms() {
  return (
    <AdminShell active="/admin/programs">
      <h1 className="admin-title">Programas</h1>
      <ProgramsPanel />
    </AdminShell>
  );
}
