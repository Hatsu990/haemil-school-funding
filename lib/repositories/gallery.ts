import { randomUUID } from "node:crypto";
import { getDbClient } from "@/lib/db/client";
import { CreateGalleryItemInput, GalleryItem, GalleryItemRow } from "@/types";

function mapGalleryRow(row: GalleryItemRow): GalleryItem {
  return {
    id: row.id,
    title: row.title,
    type: row.type,
    fileUrl: row.file_url,
    createdAt: row.created_at,
  };
}

function makeGalleryId(): string {
  return `ga-${randomUUID()}`;
}

export async function getGalleryItems(): Promise<GalleryItem[]> {
  const db = await getDbClient();
  const result = await db.execute<GalleryItemRow>(
    `
      SELECT
        id,
        title,
        type,
        file_url,
        created_at
      FROM gallery_items
      ORDER BY created_at DESC, id DESC
    `,
  );

  return result.rows.map((row) => mapGalleryRow(row));
}

export async function getGalleryItemById(id: string): Promise<GalleryItem | null> {
  const db = await getDbClient();
  const result = await db.execute<GalleryItemRow>(
    `
      SELECT
        id,
        title,
        type,
        file_url,
        created_at
      FROM gallery_items
      WHERE id = ?
      LIMIT 1
    `,
    [id],
  );

  if (result.rows.length === 0) {
    return null;
  }

  return mapGalleryRow(result.rows[0]);
}

export async function createGalleryItem(
  data: CreateGalleryItemInput,
): Promise<GalleryItem> {
  const createdItems = await createGalleryItems([data]);
  return createdItems[0];
}

export async function createGalleryItems(
  items: CreateGalleryItemInput[],
): Promise<GalleryItem[]> {
  if (items.length === 0) {
    return [];
  }

  const db = await getDbClient();
  const createdRows = await db.transaction(async (tx) => {
    const rows: GalleryItemRow[] = [];

    for (const item of items) {
      const galleryId = makeGalleryId();
      await tx.execute(
        `
          INSERT INTO gallery_items (id, title, type, file_url, created_at)
          VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
        `,
        [galleryId, item.title, item.type, item.fileUrl],
      );

      const rowResult = await tx.execute<GalleryItemRow>(
        `
          SELECT
            id,
            title,
            type,
            file_url,
            created_at
          FROM gallery_items
          WHERE id = ?
          LIMIT 1
        `,
        [galleryId],
      );

      if (rowResult.rows.length === 0) {
        throw new Error(
          `[gallery repository] Failed to load created gallery item: ${galleryId}`,
        );
      }

      rows.push(rowResult.rows[0]);
    }

    return rows;
  });

  return createdRows.map((row) => mapGalleryRow(row));
}

export async function deleteGalleryItem(id: string): Promise<GalleryItem | null> {
  const db = await getDbClient();
  const galleryId = id.trim();

  if (!galleryId) {
    return null;
  }

  return db.transaction(async (tx) => {
    const rowResult = await tx.execute<GalleryItemRow>(
      `
        SELECT
          id,
          title,
          type,
          file_url,
          created_at
        FROM gallery_items
        WHERE id = ?
        LIMIT 1
      `,
      [galleryId],
    );

    if (rowResult.rows.length === 0) {
      return null;
    }

    await tx.execute(
      `
        DELETE FROM gallery_items
        WHERE id = ?
      `,
      [galleryId],
    );

    return mapGalleryRow(rowResult.rows[0]);
  });
}
