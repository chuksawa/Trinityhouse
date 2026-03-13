import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCookieName, verifyToken } from "@/lib/auth";
import { query } from "@/lib/db";
import { canEditPerson } from "@/lib/hierarchy";

type PersonRow = { id: string; role: string };

/** PATCH: Update a person. Allowed only if current user's app role can edit this person's role (hierarchy). */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(getCookieName())?.value;
    const payload = token ? await verifyToken(token) : null;
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    const { rows: personRows } = await query<PersonRow>("SELECT id, role FROM people WHERE id = $1", [id]);
    if (personRows.length === 0) return NextResponse.json({ error: "Person not found" }, { status: 404 });

    const allowed = await canEditPerson(payload.role, personRows[0].role);
    if (!allowed) return NextResponse.json({ error: "You do not have permission to edit this person" }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const updates: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    const allowedFields: { key: string; col: string }[] = [
      { key: "firstName", col: "first_name" },
      { key: "lastName", col: "last_name" },
      { key: "email", col: "email" },
      { key: "phone", col: "phone" },
      { key: "role", col: "role" },
      { key: "status", col: "status" },
      { key: "avatarColor", col: "avatar_color" },
    ];

    for (const { key, col } of allowedFields) {
      if (body[key] !== undefined) {
        updates.push(`${col} = $${idx}`);
        values.push(body[key] === "" ? null : body[key]);
        idx++;
      }
    }

    if (updates.length === 0) return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });

    // If changing role, verify current user can edit the new role too
    if (body.role !== undefined) {
      const canEditNew = await canEditPerson(payload.role, body.role);
      if (!canEditNew) return NextResponse.json({ error: "You cannot assign that role" }, { status: 403 });
    }

    values.push(id);
    await query(
      `UPDATE people SET ${updates.join(", ")}, updated_at = NOW() WHERE id = $${idx}`,
      values
    );

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[people PATCH]", e);
    return NextResponse.json({ error: "Failed to update person" }, { status: 500 });
  }
}
