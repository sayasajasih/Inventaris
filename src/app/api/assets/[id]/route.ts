import { NextResponse } from "next/server";
import { getStore } from "@/lib/store";
import { parseAssetInput } from "@/lib/validation";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  try {
    const asset = await getStore().get(id);
    if (!asset) {
      return NextResponse.json(
        { error: "Aset tidak ditemukan" },
        { status: 404 }
      );
    }
    return NextResponse.json({ data: asset });
  } catch (error) {
    console.error(`GET /api/assets/${id} failed`, error);
    return NextResponse.json(
      { error: "Gagal memuat data aset" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: Params) {
  const { id } = await params;

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
    const asset = await getStore().update(id, parsed.data);
    if (!asset) {
      return NextResponse.json(
        { error: "Aset tidak ditemukan" },
        { status: 404 }
      );
    }
    return NextResponse.json({ data: asset });
  } catch (error) {
    console.error(`PUT /api/assets/${id} failed`, error);
    return NextResponse.json(
      { error: "Gagal memperbarui data aset" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  try {
    const deleted = await getStore().remove(id);
    if (!deleted) {
      return NextResponse.json(
        { error: "Aset tidak ditemukan" },
        { status: 404 }
      );
    }
    return NextResponse.json({ data: { id } });
  } catch (error) {
    console.error(`DELETE /api/assets/${id} failed`, error);
    return NextResponse.json(
      { error: "Gagal menghapus data aset" },
      { status: 500 }
    );
  }
}
