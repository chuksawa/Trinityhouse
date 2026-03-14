import { NextResponse } from "next/server";
import { query } from "@/lib/db";

/** Public: return giving options (external URL, text-to-give number) for the give page. */
export async function GET() {
  try {
    const { rows } = await query<{
      giving_external_url: string | null;
      text_to_give_phone: string | null;
    }>(
      "SELECT giving_external_url, text_to_give_phone FROM church_profile WHERE id = 1"
    );
    const row = rows[0];
    return NextResponse.json({
      givingExternalUrl: row?.giving_external_url ?? "",
      textToGivePhone: row?.text_to_give_phone ?? "",
    });
  } catch (e) {
    console.error("[giving/config GET]", e);
    return NextResponse.json(
      { givingExternalUrl: "", textToGivePhone: "" },
      { status: 200 }
    );
  }
}
