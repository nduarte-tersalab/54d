# Fuentes licenciadas — colocar aquí

Ambas familias son comerciales. Los archivos NO van al repo público si el
repo se abre — confirmar licencia web (self-hosting) del cliente.

Nombres de archivo esperados por `tokens.css`:

| Archivo | Familia | Peso |
|---|---|---|
| `AllumiStdExt-Regular.woff2` | Allumi Std Extended (Typofonderie) | 400 |
| `AllumiStdExt-Bold.woff2` | Allumi Std Extended | 700 |
| `HelveticaNeue-Condensed.woff2` | Helvetica Neue Condensed (Monotype) | 400 |
| `HelveticaNeue-CondensedBold.woff2` | Helvetica Neue Condensed | 700 |

Si el cliente entrega `.otf`/`.ttf`, convertir a woff2:
`npx fonttools ttLib.woff2 compress archivo.otf` o https://transfonter.org

Mientras no estén los archivos, el sitio usa los fallbacks
(`Arial Narrow` / `Helvetica`) — se ve razonable pero NO es lo final.

Nota: el Shopify actual carga F37 Judge Medium Condensed, Trade Gothic y
Gotham — no Allumi/Helvetica Condensed. Confirmado con cliente que el
brand book manda: Allumi Std Ext + Helvetica Neue Condensed.
