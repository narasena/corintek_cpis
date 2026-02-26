// =============================================================================
// Types & Interfaces
// =============================================================================

export * from './types';

// =============================================================================
// Repository (Persistence Layer)
// =============================================================================

export { createPrismaParameterLimitCategoryRepository } from './repository-prisma';

// =============================================================================
// Service (Business Logic Layer)
// =============================================================================

export {
  createParameterLimitCategoryService,
  parameterLimitCategoryService,
} from './service';

// =============================================================================
// Actions (Server Actions Entry Point)
// =============================================================================

export * from './actions';

// =============================================================================
// Limit Resolution Utilities (Pure Functions)
// =============================================================================

// Re-export from parameters module (single source of truth)
export {
  applyProjectLimits,
  applyProjectOverridesToParameters,
  buildCategoryLimitsMap,
  type IParameterLike,
  type IParameterOverrideLike,
  type ICategoryLimitLike,
  type ILimitResolutionContext,
} from '@/features/parameters/limits-utils';

// =============================================================================
// React Components
// =============================================================================

export { CategoryForm } from './components/category-form';
export { CategorySelector } from './components/category-selector';
