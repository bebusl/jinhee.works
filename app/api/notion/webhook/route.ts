export async function POST(req: Request) {
  const body = await req.json();

  console.log(body);

  return Response.json({ ok: true });
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
