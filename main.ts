import { serveDir } from "jsr:@std/http/file-server";

const IMMUTABLE = "public, max-age=31536000, immutable";

function cacheControl(url: URL, contentType: string): string | null {
  if (contentType.includes("text/html")) return "no-cache";
  if (url.searchParams.has("v") || url.pathname.startsWith("/img/")) return IMMUTABLE;
  return null;
}

Deno.serve(async (req) => {
  const url = new URL(req.url);
  if (url.hostname !== "zev.life") {
    return Response.redirect(`https://zev.life${url.pathname}${url.search}`, 301);
  }

  const res = await serveDir(req, { fsRoot: "." });
  if (res.status !== 200) return res;

  const value = cacheControl(url, res.headers.get("content-type") ?? "");
  if (!value) return res;

  const headers = new Headers(res.headers);
  headers.set("cache-control", value);
  return new Response(res.body, {
    status: res.status,
    statusText: res.statusText,
    headers,
  });
});
