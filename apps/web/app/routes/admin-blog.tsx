import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { Link, useNavigate } from "react-router";
import type { Route } from "./+types/admin-blog";
import { AdminShell, useAdminGuard } from "../components/admin";
import { getSupabase } from "../lib/supabase";

/* ============================================================
   /admin/blog — Lista de posts (ABM). Client-rendered; los
   fetches corren recién cuando useAdminGuard confirma sesión.
   Acciones rápidas por fila: Publicar / Despublicar / Archivar.
   ============================================================ */

export function meta({}: Route.MetaArgs) {
  return [
    { title: "54D — Blog (admin)" },
    { name: "robots", content: "noindex" },
  ];
}

type PostStatus = "draft" | "published" | "archived";
type PostLocale = "es" | "en";

interface PostListRow {
  id: string;
  slug: string;
  locale: PostLocale;
  title: string;
  status: PostStatus;
  published_at: string | null;
  updated_at: string;
}

const STATUS_LABEL: Record<PostStatus, string> = {
  draft: "Borrador",
  published: "Publicado",
  archived: "Archivado",
};

const badgeBase: CSSProperties = {
  display: "inline-block",
  padding: "0.22rem 0.65rem",
  borderRadius: "999px",
  fontSize: "0.66rem",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.12em",
  whiteSpace: "nowrap",
};

const STATUS_BADGE: Record<PostStatus, CSSProperties> = {
  draft: {
    ...badgeBase,
    color: "var(--c-mist)",
    background: "var(--glass)",
    border: "1px solid var(--hairline)",
  },
  published: {
    ...badgeBase,
    color: "var(--c-yellow)",
    background: "rgba(255, 210, 0, 0.08)",
    border: "1px solid rgba(255, 210, 0, 0.35)",
  },
  archived: {
    ...badgeBase,
    color: "var(--c-faint)",
    background: "transparent",
    border: "1px solid var(--hairline)",
    opacity: 0.7,
  },
};

const localeBadge: CSSProperties = {
  ...badgeBase,
  color: "var(--c-mist)",
  background: "var(--glass)",
  border: "1px solid var(--hairline)",
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
  whiteSpace: "nowrap",
};

const actionBtn: CSSProperties = {
  padding: "0.35rem 0.85rem",
  fontSize: "0.68rem",
};

const dateFmt = new Intl.DateTimeFormat("es", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : dateFmt.format(d);
}

export default function AdminBlog() {
  const { ready } = useAdminGuard();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<PostListRow[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    void (async () => {
      const { data, error } = await getSupabase()
        .from("posts")
        .select("id, slug, locale, title, status, published_at, updated_at")
        .order("updated_at", { ascending: false });
      if (cancelled) return;
      if (error) {
        setLoadError("No pudimos cargar los posts. Recarga la página.");
      } else {
        setLoadError(null);
        setPosts((data ?? []) as PostListRow[]);
      }
      setLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [ready, refresh]);

  async function updateStatus(
    post: PostListRow,
    next: PostStatus,
    confirmMsg: string,
    okMsg: string
  ) {
    if (!window.confirm(confirmMsg)) return;
    setBusyId(post.id);
    setNotice(null);
    const patch: { status: PostStatus; published_at?: string } = {
      status: next,
    };
    if (next === "published") patch.published_at = new Date().toISOString();
    const { error } = await getSupabase()
      .from("posts")
      .update(patch)
      .eq("id", post.id);
    setBusyId(null);
    if (error) {
      setNotice(`Error al actualizar "${post.title}". Intenta de nuevo.`);
    } else {
      setNotice(okMsg);
      setRefresh((r) => r + 1);
    }
  }

  return (
    <AdminShell active="/admin/blog">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "1rem",
          flexWrap: "wrap",
        }}
      >
        <h1 className="admin-title">Blog</h1>
        <Link to="/admin/blog/new" className="btn btn-primary btn-nav">
          + Nuevo post
        </Link>
      </div>

      {loadError && (
        <p
          role="alert"
          style={{ marginBottom: "1.2rem", color: "var(--c-red)", fontSize: "0.9rem" }}
        >
          {loadError}
        </p>
      )}
      {notice && (
        <p
          role="status"
          style={{
            marginBottom: "1.2rem",
            color: notice.startsWith("Error") ? "var(--c-red)" : "var(--c-yellow)",
            fontSize: "0.88rem",
          }}
        >
          {notice}
        </p>
      )}

      <div
        style={{
          background: "var(--glass)",
          border: "1px solid var(--hairline)",
          borderRadius: "var(--r-md)",
          overflowX: "auto",
        }}
      >
        {!loaded ? (
          <p style={{ padding: "2rem 1.5rem", color: "var(--c-faint)", fontSize: "0.88rem" }}>
            Cargando posts…
          </p>
        ) : posts.length === 0 ? (
          <p
            style={{
              padding: "2rem 1.5rem",
              color: "var(--c-faint)",
              fontSize: "0.88rem",
              lineHeight: 1.6,
            }}
          >
            Sin posts todavía. Crea el primero con “+ Nuevo post”.
          </p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.88rem" }}>
            <thead>
              <tr>
                <th style={th}>Título</th>
                <th style={th}>Idioma</th>
                <th style={th}>Estado</th>
                <th style={th}>Publicado</th>
                <th style={th}>Actualizado</th>
                <th style={{ ...th, textAlign: "right" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr
                  key={post.id}
                  onClick={() => void navigate(`/admin/blog/${post.id}`)}
                  style={{ borderTop: "1px solid var(--hairline)", cursor: "pointer" }}
                >
                  <td style={{ ...td, whiteSpace: "normal", minWidth: "16rem" }}>
                    <span style={{ color: "var(--c-white)", fontWeight: 600 }}>
                      {post.title || "(sin título)"}
                    </span>
                    <span
                      style={{
                        display: "block",
                        color: "var(--c-faint)",
                        fontSize: "0.74rem",
                        marginTop: "0.15rem",
                      }}
                    >
                      /{post.slug}
                    </span>
                  </td>
                  <td style={td}>
                    <span style={localeBadge}>{post.locale === "en" ? "EN" : "ES"}</span>
                  </td>
                  <td style={td}>
                    <span style={STATUS_BADGE[post.status]}>{STATUS_LABEL[post.status]}</span>
                  </td>
                  <td style={td}>{fmtDate(post.published_at)}</td>
                  <td style={td}>{fmtDate(post.updated_at)}</td>
                  <td
                    style={{ ...td, textAlign: "right" }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div
                      style={{
                        display: "inline-flex",
                        gap: "0.4rem",
                        justifyContent: "flex-end",
                      }}
                    >
                      {post.status === "published" ? (
                        <button
                          type="button"
                          className="btn btn-ghost"
                          style={actionBtn}
                          disabled={busyId === post.id}
                          onClick={() =>
                            void updateStatus(
                              post,
                              "draft",
                              `¿Despublicar "${post.title}"? Dejará de verse en el sitio.`,
                              `"${post.title}" pasó a borrador.`
                            )
                          }
                        >
                          Despublicar
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="btn btn-ghost"
                          style={actionBtn}
                          disabled={busyId === post.id}
                          onClick={() =>
                            void updateStatus(
                              post,
                              "published",
                              `¿Publicar "${post.title}"?`,
                              `"${post.title}" quedó publicado.`
                            )
                          }
                        >
                          Publicar
                        </button>
                      )}
                      {post.status !== "archived" && (
                        <button
                          type="button"
                          className="btn btn-ghost"
                          style={actionBtn}
                          disabled={busyId === post.id}
                          onClick={() =>
                            void updateStatus(
                              post,
                              "archived",
                              `¿Archivar "${post.title}"?`,
                              `"${post.title}" quedó archivado.`
                            )
                          }
                        >
                          Archivar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminShell>
  );
}
