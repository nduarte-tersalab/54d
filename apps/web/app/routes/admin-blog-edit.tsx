import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { Link, useNavigate } from "react-router";
import type { Route } from "./+types/admin-blog-edit";
import { AdminShell, useAdminGuard } from "../components/admin";
import { getSupabase } from "../lib/supabase";

/* ============================================================
   /admin/blog/:id — Editor de post. ":id" = "new" para crear.
   Client-rendered; carga y guarda recién con el guard listo.
   El slug se autogenera desde el título en posts nuevos hasta
   que el usuario lo edite a mano (queda "tocado").
   ============================================================ */

export function meta({}: Route.MetaArgs) {
  return [
    { title: "54D — Editor de post (admin)" },
    { name: "robots", content: "noindex" },
  ];
}

type PostStatus = "draft" | "published" | "archived";
type PostLocale = "es" | "en";

interface PostRecord {
  id: string;
  slug: string;
  locale: PostLocale;
  title: string;
  excerpt: string | null;
  body: string | null;
  cover_url: string | null;
  tags: string[] | null;
  seo_title: string | null;
  seo_description: string | null;
  status: PostStatus;
  published_at: string | null;
}

interface PostForm {
  title: string;
  slug: string;
  locale: PostLocale;
  excerpt: string;
  body: string;
  cover_url: string;
  tagsInput: string;
  seo_title: string;
  seo_description: string;
  status: PostStatus;
}

const EMPTY_FORM: PostForm = {
  title: "",
  slug: "",
  locale: "es",
  excerpt: "",
  body: "",
  cover_url: "",
  tagsInput: "",
  seo_title: "",
  seo_description: "",
  status: "draft",
};

/** kebab-case sin acentos: "Cómo entrenar 54 días" → "como-entrenar-54-dias" */
function kebab(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseTags(input: string): string[] {
  return input
    .split(",")
    .map((t) => t.trim())
    .filter((t) => t.length > 0);
}

function counterStyle(len: number, max: number): CSSProperties {
  return {
    fontSize: "0.72rem",
    color: len > max ? "var(--c-red)" : "var(--c-faint)",
    justifySelf: "end",
  };
}

const labelRow: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "baseline",
  gap: "1rem",
};

export default function AdminBlogEdit({ params }: Route.ComponentProps) {
  const id = params.id;
  const isNew = id === "new";
  const { ready } = useAdminGuard();
  const navigate = useNavigate();

  const [form, setForm] = useState<PostForm>(EMPTY_FORM);
  const [publishedAt, setPublishedAt] = useState<string | null>(null);
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [loaded, setLoaded] = useState(isNew);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (!ready) return;
    if (id === "new") {
      setForm(EMPTY_FORM);
      setPublishedAt(null);
      setSlugTouched(false);
      setLoadError(null);
      setLoaded(true);
      return;
    }
    let cancelled = false;
    setLoaded(false);
    void (async () => {
      const { data, error } = await getSupabase()
        .from("posts")
        .select(
          "id, slug, locale, title, excerpt, body, cover_url, tags, seo_title, seo_description, status, published_at"
        )
        .eq("id", id)
        .maybeSingle();
      if (cancelled) return;
      if (error) {
        setLoadError("No pudimos cargar el post. Recarga la página.");
      } else if (!data) {
        setLoadError("Post no encontrado.");
      } else {
        const post = data as PostRecord;
        setForm({
          title: post.title ?? "",
          slug: post.slug ?? "",
          locale: post.locale === "en" ? "en" : "es",
          excerpt: post.excerpt ?? "",
          body: post.body ?? "",
          cover_url: post.cover_url ?? "",
          tagsInput: (post.tags ?? []).join(", "),
          seo_title: post.seo_title ?? "",
          seo_description: post.seo_description ?? "",
          status: post.status,
        });
        setPublishedAt(post.published_at);
        setSlugTouched(true);
        setLoadError(null);
      }
      setLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [ready, id]);

  function set<K extends keyof PostForm>(key: K, value: PostForm[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleTitleChange(value: string) {
    setForm((f) => ({
      ...f,
      title: value,
      slug: isNew && !slugTouched ? kebab(value) : f.slug,
    }));
  }

  async function save(publish: boolean) {
    const title = form.title.trim();
    const slug = form.slug.trim();
    if (!title || !slug) {
      setNotice({ kind: "error", text: "El título y el slug son obligatorios." });
      return;
    }

    const nextStatus: PostStatus = publish ? "published" : form.status;
    const nextPublishedAt =
      nextStatus === "published"
        ? (publishedAt ?? new Date().toISOString())
        : publishedAt;

    const payload = {
      title,
      slug,
      locale: form.locale,
      excerpt: form.excerpt.trim() || null,
      body: form.body,
      cover_url: form.cover_url.trim() || null,
      tags: parseTags(form.tagsInput),
      seo_title: form.seo_title.trim() || null,
      seo_description: form.seo_description.trim() || null,
      status: nextStatus,
      published_at: nextPublishedAt,
    };

    setSaving(true);
    setNotice(null);
    const supabase = getSupabase();

    if (isNew) {
      const { data, error } = await supabase
        .from("posts")
        .insert(payload)
        .select("id")
        .single();
      setSaving(false);
      if (error) {
        setNotice({
          kind: "error",
          text:
            error.code === "23505"
              ? `Ya existe un post con el slug "${slug}" en ${form.locale.toUpperCase()}. Cambia el slug o el idioma.`
              : "No pudimos crear el post. Intenta de nuevo.",
        });
        return;
      }
      setForm((f) => ({ ...f, status: nextStatus }));
      setPublishedAt(nextPublishedAt);
      setNotice({
        kind: "ok",
        text: publish ? "Post creado y publicado." : "Post creado.",
      });
      void navigate(`/admin/blog/${(data as { id: string }).id}`, { replace: true });
    } else {
      const { error } = await supabase.from("posts").update(payload).eq("id", id);
      setSaving(false);
      if (error) {
        setNotice({
          kind: "error",
          text:
            error.code === "23505"
              ? `Ya existe otro post con el slug "${slug}" en ${form.locale.toUpperCase()}. Cambia el slug o el idioma.`
              : "No pudimos guardar los cambios. Intenta de nuevo.",
        });
        return;
      }
      setForm((f) => ({ ...f, status: nextStatus }));
      setPublishedAt(nextPublishedAt);
      setNotice({
        kind: "ok",
        text: publish ? "Guardado y publicado." : "Cambios guardados.",
      });
    }
  }

  return (
    <AdminShell active="/admin/blog">
      <div style={{ maxWidth: "58rem" }}>
        <Link
          to="/admin/blog"
          style={{
            display: "inline-block",
            marginBottom: "1.2rem",
            fontSize: "0.78rem",
            textTransform: "uppercase",
            letterSpacing: "0.14em",
            color: "var(--c-faint)",
            textDecoration: "none",
          }}
        >
          ← Volver al blog
        </Link>

        <h1 className="admin-title">{isNew ? "Nuevo post" : "Editar post"}</h1>

        {loadError ? (
          <p role="alert" style={{ color: "var(--c-red)", fontSize: "0.9rem" }}>
            {loadError}{" "}
            <Link to="/admin/blog" style={{ color: "var(--c-yellow)" }}>
              Volver a la lista
            </Link>
          </p>
        ) : !loaded ? (
          <p style={{ color: "var(--c-faint)", fontSize: "0.88rem" }}>Cargando post…</p>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void save(false);
            }}
          >
            <div className="field">
              <label htmlFor="post-title">Título</label>
              <input
                id="post-title"
                type="text"
                value={form.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Título del post"
                required
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1rem" }}>
              <div className="field">
                <label htmlFor="post-slug">Slug</label>
                <input
                  id="post-slug"
                  type="text"
                  value={form.slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    set("slug", kebab(e.target.value) || e.target.value.trim());
                  }}
                  placeholder="mi-post"
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="post-locale">Idioma</label>
                <select
                  id="post-locale"
                  value={form.locale}
                  onChange={(e) => set("locale", e.target.value === "en" ? "en" : "es")}
                >
                  <option value="es">Español (ES)</option>
                  <option value="en">Inglés (EN)</option>
                </select>
              </div>
            </div>

            <div className="field">
              <label htmlFor="post-excerpt">Extracto</label>
              <textarea
                id="post-excerpt"
                value={form.excerpt}
                onChange={(e) => set("excerpt", e.target.value)}
                rows={3}
                placeholder="Resumen corto para listados y previews"
              />
            </div>

            <div className="field">
              <label htmlFor="post-body">Cuerpo (Markdown)</label>
              <textarea
                id="post-body"
                value={form.body}
                onChange={(e) => set("body", e.target.value)}
                placeholder="# Escribe en Markdown…"
                style={{
                  fontFamily:
                    "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
                  fontSize: "0.9rem",
                  lineHeight: 1.6,
                  minHeight: "50vh",
                  resize: "vertical",
                }}
              />
            </div>

            <div className="field">
              <label htmlFor="post-cover">URL de portada</label>
              <input
                id="post-cover"
                type="url"
                value={form.cover_url}
                onChange={(e) => set("cover_url", e.target.value)}
                placeholder="https://…/imagen.jpg"
              />
            </div>

            <div className="field">
              <label htmlFor="post-tags">Tags (separados por comas)</label>
              <input
                id="post-tags"
                type="text"
                value={form.tagsInput}
                onChange={(e) => set("tagsInput", e.target.value)}
                placeholder="entrenamiento, nutrición, 54d"
              />
            </div>

            <div className="field">
              <div style={labelRow}>
                <label htmlFor="post-seo-title">SEO — Título</label>
                <span style={counterStyle(form.seo_title.length, 60)}>
                  {form.seo_title.length}/60
                </span>
              </div>
              <input
                id="post-seo-title"
                type="text"
                value={form.seo_title}
                onChange={(e) => set("seo_title", e.target.value)}
                placeholder="Título para buscadores (≤ 60 caracteres)"
              />
            </div>

            <div className="field">
              <div style={labelRow}>
                <label htmlFor="post-seo-desc">SEO — Descripción</label>
                <span style={counterStyle(form.seo_description.length, 155)}>
                  {form.seo_description.length}/155
                </span>
              </div>
              <textarea
                id="post-seo-desc"
                value={form.seo_description}
                onChange={(e) => set("seo_description", e.target.value)}
                rows={3}
                placeholder="Meta description (≤ 155 caracteres)"
              />
            </div>

            <div className="field" style={{ maxWidth: "16rem" }}>
              <label htmlFor="post-status">Estado</label>
              <select
                id="post-status"
                value={form.status}
                onChange={(e) => {
                  const v = e.target.value;
                  set(
                    "status",
                    v === "published" ? "published" : v === "archived" ? "archived" : "draft"
                  );
                }}
              >
                <option value="draft">Borrador</option>
                <option value="published">Publicado</option>
                <option value="archived">Archivado</option>
              </select>
            </div>

            {notice && (
              <p
                role={notice.kind === "error" ? "alert" : "status"}
                style={{
                  margin: "0 0 1.2rem",
                  fontSize: "0.88rem",
                  color: notice.kind === "error" ? "var(--c-red)" : "var(--c-yellow)",
                }}
              >
                {notice.text}
              </p>
            )}

            <div
              style={{
                display: "flex",
                gap: "0.8rem",
                alignItems: "center",
                flexWrap: "wrap",
                paddingTop: "0.4rem",
                borderTop: "1px solid var(--hairline)",
                marginTop: "0.4rem",
                paddingBottom: "2rem",
              }}
            >
              <button
                type="submit"
                className="btn btn-ghost btn-nav"
                disabled={saving}
                style={{ marginTop: "1rem" }}
              >
                {saving ? "Guardando…" : "Guardar"}
              </button>
              <button
                type="button"
                className="btn btn-primary btn-nav"
                disabled={saving}
                style={{ marginTop: "1rem" }}
                onClick={() => void save(true)}
              >
                {saving ? "Guardando…" : "Guardar y publicar"}
              </button>
              {publishedAt && (
                <span
                  style={{
                    marginTop: "1rem",
                    fontSize: "0.78rem",
                    color: "var(--c-faint)",
                  }}
                >
                  Publicado el{" "}
                  {new Intl.DateTimeFormat("es", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  }).format(new Date(publishedAt))}
                </span>
              )}
            </div>
          </form>
        )}
      </div>
    </AdminShell>
  );
}
