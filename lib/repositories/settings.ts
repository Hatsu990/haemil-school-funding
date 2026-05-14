import { randomUUID } from "node:crypto";
import { getDbClient } from "@/lib/db/client";
import { Setting, SettingRow } from "@/types";

function mapSettingRow(row: SettingRow): Setting {
  return {
    id: row.id,
    settingKey: row.setting_key,
    settingValue: row.setting_value,
    updatedAt: row.updated_at,
  };
}

function makeSettingId(): string {
  return `set-${randomUUID()}`;
}

export async function getSettings(): Promise<Setting[]> {
  const db = await getDbClient();
  const result = await db.execute<SettingRow>(
    `
      SELECT
        id,
        setting_key,
        setting_value,
        updated_at
      FROM settings
      ORDER BY setting_key ASC
    `,
  );

  return result.rows.map((row) => mapSettingRow(row));
}

export async function getSettingByKey(key: string): Promise<Setting | null> {
  const db = await getDbClient();
  const result = await db.execute<SettingRow>(
    `
      SELECT
        id,
        setting_key,
        setting_value,
        updated_at
      FROM settings
      WHERE setting_key = ?
      LIMIT 1
    `,
    [key],
  );

  if (result.rows.length === 0) {
    return null;
  }

  return mapSettingRow(result.rows[0]);
}

export async function upsertSetting(
  settingKey: string,
  settingValue: string,
): Promise<Setting> {
  const db = await getDbClient();
  const settingId = makeSettingId();

  await db.execute(
    `
      INSERT INTO settings (id, setting_key, setting_value, updated_at)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(setting_key)
      DO UPDATE SET
        setting_value = excluded.setting_value,
        updated_at = CURRENT_TIMESTAMP
    `,
    [settingId, settingKey, settingValue],
  );

  const setting = await getSettingByKey(settingKey);
  if (!setting) {
    throw new Error(`[settings repository] Failed to load setting: ${settingKey}`);
  }

  return setting;
}
