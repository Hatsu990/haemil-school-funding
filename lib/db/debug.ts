import { getDbConnectionDebugInfo } from "@/lib/db/client";

export function getDbDebugSummary(): string {
  const debug = getDbConnectionDebugInfo();
  return `runtime=${debug.runtime}, source=${debug.envSource}, url=${debug.maskedDatabaseUrl}`;
}

export function buildDbErrorMessage(baseMessage: string): string {
  const debug = getDbConnectionDebugInfo();
  return `${baseMessage} (환경: ${debug.runtime}, DB: ${debug.maskedDatabaseUrl})`;
}

export function logDbLoadError(scope: string, error: unknown): void {
  console.error(`[${scope}] DB load failed (${getDbDebugSummary()})`, error);
}
