import { env } from "cloudflare:workers";

const CATEGORIES = new Set([
  "ethics",
  "recruitment",
  "making",
  "fieldwork",
  "writing",
  "feedback",
  "revision",
  "internship",
  "leave",
]);
const PLAN_VERSION = 7;

type RuntimeEnv = {
  DB?: D1Database;
  EDITOR_EMAIL?: string;
};

type TaskEdit = {
  title?: string;
  start?: string;
  end?: string;
  detail?: string;
  category?: string;
};

function getRuntimeEnv() {
  return env as unknown as RuntimeEnv;
}

function getEmail(request: Request) {
  return request.headers.get("oai-authenticated-user-email")?.trim().toLowerCase() ?? "";
}

function canEdit(request: Request) {
  const editorEmail = getRuntimeEnv().EDITOR_EMAIL?.trim().toLowerCase() ?? "";
  return Boolean(editorEmail && getEmail(request) === editorEmail);
}

function getDatabase() {
  const database = getRuntimeEnv().DB;
  if (!database) throw new Error("Timeline database is unavailable.");
  return database;
}

function json(body: unknown, status = 200) {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

function validDate(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(`${value}T00:00:00Z`));
}

function validateEdit(value: unknown): TaskEdit | null {
  if (!value || typeof value !== "object") return null;
  const candidate = value as Record<string, unknown>;
  const title = typeof candidate.title === "string" ? candidate.title.trim() : "";
  const detail = typeof candidate.detail === "string" ? candidate.detail.trim() : "";
  const start = candidate.start;
  const end = candidate.end;
  const category = candidate.category;

  if (!title || title.length > 180 || !detail || detail.length > 4000) return null;
  if (!validDate(start) || !validDate(end) || Date.parse(end) < Date.parse(start)) return null;
  if (typeof category !== "string" || !CATEGORIES.has(category)) return null;

  return { title, detail, start, end, category };
}

export async function GET(request: Request) {
  try {
    const result = await getDatabase()
      .prepare("SELECT task_id, payload FROM plan_edits WHERE plan_version = ? ORDER BY task_id")
      .bind(PLAN_VERSION)
      .all<{ task_id: string; payload: string }>();
    const edits: Record<string, TaskEdit> = {};

    for (const row of result.results) {
      try {
        edits[row.task_id] = JSON.parse(row.payload) as TaskEdit;
      } catch {
        // Ignore a malformed row instead of breaking the public timeline.
      }
    }

    return json({ edits, canEdit: canEdit(request) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load timeline.";
    return json({ error: message, edits: {}, canEdit: false }, 500);
  }
}

export async function PUT(request: Request) {
  if (!canEdit(request)) return json({ error: "Only the site owner can edit this timeline." }, 403);

  try {
    const body = (await request.json()) as { taskId?: unknown; edit?: unknown };
    const taskId = typeof body.taskId === "string" ? body.taskId.trim() : "";
    const edit = validateEdit(body.edit);

    if (!/^[a-z0-9-]{1,80}$/.test(taskId) || !edit) {
      return json({ error: "The timeline change is invalid." }, 400);
    }

    await getDatabase()
      .prepare(`
        INSERT INTO plan_edits (task_id, payload, updated_at, updated_by, plan_version)
        VALUES (?, ?, CURRENT_TIMESTAMP, ?, ?)
        ON CONFLICT(task_id) DO UPDATE SET
          payload = excluded.payload,
          updated_at = CURRENT_TIMESTAMP,
          updated_by = excluded.updated_by,
          plan_version = excluded.plan_version
      `)
      .bind(taskId, JSON.stringify(edit), getEmail(request), PLAN_VERSION)
      .run();

    return json({ ok: true, taskId, edit });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save timeline.";
    return json({ error: message }, 500);
  }
}

export async function DELETE(request: Request) {
  if (!canEdit(request)) return json({ error: "Only the site owner can edit this timeline." }, 403);

  try {
    const url = new URL(request.url);
    const taskId = url.searchParams.get("taskId")?.trim() ?? "";
    const database = getDatabase();

    if (taskId) {
      if (!/^[a-z0-9-]{1,80}$/.test(taskId)) return json({ error: "Invalid phase." }, 400);
      await database.prepare("DELETE FROM plan_edits WHERE task_id = ?").bind(taskId).run();
    } else {
      await database.prepare("DELETE FROM plan_edits").run();
    }

    return json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to reset timeline.";
    return json({ error: message }, 500);
  }
}
