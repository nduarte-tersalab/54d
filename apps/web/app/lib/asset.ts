/**
 * Prefija assets de /public con el BASE_URL del build:
 * "/" en Workers, "/54d/" en GitHub Pages.
 * Uso: <img src={asset("images/studios/coral-gables/01.jpg")} />
 */
export const asset = (path: string): string =>
  import.meta.env.BASE_URL + path.replace(/^\//, "");
