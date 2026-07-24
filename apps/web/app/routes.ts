import { type RouteConfig, index, route } from "@react-router/dev/routes";
export default [
  index("routes/home.tsx"),
  route("method", "routes/method.tsx"),
  route("on", "routes/on.tsx"),
  route("pricing", "routes/pricing.tsx"),
  route("studios", "routes/studios.tsx"),
  route("studios/:slug", "routes/studio-detail.tsx"),
  route("blog", "routes/blog.tsx"),
  route("contact", "routes/contact.tsx"),
  route("admin/login", "routes/admin-login.tsx"),
  route("admin", "routes/admin.tsx"),
  route("admin/blog", "routes/admin-blog.tsx"),
  route("admin/blog/:id", "routes/admin-blog-edit.tsx"),
  route("admin/programs", "routes/admin-programs.tsx"),
] satisfies RouteConfig;
