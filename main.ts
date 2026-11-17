import { serveDir } from "jsr:@std/http/file-server";

Deno.serve(async (req) => {
  const url = new URL(req.url);
  let pathname = url.pathname;

  if (pathname === "/boys" || pathname === "/boys/") pathname = "/";
  else if (pathname === "/rabbis") pathname = "/rabbis/";

  if (pathname === "/join" || pathname === "/join/") {
    return Response.redirect("https://zev.life/?src=poster", 302);
  }

  if (url.hostname !== "zev.life" || pathname !== url.pathname) {
    return Response.redirect(`https://zev.life${pathname}${url.search}`, 301);
  }

  const res = await serveDir(req, { fsRoot: "." });
  if (res.status !== 200) return res;

  const headers = new Headers(res.headers);
  const type = headers.get("content-type") ?? "";
  if (pathname === "/robots.txt" || pathname === "/sitemap.xml") {
    headers.set("Cache-Control", "public, max-age=3600");
  } else if (type.includes("text/html")) {
    headers.set("Cache-Control", "no-cache");
  } else if (url.search.includes("v=") || pathname.startsWith("/img/")) {
    headers.set("Cache-Control", "public, max-age=31536000, immutable");
  }

  return new Response(res.body, {
    status: res.status,
    statusText: res.statusText,
    headers,
  });
});
