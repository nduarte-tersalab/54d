import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { Route } from "./+types/admin";
import { AdminShell, useAdminGuard } from "../components/admin";
import { getSupabase } from "../lib/supabase";

/* ============================================================
   /admin: dashboard del negocio. Responde, en este orden:
     1. cuánta plata entró y cuántos trials hay abiertos (KPIs),
     2. DE DÓNDE viene (v_channel_funnel: Meta, newsletter, SEO…),
     3. cómo viene evolucionando (v_channel_daily, SVG inline),
     4. el detalle por anuncio (v_campaign_funnel), abajo y plegado.

   Client-rendered: los fetches corren recién cuando useAdminGuard
   confirma sesión y rol (ready: true). Se traen las 4 vistas una
   sola vez y el selector de período filtra en cliente.

   Mientras Stripe no esté conectado no hay ventas: cada bloque
   tiene un estado vacío que explica qué falta, no un cero mudo.
   ============================================================ */

export function meta({}: Route.MetaArgs) {
  return [{ title: "54D: Dashboard" }, { name: "robots", content: "noindex" }];
}

/* ---------- Formas de las vistas ----------
   Los conteos y sumas de Postgres pueden llegar como string
   (bigint / numeric vía PostgREST). Todo pasa por num(). */
type Cell = number | string | null;

interface SubscriptionSummary {
  en_trial: Cell;
  activas: Cell;
  past_due: Cell;
  bajas_30d: Cell;
  conversiones_30d: Cell;
}

interface ChannelFunnelRow {
  channel: string | null;
  checkouts_iniciados: Cell;
  trials_iniciados: Cell;
  conversiones_pagas: Cell;
  activas_hoy: Cell;
  canceladas: Cell;
  bajas_en_trial: Cell;
  revenue_cents: Cell;
  conversion_pct: Cell;
}

interface ChannelDailyRow {
  dia: string | null;
  channel: string | null;
  checkouts: Cell;
  trials: Cell;
  ventas: Cell;
  revenue_cents: Cell;
}

interface CampaignFunnelRow {
  utm_source: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  checkouts_iniciados: Cell;
  trials_iniciados: Cell;
  conversiones_pagas: Cell;
  activas_hoy: Cell;
  canceladas: Cell;
  bajas_en_trial: Cell;
  revenue_cents: Cell;
}

/* ---------- Formato ----------
   Regla: nunca sale "NaN" ni un guion pelado. Si no hay base para
   un porcentaje devolvemos null y el bloque lo dice con palabras. */

function num(v: Cell | undefined): number {
  const parsed = typeof v === "string" ? Number(v) : (v ?? 0);
  return typeof parsed === "number" && Number.isFinite(parsed) ? parsed : 0;
}

const USD_0 = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});
const USD_2 = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const INT = new Intl.NumberFormat("es-AR");
const DEC = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 1 });

/** Centavos a USD legible: sin decimales cuando el monto es redondo. */
function money(cents: number): string {
  const safe = Number.isFinite(cents) ? cents : 0;
  return safe % 100 === 0 ? USD_0.format(safe / 100) : USD_2.format(safe / 100);
}

function count(value: number): string {
  return INT.format(Number.isFinite(value) ? value : 0);
}

/** Porcentaje, o null si no hay denominador (el caller decide el texto). */
function ratio(part: number, whole: number): string | null {
  if (!(whole > 0)) return null;
  return `${DEC.format((part / whole) * 100)}%`;
}

/* ---------- Canales ---------- */

const CHANNEL_LABEL: Readonly<Record<string, string>> = {
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

/** Etiqueta humana. Un utm_source desconocido se muestra capitalizado. */
function channelLabel(channel: string | null): string {
  const key = (channel ?? "").trim();
  if (!key) return "Sin origen";
  return CHANNEL_LABEL[key] ?? key.charAt(0).toUpperCase() + key.slice(1);
}

/* ---------- Período ---------- */

type Period = "30" | "90" | "all";

const PERIODS: ReadonlyArray<{ id: Period; label: string }> = [
  { id: "30", label: "30 días" },
  { id: "90", label: "90 días" },
  { id: "all", label: "Todo" },
];

/** Días que cubre la serie diaria (la vista guarda 90 como máximo). */
const DAILY_WINDOW: Readonly<Record<Period, number>> = {
  "30": 30,
  "90": 90,
  all: 90,
};

interface ChannelRow {
  channel: string;
  checkouts: number;
  trials: number;
  ventas: number;
  revenue: number;
}

/** YYYY-MM-DD -> Date local (evita el corrimiento de zona de new Date(str)). */
function parseDay(value: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!m) return null;
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

function dayKey(d: Date): string {
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

function shortDay(d: Date): string {
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default function Admin() {
  const { ready } = useAdminGuard();
  const [summary, setSummary] = useState<SubscriptionSummary | null>(null);
  const [channels, setChannels] = useState<ChannelFunnelRow[]>([]);
  const [daily, setDaily] = useState<ChannelDailyRow[]>([]);
  const [campaigns, setCampaigns] = useState<CampaignFunnelRow[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [period, setPeriod] = useState<Period>("30");

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    const supabase = getSupabase();
    void (async () => {
      const [s, c, d, a] = await Promise.all([
        supabase.from("v_subscription_summary").select("*").maybeSingle(),
        supabase.from("v_channel_funnel").select("*"),
        supabase.from("v_channel_daily").select("*"),
        supabase.from("v_campaign_funnel").select("*"),
      ]);
      if (cancelled) return;
      if (s.error || c.error || d.error || a.error) {
        setLoadError("No pudimos cargar las métricas. Recargá la página.");
      } else {
        setSummary((s.data ?? null) as SubscriptionSummary | null);
        setChannels((c.data ?? []) as ChannelFunnelRow[]);
        setDaily((d.data ?? []) as ChannelDailyRow[]);
        setCampaigns((a.data ?? []) as CampaignFunnelRow[]);
      }
      setLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [ready]);

  /* Serie diaria del período, con los días sin movimiento en cero.
     "Todo" usa los 90 días que guarda la vista: se aclara abajo. */
  const series = useMemo(() => {
    const days = DAILY_WINDOW[period];
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - (days - 1));

    const byDay = new Map<string, { ventas: number; revenue: number }>();
    for (const row of daily) {
      const parsed = row.dia ? parseDay(row.dia) : null;
      if (!parsed || parsed < start) continue;
      const key = dayKey(parsed);
      const acc = byDay.get(key) ?? { ventas: 0, revenue: 0 };
      acc.ventas += num(row.ventas);
      acc.revenue += num(row.revenue_cents);
      byDay.set(key, acc);
    }

    const out: Array<{ date: Date; label: string; ventas: number }> = [];
    for (let i = 0; i < days; i += 1) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      out.push({
        date: d,
        label: shortDay(d),
        ventas: byDay.get(dayKey(d))?.ventas ?? 0,
      });
    }
    return out;
  }, [daily, period]);

  /* Filas por canal. "Todo" sale de v_channel_funnel (histórico
     completo); 30/90 se agregan desde la serie diaria, que es lo
     único acotable en cliente. Misma definición de conversión en
     los dos casos: ventas sobre checkouts. */
  const channelRows = useMemo<ChannelRow[]>(() => {
    let rows: ChannelRow[];
    if (period === "all") {
      rows = channels.map((r) => ({
        channel: r.channel ?? "",
        checkouts: num(r.checkouts_iniciados),
        trials: num(r.trials_iniciados),
        ventas: num(r.conversiones_pagas),
        revenue: num(r.revenue_cents),
      }));
    } else {
      const days = DAILY_WINDOW[period];
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      start.setDate(start.getDate() - (days - 1));
      const acc = new Map<string, ChannelRow>();
      for (const row of daily) {
        const parsed = row.dia ? parseDay(row.dia) : null;
        if (!parsed || parsed < start) continue;
        const key = row.channel ?? "";
        const prev = acc.get(key) ?? {
          channel: key,
          checkouts: 0,
          trials: 0,
          ventas: 0,
          revenue: 0,
        };
        prev.checkouts += num(row.checkouts);
        prev.trials += num(row.trials);
        prev.ventas += num(row.ventas);
        prev.revenue += num(row.revenue_cents);
        acc.set(key, prev);
      }
      rows = [...acc.values()];
    }
    return rows.sort(
      (a, b) => b.revenue - a.revenue || b.checkouts - a.checkouts,
    );
  }, [channels, daily, period]);

  const totals = useMemo(() => {
    const t = { checkouts: 0, trials: 0, ventas: 0, revenue: 0 };
    for (const r of channelRows) {
      t.checkouts += r.checkouts;
      t.trials += r.trials;
      t.ventas += r.ventas;
      t.revenue += r.revenue;
    }
    return t;
  }, [channelRows]);

  /* Base de la barra de participación: ingresos si los hay, si no
     checkouts. Sin ninguno de los dos no se dibuja barra. */
  const shareBasis: "revenue" | "checkouts" | null =
    totals.revenue > 0 ? "revenue" : totals.checkouts > 0 ? "checkouts" : null;
  const shareTotal =
    shareBasis === "revenue" ? totals.revenue : totals.checkouts;

  const trialsAbiertos = num(summary?.en_trial);
  const conversionTrial = ratio(totals.ventas, totals.trials);
  const periodLabel = PERIODS.find((p) => p.id === period)?.label ?? "";

  const kpis: Array<{
    label: string;
    value: string;
    hint: string;
    accent?: boolean;
  }> = [
    {
      label: "Ingresos del período",
      value: loaded ? money(totals.revenue) : "…",
      // El amarillo es acento, no decoración: un $0 no se lo gana.
      accent: loaded && totals.revenue > 0,
      hint: !loaded
        ? "Cargando cobros."
        : totals.revenue > 0
          ? "Facturas cobradas en el período."
          : "Sin cobros todavía: falta conectar las claves de Stripe. Ver docs/STRIPE.md",
    },
    {
      label: "Ventas pagas",
      value: loaded ? count(totals.ventas) : "…",
      hint: !loaded
        ? "Cargando ventas."
        : totals.ventas > 0
          ? "Suscripciones con al menos un cobro."
          : "Ninguna suscripción llegó al primer cobro.",
    },
    {
      label: "Free trials abiertos",
      value: loaded ? count(trialsAbiertos) : "…",
      hint: !loaded
        ? "Cargando trials."
        : trialsAbiertos > 0
          ? "Estado de hoy, no depende del período."
          : "Nadie está en período de prueba ahora mismo.",
    },
    {
      label: "Conversión trial a pago",
      value: loaded ? (conversionTrial ?? "0%") : "…",
      hint: !loaded
        ? "Cargando conversión."
        : conversionTrial
          ? `${count(totals.ventas)} de ${count(totals.trials)} trials del período.`
          : "Sin trials en el período: todavía no hay base para calcularla.",
    },
  ];

  const subStats: Array<{ label: string; value: number }> = [
    { label: "Activas hoy", value: num(summary?.activas) },
    { label: "Pago vencido", value: num(summary?.past_due) },
    { label: "Bajas 30d", value: num(summary?.bajas_30d) },
    { label: "Conversiones 30d", value: num(summary?.conversiones_30d) },
  ];

  const ventasEnSerie = series.reduce((acc, p) => acc + p.ventas, 0);

  return (
    <AdminShell active="/admin">
      <div className="dash7-head">
        <h1 className="admin-title">Resumen</h1>
        <div
          className="dash7-periods"
          role="group"
          aria-label="Período del dashboard"
        >
          {PERIODS.map((p) => (
            <button
              key={p.id}
              type="button"
              className="dash7-period"
              aria-pressed={period === p.id}
              onClick={() => setPeriod(p.id)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {loadError && (
        <p
          role="alert"
          style={{
            marginBottom: "1.2rem",
            color: "var(--c-red)",
            fontSize: "0.9rem",
          }}
        >
          {loadError}
        </p>
      )}

      <div className="metric-grid">
        {kpis.map((k) => (
          <div className="metric-card" key={k.label}>
            <div className="label">{k.label}</div>
            <div className={k.accent ? "value accent" : "value"}>{k.value}</div>
            <p className="dash7-hint">{k.hint}</p>
          </div>
        ))}
      </div>

      <div className="dash7-substats">
        {subStats.map((s) => (
          <div className="dash7-substat" key={s.label}>
            <b>{loaded && summary ? count(s.value) : "…"}</b>
            <span>{s.label}</span>
          </div>
        ))}
        {loaded && !summary && (
          <div className="dash7-substat">
            <span>Sin suscripciones cargadas todavía.</span>
          </div>
        )}
      </div>

      {/* ---------- Bloque principal: atribución por canal ---------- */}
      <section className="dash7-section">
        <h2 className="dash7-h2">De dónde viene</h2>
        <p className="dash7-sub">
          Cada checkout guarda su origen (Meta, newsletter, búsqueda, directo).
          Período: {periodLabel.toLowerCase()}.
          {period === "all"
            ? " Histórico completo."
            : " Calculado sobre la serie diaria."}
        </p>

        <div className="dash7-panel">
          {!loaded ? (
            <Loading>Cargando canales…</Loading>
          ) : channelRows.length === 0 ? (
            <Empty
              title="Todavía no hay tráfico atribuido."
              note={
                <>
                  Apenas entre el primer checkout esta tabla se llena sola con
                  el canal de origen. Para que además se vean ventas e ingresos
                  faltan las claves de Stripe: ver <code>docs/STRIPE.md</code>.
                </>
              }
            />
          ) : (
            <table
              className="dash7-table"
              aria-label={`Canales de adquisición, ${periodLabel}`}
            >
              <thead>
                <tr>
                  <th>Canal</th>
                  <th>
                    {shareBasis === "checkouts"
                      ? "Participación (checkouts)"
                      : "Participación (ingresos)"}
                  </th>
                  <th className="dash7-num">Checkouts</th>
                  <th className="dash7-num">Trials</th>
                  <th className="dash7-num">Ventas</th>
                  <th className="dash7-num">Conversión</th>
                  <th className="dash7-num">Ingresos</th>
                </tr>
              </thead>
              <tbody>
                {channelRows.map((row) => {
                  const value =
                    shareBasis === "revenue" ? row.revenue : row.checkouts;
                  const share = shareTotal > 0 ? (value / shareTotal) * 100 : 0;
                  const conv = ratio(row.ventas, row.checkouts);
                  return (
                    <tr key={row.channel || "sin-origen"}>
                      <td className="dash7-chan">
                        {channelLabel(row.channel)}
                      </td>
                      <td>
                        {shareBasis ? (
                          <span
                            className="dash7-bar"
                            role="img"
                            aria-label={`${DEC.format(share)}% del total`}
                            title={`${DEC.format(share)}% del total`}
                          >
                            <span
                              className="dash7-bar-fill"
                              style={{ width: `${Math.max(share, 1.5)}%` }}
                            />
                          </span>
                        ) : (
                          <span className="dash7-quiet">sin base</span>
                        )}
                      </td>
                      <td className="dash7-num">{count(row.checkouts)}</td>
                      <td className="dash7-num">{count(row.trials)}</td>
                      <td className="dash7-num">{count(row.ventas)}</td>
                      <td className="dash7-num">
                        {conv ?? <span className="dash7-quiet">sin base</span>}
                      </td>
                      <td
                        className={`dash7-num ${row.revenue > 0 ? "dash7-money" : "dash7-quiet"}`}
                      >
                        {money(row.revenue)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr>
                  <td className="dash7-chan">Total</td>
                  <td />
                  <td className="dash7-num">{count(totals.checkouts)}</td>
                  <td className="dash7-num">{count(totals.trials)}</td>
                  <td className="dash7-num">{count(totals.ventas)}</td>
                  <td className="dash7-num">
                    {ratio(totals.ventas, totals.checkouts) ?? (
                      <span className="dash7-quiet">sin base</span>
                    )}
                  </td>
                  <td
                    className={`dash7-num ${totals.revenue > 0 ? "dash7-money" : "dash7-quiet"}`}
                  >
                    {money(totals.revenue)}
                  </td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>

        {loaded && channelRows.length > 0 && shareBasis === "checkouts" && (
          <p className="dash7-sub" style={{ marginTop: "0.7rem" }}>
            Sin cobros todavía: la participación se reparte por checkouts hasta
            que Stripe empiece a facturar. Ver <code>docs/STRIPE.md</code>.
          </p>
        )}
      </section>

      {/* ---------- Tendencia ---------- */}
      <section className="dash7-section">
        <h2 className="dash7-h2">Tendencia</h2>
        <p className="dash7-sub">
          Ventas pagas por día, todos los canales sumados.
          {period === "all"
            ? " La serie diaria guarda 90 días: el histórico completo se ve en la tabla de arriba."
            : ` Últimos ${DAILY_WINDOW[period]} días.`}
        </p>

        <div className="dash7-panel">
          {!loaded ? (
            <Loading>Cargando tendencia…</Loading>
          ) : ventasEnSerie === 0 ? (
            <Empty
              title="Sin ventas en el período, no hay curva para dibujar."
              note={
                <>
                  El gráfico aparece con la primera venta paga. Hoy no puede
                  haber ninguna porque el checkout todavía no cobra: faltan las
                  claves de Stripe. Ver <code>docs/STRIPE.md</code>.
                </>
              }
            />
          ) : (
            <TrendChart series={series} />
          )}
        </div>
      </section>

      {/* ---------- Detalle por anuncio (secundario) ---------- */}
      <section className="dash7-section">
        <h2 className="dash7-h2">Detalle por anuncio</h2>
        <p className="dash7-sub">
          El mismo funnel abierto por UTM, para leer creativo por creativo.
          Histórico completo, no depende del período.
        </p>

        <details className="dash7-details">
          <summary>
            {loaded
              ? `${count(campaigns.length)} ${campaigns.length === 1 ? "anuncio" : "anuncios"} con datos`
              : "Cargando anuncios…"}
          </summary>
          <div className="dash7-details-body">
            {!loaded ? (
              <Loading>Cargando anuncios…</Loading>
            ) : campaigns.length === 0 ? (
              <Empty
                title="Ningún anuncio trajo checkouts todavía."
                note={
                  <>
                    Se llena cuando las URLs de los ads lleguen con{" "}
                    <code>utm_source</code>, <code>utm_campaign</code> y{" "}
                    <code>utm_content</code>. La plantilla de URL está en{" "}
                    <code>docs/ANALYTICS.md</code>.
                  </>
                }
              />
            ) : (
              <table className="dash7-table" aria-label="Funnel por anuncio">
                <thead>
                  <tr>
                    <th>Fuente</th>
                    <th>Campaña</th>
                    <th>Anuncio</th>
                    <th className="dash7-num">Checkouts</th>
                    <th className="dash7-num">Trials</th>
                    <th className="dash7-num">Ventas</th>
                    <th className="dash7-num">Activas</th>
                    <th className="dash7-num">Canceladas</th>
                    <th className="dash7-num">Bajas en trial</th>
                    <th className="dash7-num">Ingresos</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((row, i) => {
                    const revenue = num(row.revenue_cents);
                    return (
                      <tr
                        key={`${row.utm_source ?? ""}·${row.utm_campaign ?? ""}·${row.utm_content ?? ""}·${i}`}
                      >
                        <td className="dash7-chan">
                          {row.utm_source ?? "Sin fuente"}
                        </td>
                        <td>{row.utm_campaign ?? "Sin campaña"}</td>
                        <td>{row.utm_content ?? "Sin anuncio"}</td>
                        <td className="dash7-num">
                          {count(num(row.checkouts_iniciados))}
                        </td>
                        <td className="dash7-num">
                          {count(num(row.trials_iniciados))}
                        </td>
                        <td className="dash7-num">
                          {count(num(row.conversiones_pagas))}
                        </td>
                        <td className="dash7-num">
                          {count(num(row.activas_hoy))}
                        </td>
                        <td className="dash7-num">
                          {count(num(row.canceladas))}
                        </td>
                        <td className="dash7-num">
                          {count(num(row.bajas_en_trial))}
                        </td>
                        <td
                          className={`dash7-num ${revenue > 0 ? "dash7-money" : "dash7-quiet"}`}
                        >
                          {money(revenue)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </details>
      </section>
    </AdminShell>
  );
}

/* ---------- Piezas de estado ---------- */

function Loading({ children }: { children: ReactNode }) {
  return (
    <div className="dash7-empty">
      <p className="dash7-empty-title">{children}</p>
    </div>
  );
}

function Empty({ title, note }: { title: string; note: ReactNode }) {
  return (
    <div className="dash7-empty">
      <p className="dash7-empty-title">{title}</p>
      <p className="dash7-empty-note">{note}</p>
    </div>
  );
}

/* ---------- Gráfico de tendencia (SVG inline, sin dependencias) ---------- */

interface TrendPoint {
  date: Date;
  label: string;
  ventas: number;
}

function TrendChart({ series }: { series: TrendPoint[] }) {
  const W = 720;
  const H = 200;
  const PAD_L = 46;
  const PAD_R = 16;
  const PAD_T = 16;
  const PAD_B = 30;
  const innerW = W - PAD_L - PAD_R;
  const innerH = H - PAD_T - PAD_B;

  const peak = series.reduce((m, p) => Math.max(m, p.ventas), 0);
  const max = Math.max(1, peak);
  const step = series.length > 1 ? innerW / (series.length - 1) : 0;
  const x = (i: number) => PAD_L + i * step;
  const y = (v: number) => PAD_T + innerH - (v / max) * innerH;

  const line = series
    .map(
      (p, i) =>
        `${i === 0 ? "M" : "L"}${x(i).toFixed(1)} ${y(p.ventas).toFixed(1)}`,
    )
    .join(" ");
  const base = (PAD_T + innerH).toFixed(1);
  const area = `${line} L${x(series.length - 1).toFixed(1)} ${base} L${x(0).toFixed(1)} ${base} Z`;

  const ticks =
    max <= 4
      ? Array.from({ length: max + 1 }, (_, i) => i)
      : [0, Math.round(max / 2), max];

  const xLabels = [
    0,
    Math.floor((series.length - 1) / 2),
    series.length - 1,
  ].filter((i, idx, arr) => arr.indexOf(i) === idx && i >= 0);

  const total = series.reduce((acc, p) => acc + p.ventas, 0);

  return (
    <div className="dash7-chart-wrap">
      <svg
        className="dash7-chart"
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`Ventas por día: ${total} en ${series.length} días, pico de ${peak} en un día.`}
      >
        <defs>
          <linearGradient id="dash7-area-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--c-yellow)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="var(--c-yellow)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {ticks.map((t) => (
          <g key={t}>
            <line
              x1={PAD_L}
              x2={W - PAD_R}
              y1={y(t)}
              y2={y(t)}
              stroke="var(--hairline)"
              strokeWidth="1"
            />
            <text
              x={PAD_L - 10}
              y={y(t) + 4}
              textAnchor="end"
              fontSize="11"
              fill="var(--c-faint)"
            >
              {count(t)}
            </text>
          </g>
        ))}

        <path d={area} fill="url(#dash7-area-grad)" />
        <path
          d={line}
          fill="none"
          stroke="var(--c-yellow)"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {series.map((p, i) =>
          p.ventas > 0 ? (
            <circle
              key={p.label + i}
              cx={x(i)}
              cy={y(p.ventas)}
              r="3.5"
              fill="var(--c-yellow)"
            >
              <title>{`${p.label}: ${count(p.ventas)} ventas`}</title>
            </circle>
          ) : null,
        )}

        {xLabels.map((i) => (
          <text
            key={`x-${i}`}
            x={x(i)}
            y={H - 10}
            textAnchor={
              i === 0 ? "start" : i === series.length - 1 ? "end" : "middle"
            }
            fontSize="11"
            fill="var(--c-faint)"
          >
            {series[i]?.label ?? ""}
          </text>
        ))}
      </svg>
    </div>
  );
}
