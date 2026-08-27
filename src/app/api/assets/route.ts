import { NextResponse } from "next/server";
import { getStore } from "@/lib/store";
import { parseAssetInput } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const assets = await getStore().list();
    return NextResponse.json({ data: assets });
  } catch (error) {
    console.error("GET /api/assets failed", error);
    return NextResponse.json(
      { error: "Gagal memuat data aset" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON tidak valid" }, { status: 400 });
  }

  const parsed = parseAssetInput(body);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  try {
    const asset = await getStore().create(parsed.data);
    return NextResponse.json({ data: asset }, { status: 201 });
  } catch (error) {
    console.error("POST /api/assets failed", error);
    return NextResponse.json(
      { error: "Gagal menyimpan data aset" },
      { status: 500 }
    );
  }
}
