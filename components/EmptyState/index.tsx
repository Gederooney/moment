/**
 * PodCut EmptyState Component
 * Informative empty states with illustrations and actions
 * Designed to guide users and maintain engagement
 */

export { EmptyStateBase as EmptyState } from './EmptyStateBase';
export {
  NoVideosEmptyState,
  NoSearchResultsEmptyState,
  NoMomentsEmptyState,
  VideoErrorEmptyState,
  LoadingEmptyState,
  SuccessEmptyState,
} from './variants';
export type { EmptyStateProps, EmptyStateVariant, EmptyStateAction } from './types';
