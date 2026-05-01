export const dynamic = "force-dynamic";

export function GET() {
  return Response.json({ ok: true, app: "movie-app" }, { status: 200 });
}
