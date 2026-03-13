import { query } from "@/lib/db";

const DEFAULT_PEOPLE_ROLES = ["senior_pastor", "senior_staff", "staff", "member"];

/** Get the list of people roles the given app role is allowed to edit. Superuser can edit all. */
export async function getEditablePeopleRoles(appRole: string): Promise<string[]> {
  try {
    if (appRole === "superuser") {
      const { rows } = await query<{ role: string }>("SELECT role FROM people_role_hierarchy ORDER BY rank ASC");
      return rows.length > 0 ? rows.map((r) => r.role) : DEFAULT_PEOPLE_ROLES;
    }
    const { rows } = await query<{ editable_people_roles: string[] }>(
      "SELECT editable_people_roles FROM app_role_edit_scope WHERE app_role = $1",
      [appRole]
    );
    if (rows.length === 0) return [];
    return rows[0].editable_people_roles ?? [];
  } catch {
    return appRole === "superuser" ? DEFAULT_PEOPLE_ROLES : [];
  }
}

/** Check if the current app user can edit a person with the given people role. */
export async function canEditPerson(appRole: string, personPeopleRole: string): Promise<boolean> {
  const editable = await getEditablePeopleRoles(appRole);
  return editable.includes(personPeopleRole);
}
