/**
 * @fileoverview DI Wiring for Log Sheet Feature
 * @module features/log-sheets/di
 */

import { LogSheetService } from './log-sheet-service';
import { prisma } from '@/lib/prisma';
import type { ILogSheetService } from '@/lib/di/interfaces';

/**
 * Factory: Create LogSheetService with dependencies
 */
export function createLogSheetService(): ILogSheetService {
  return new LogSheetService({ prisma });
}
