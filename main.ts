import { serveDir } from "jsr:@std/http/file-server";

Deno.serve((req) => {
  const url = new URL(req.url);
  let pathname = url.pathname;
  if (pathname === "/boys" || pathname === "/boys/") pathname = "/";
  else if (pathname === "/rabbis") pathname = "/rabbis/";

  if (url.hostname !== "zev.life" || pathname !== url.pathname) {
    return Response.redirect(`https://zev.life${pathname}${url.search}`, 301);
  }
  return serveDir(req, { fsRoot: "." });
});
