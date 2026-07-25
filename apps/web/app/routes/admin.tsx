import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import type { Route } from "./+types/admin";
import { AdminShell, useAdminGuard } from "../components/admin";
import { getSupabase } from "../lib/supabase";

/* ============================================================
   /admin — Resumen: métricas de suscripciones + funnel por
   campaña. Client-rendered; los fetches corren recién cuando
   useAdminGuard confirma sesión y rol (ready: true).
   Fuentes: v_subscription_summary (1 fila) y v_campaign_funnel.
   ============================================================ */

export function meta({}: Route.MetaArgs) {
  return [
    { title: "54D: Dashboard" },
    { name: "robots", content: "noindex" },
  ];
}

interface SubscriptionSummary {
  en_trial: number | null;
  activas: number | null;
  past_due: number | null;
  bajas_30d: number | null;
  conversiones_30d: number | null;
}

interface CampaignFunnelRow {
  utm_source: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  checkouts_iniciados: number | null;
  trials_iniciados: number | null;
  conversiones_pagas: number | null;
  activas_hoy: number | null;
  canceladas: number | null;
  bajas_en_trial: number | null;
  revenue_cents: number | null;
}

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

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
const thNum: CSSProperties = { ...th, textAlign: "right" };
const td: CSSProperties = {
  padding: "0.85rem 1.2rem",
  color: "var(--c-mist)",
  whiteSpace: "nowrap",
};
const tdNum: CSSProperties = { ...td, textAlign: "right", color: "var(--c-white)" };

export default function Admin() {
  const { ready } = useAdminGuard();
  const [summary, setSummary] = useState<SubscriptionSummary | null>(null);
  const [funnel, setFunnel] = useState<CampaignFunnelRow[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    const supabase = getSupabase();
    void (async () => {
      const [s, f] = await Promise.all([
        supabase.from("v_subscription_summary").select("*").maybeSingle(),
        supabase.from("v_campaign_funnel").select("*"),
      ]);
      if (cancelled) return;
      if (s.error || f.error) {
        setLoadError("No pudimos cargar las métricas. Recarga la página.");
      } else {
        setSummary((s.data ?? null) as SubscriptionSummary | null);
        setFunnel((f.data ?? []) as CampaignFunnelRow[]);
      }
      setLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [ready]);

  const metrics: Array<{ label: string; value: number | null; accent?: boolean }> = [
    { label: "En free trial", value: summary?.en_trial ?? null, accent: true },
    { label: "Activas", value: summary?.activas ?? null },
    { label: "Conversiones 30d", value: summary?.conversiones_30d ?? null },
    { label: "Bajas 30d", value: summary?.bajas_30d ?? null },
  ];

  return (
    <AdminShell active="/admin">
      <h1 className="admin-title">Resumen</h1>

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
        {metrics.map((m) => (
          <div className="metric-card" key={m.label}>
            <div className="label">{m.label}</div>
            <div className={m.accent ? "value accent" : "value"}>
              {loaded && summary ? (m.value ?? 0) : "-"}
            </div>
          </div>
        ))}
      </div>

      <section style={{ marginTop: "2.5rem" }}>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: "1.05rem",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            marginBottom: "1rem",
            color: "var(--c-white)",
          }}
        >
          Funnel por campaña
        </h2>

        <div
          style={{
            background: "var(--glass)",
            border: "1px solid var(--hairline)",
            borderRadius: "var(--r-md)",
            overflowX: "auto",
          }}
        >
          {!loaded ? (
            <p
              style={{
                padding: "2rem 1.5rem",
                color: "var(--c-faint)",
                fontSize: "0.88rem",
              }}
            >
              Cargando campañas…
            </p>
          ) : funnel.length === 0 ? (
            <p
              style={{
                padding: "2rem 1.5rem",
                color: "var(--c-faint)",
                fontSize: "0.88rem",
                lineHeight: 1.6,
              }}
            >
              Sin datos de campañas todavía. Los datos aparecen cuando entren
              checkouts desde ads.
            </p>
          ) : (
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "0.88rem",
              }}
            >
              <thead>
                <tr>
                  <th style={th}>Fuente</th>
                  <th style={th}>Campaña</th>
                  <th style={th}>Anuncio</th>
                  <th style={thNum}>Checkouts</th>
                  <th style={thNum}>Trials</th>
                  <th style={thNum}>Conversiones</th>
                  <th style={thNum}>Activas</th>
                  <th style={thNum}>Canceladas</th>
                  <th style={thNum}>Bajas en trial</th>
                  <th style={thNum}>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {funnel.map((row, i) => (
                  <tr
                    key={`${row.utm_source ?? ""}·${row.utm_campaign ?? ""}·${i}`}
                    style={{ borderTop: "1px solid var(--hairline)" }}
                  >
                    <td style={{ ...td, color: "var(--c-white)" }}>
                      {row.utm_source ?? "-"}
                    </td>
                    <td style={td}>{row.utm_campaign ?? "-"}</td>
                    <td style={td}>{row.utm_content ?? "-"}</td>
                    <td style={tdNum}>{row.checkouts_iniciados ?? 0}</td>
                    <td style={tdNum}>{row.trials_iniciados ?? 0}</td>
                    <td style={tdNum}>{row.conversiones_pagas ?? 0}</td>
                    <td style={tdNum}>{row.activas_hoy ?? 0}</td>
                    <td style={tdNum}>{row.canceladas ?? 0}</td>
                    <td style={tdNum}>{row.bajas_en_trial ?? 0}</td>
                    <td style={{ ...tdNum, color: "var(--c-yellow)" }}>
                      {usd.format((row.revenue_cents ?? 0) / 100)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </AdminShell>
  );
}
