import { NextResponse } from "next/server";

const API_URL = process.env.MESH_API_URL ?? "http://localhost:8000/v1";
const API_KEY = process.env.MESH_API_KEY ?? "";

export async function GET() {
  try {
    const res = await fetch(`${API_URL}/models`, {
      headers: { Authorization: `Bearer ${API_KEY}` },
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch models" },
        { status: res.status }
      );
    }

    return NextResponse.json(await res.json());
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch models" },
      { status: 500 }
    );
  }
}
