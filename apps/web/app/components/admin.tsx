import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router";
import { getSupabase } from "../lib/supabase";

/* ============================================================
   Base del admin 54D (client-rendered).
   - useAdminGuard(): sesión Supabase + rol admin/editor (profiles).
   - AdminShell: layout sidebar + main. Llama al guard internamente,
     así cualquier página que renderice AdminShell queda protegida.
   El resultado del guard se cachea a nivel módulo para que shell y
   página compartan un solo chequeo (una sola query a profiles).
   ============================================================ */

export type AdminSection = "/admin" | "/admin/blog" | "/admin/programs";

export interface AdminUser {
  email: string;
  role: "admin" | "editor";
  name: string;
}

export interface AdminGuardState {
  ready: boolean;
  user: AdminUser | null;
}

interface ProfileRow {
  role: "admin" | "editor" | "viewer";
  full_name: string | null;
}

/** Cache del chequeo de sesión (se resetea con cada carga de página
 *  y al hacer signOut). null como resultado ⇒ redirect en curso. */
let guardPromise: Promise<AdminUser | null> | null = null;

async function resolveGuard(): Promise<AdminUser | null> {
  const supabase = getSupabase();

  const { data } = await supabase.auth.getSession();
  const session = data.session;
  if (!session) {
    window.location.href = import.meta.env.BASE_URL.replace(/\/$/, "") + "/admin/login";
    return null;
  }

  const { data: profileData } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("user_id", session.user.id)
    .maybeSingle();
  const profile = (profileData ?? null) as ProfileRow | null;

  if (!profile || (profile.role !== "admin" && profile.role !== "editor")) {
    await supabase.auth.signOut();
    window.location.href = import.meta.env.BASE_URL.replace(/\/$/, "") + "/admin/login?m=denegado";
    return null;
  }

  return {
    email: session.user.email ?? "",
    role: profile.role,
    name: profile.full_name ?? "",
  };
}

/**
 * Protege una página admin. Redirige a /admin/login si no hay sesión
 * o si el rol no es admin/editor. `ready` pasa a true solo con acceso
 * confirmado — recién ahí es seguro hacer fetches con getSupabase().
 */
export function useAdminGuard(): AdminGuardState {
  const [state, setState] = useState<AdminGuardState>({
    ready: false,
    user: null,
  });

  useEffect(() => {
    let cancelled = false;
    if (!guardPromise) guardPromise = resolveGuard();
    void guardPromise.then((user) => {
      if (!cancelled && user) setState({ ready: true, user });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}

const NAV: ReadonlyArray<{ href: AdminSection; label: string }> = [
  { href: "/admin", label: "Resumen" },
  { href: "/admin/blog", label: "Blog" },
  { href: "/admin/programs", label: "Programas" },
];

export interface AdminShellProps {
  /** Ruta de la sección activa (marca el link del sidebar). */
  active: AdminSection;
  children: ReactNode;
}

/**
 * Layout del admin: sidebar (logo, nav, usuario + Salir) y main.
 * Incluye el guard: mientras verifica sesión muestra un estado de
 * carga y no renderiza children hasta confirmar acceso.
 */
export function AdminShell({ active, children }: AdminShellProps) {
  const { ready, user } = useAdminGuard();

  async function handleSignOut() {
    guardPromise = null;
    await getSupabase().auth.signOut();
    window.location.href = import.meta.env.BASE_URL.replace(/\/$/, "") + "/admin/login";
  }

  return (
    <div className="admin-shell">
      <aside
        className="admin-side"
        style={{ display: "flex", flexDirection: "column" }}
      >
        <Link to="/admin" className="nav-logo">
          54<em>D</em>{" "}
          <span style={{ fontSize: "0.7rem", opacity: 0.6 }}>admin</span>
        </Link>

        <nav style={{ display: "grid", gap: "0.2rem" }}>
          {NAV.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={item.href === active ? "active" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div
          style={{
            marginTop: "auto",
            paddingTop: "1.2rem",
            borderTop: "1px solid var(--hairline)",
          }}
        >
          {user && (
            <>
              <div
                style={{
                  fontSize: "0.76rem",
                  color: "var(--c-mist)",
                  wordBreak: "break-all",
                  padding: "0 0.2rem 0.8rem",
                }}
                title={user.name || user.email}
              >
                {user.email}
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-nav"
                style={{ width: "100%" }}
                onClick={() => void handleSignOut()}
              >
                Salir
              </button>
            </>
          )}
        </div>
      </aside>

      <main className="admin-main">
        {ready ? (
          children
        ) : (
          <div
            style={{
              minHeight: "60vh",
              display: "grid",
              placeItems: "center",
              color: "var(--c-faint)",
              fontSize: "0.78rem",
              textTransform: "uppercase",
              letterSpacing: "0.18em",
            }}
          >
            Verificando sesión…
          </div>
        )}
      </main>
    </div>
  );
}
