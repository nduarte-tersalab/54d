import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import type { Route } from "./+types/admin-login";
import { getSupabase } from "../lib/supabase";

/* ============================================================
   /admin/login — Acceso al panel (email + password, Supabase Auth).
   Client-rendered: la sesión vive en localStorage. Si ya hay
   sesión redirige a /admin. Acepta ?m=denegado (mensaje del guard
   cuando el rol no es admin/editor).
   ============================================================ */

export function meta({}: Route.MetaArgs) {
  return [
    { title: "54D: Acceso al panel" },
    { name: "robots", content: "noindex" },
  ];
}

function mapAuthError(message: string): string {
  if (message.includes("Invalid login credentials")) {
    return "Credenciales inválidas";
  }
  if (message.includes("Email not confirmed")) {
    return "Tu email todavía no está confirmado.";
  }
  return "No se pudo iniciar sesión. Intenta de nuevo.";
}

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("m") === "denegado") {
      setNotice("Tu cuenta no tiene permisos para acceder al panel.");
    }
    // Sesión ya activa → directo al dashboard.
    void getSupabase()
      .auth.getSession()
      .then(({ data }) => {
        if (data.session)
          window.location.href =
            import.meta.env.BASE_URL.replace(/\/$/, "") + "/admin";
      });
  }, []);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);
    const { error: authError } = await getSupabase().auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (authError) {
      setError(mapAuthError(authError.message));
      setBusy(false);
      return;
    }
    window.location.href = import.meta.env.BASE_URL.replace(/\/$/, "") + "/admin";
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "var(--c-black)",
        padding: "1.5rem",
      }}
    >
      <div
        style={{
          width: "min(420px, 100%)",
          background: "var(--glass)",
          border: "1px solid var(--hairline)",
          borderRadius: "var(--r-md)",
          padding: "2.5rem",
          backdropFilter: "blur(12px)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "2.2rem" }}>
          <span className="nav-logo" style={{ fontSize: "1.9rem" }}>
            54<em>D</em>
          </span>
          <div
            style={{
              marginTop: "0.5rem",
              fontSize: "0.7rem",
              textTransform: "uppercase",
              letterSpacing: "0.22em",
              color: "var(--c-faint)",
            }}
          >
            Panel de administración
          </div>
        </div>

        {notice && (
          <p
            style={{
              marginBottom: "1.2rem",
              padding: "0.8rem 1rem",
              borderRadius: "var(--r-md)",
              border: "1px solid rgba(255, 210, 0, 0.35)",
              background: "rgba(255, 210, 0, 0.06)",
              color: "var(--c-yellow)",
              fontSize: "0.85rem",
              lineHeight: 1.5,
            }}
          >
            {notice}
          </p>
        )}

        <form onSubmit={(e) => void onSubmit(e)}>
          <div className="field">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              required
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="login-password">Contraseña</label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <p
              role="alert"
              style={{
                marginBottom: "1.2rem",
                color: "var(--c-red)",
                fontSize: "0.85rem",
              }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%" }}
            disabled={busy}
          >
            {busy ? "Entrando…" : "Entrar"}
          </button>
        </form>
      </div>
    </main>
  );
}
