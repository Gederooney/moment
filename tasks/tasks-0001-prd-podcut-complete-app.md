# Task List: PodCut - Complete App Evolution

> Generated from: [0001-prd-podcut-complete-app.md](./0001-prd-podcut-complete-app.md)
>
> **Current State Analysis:**
> - ✅ Existing: YouTube player, moments (timestamps), playlists, AsyncStorage, contexts (Moments, Playlist, TopBar)
> - ✅ Existing: Design system, reusable components (Button, Card, Toast, EmptyState)
> - ✅ Existing: Storage patterns with migration support (PlaylistStorage, useVideoHistory)
> - 🎯 To Add: Screen recording, rich text editor, folders, tags, export, previews, UI redesign

---

## Relevant Files

### Types & Data Models
- `mobile/types/moment.ts` - Extend with new moment types (youtube_timestamp, screen_recording), add notes, tags fields
- `mobile/types/folder.ts` - NEW: Folder and FolderItem interfaces for hierarchical organization
- `mobile/types/export.ts` - NEW: Export format types (Notion, Obsidian, etc.)
- `mobile/types/screenRecording.ts` - NEW: Screen recording state, buffer, configuration types

### Contexts (State Management)
- `mobile/contexts/MomentsContext.tsx` - Extend to support new moment types, tags, notes
- `mobile/contexts/FoldersContext.tsx` - NEW: Folder management context (similar to PlaylistContext)
- `mobile/contexts/ScreenRecordingContext.tsx` - NEW: Screen recording state and controls
- `mobile/contexts/PlaylistContext.tsx` - Keep as is (no changes needed)

### Services (Business Logic)
- `mobile/services/screenRecording.ts` - NEW: Screen recording logic (iOS ReplayKit, Android MediaProjection)
- `mobile/services/screenRecordingBuffer.ts` - NEW: Circular buffer for last N minutes of recording
- `mobile/services/ffmpeg.ts` - NEW: Video preview extraction using react-native-ffmpeg
- `mobile/services/export.ts` - NEW: Export formatters for Notion, Obsidian, clipboard
- `mobile/services/momentStorage.ts` - NEW: Storage service for new moment types (extend pattern from playlistStorage.ts)
- `mobile/services/folderStorage.ts` - NEW: Storage service for folders (similar to playlistStorage.ts)
- `mobile/services/tagService.ts` - NEW: Tag autocomplete, filtering, global tag management
- `mobile/services/migrationService.ts` - NEW: Data migration for existing moments to new format

### Components
- `mobile/components/RichTextEditor/index.tsx` - NEW: Rich text editor component (@10play/tentap-editor wrapper)
- `mobile/components/RichTextEditor/toolbar.tsx` - NEW: Markdown toolbar (bold, italic, lists, links)
- `mobile/components/RichTextEditor/types.ts` - NEW: Editor types and props
- `mobile/components/VideoPreview/index.tsx` - NEW: 10s video preview component (YouTube + screen recordings)
- `mobile/components/VideoPreview/YouTubePreview.tsx` - NEW: YouTube seek + 10s preview
- `mobile/components/VideoPreview/LocalVideoPreview.tsx` - NEW: Local video file preview
- `mobile/components/MomentEditor/index.tsx` - NEW: Moment editor modal (title, notes, tags)
- `mobile/components/MomentEditor/TagInput.tsx` - NEW: Tag input with autocomplete
- `mobile/components/FloatingCaptureButton/index.tsx` - NEW: Floating button for screen recording (Android overlay)
- `mobile/components/FolderTree/index.tsx` - NEW: Hierarchical folder view with breadcrumbs
- `mobile/components/FolderTree/FolderItem.tsx` - NEW: Individual folder item component
- `mobile/components/ExportModal/index.tsx` - NEW: Export preview and format selection modal
- `mobile/components/ExportModal/PreviewContent.tsx` - NEW: Formatted content preview

### Screens (UI Updates)
- `mobile/app/(tabs)/index.tsx` - Add "Start Screen Recording" button, FAB menu
- `mobile/app/(tabs)/_HomeInitialState.tsx` - Redesign with modern UI (hero section, gradient, larger cards)
- `mobile/app/(tabs)/moments/index.tsx` - Add folders/tags filters, grid view, search improvements
- `mobile/app/(tabs)/moments/_MomentsList.tsx` - Add preview on long-press, new visual design
- `mobile/app/(tabs)/settings.tsx` - Add new settings sections (Screen Recording, Moments, Export, Storage)
- `mobile/app/player/index.tsx` - Integrate MomentEditor overlay, moments panel redesign
- `mobile/app/player/_PlayerMoments.tsx` - Show moments list in bottom sheet/sidebar format
- `mobile/app/player/_PlayerControls.tsx` - Keep capture button, ensure compatibility with new editor
- `mobile/app/folders/index.tsx` - NEW: Folders screen with tree view, breadcrumbs
- `mobile/app/folders/[folderId].tsx` - NEW: Individual folder view (dynamic route)

### Hooks
- `mobile/hooks/useScreenRecording.ts` - NEW: Hook for screen recording state and controls
- `mobile/hooks/useFolders.ts` - NEW: Hook for folder operations (wrapper around FoldersContext)
- `mobile/hooks/useTags.ts` - NEW: Hook for tag autocomplete and filtering
- `mobile/hooks/useExport.ts` - NEW: Hook for export operations
- `mobile/hooks/useVideoPreview.ts` - NEW: Hook for generating and caching video previews
- `mobile/hooks/useMoments.ts` - Update to use new moment types (currently deprecated wrapper)

### Utils
- `mobile/utils/markdown.ts` - NEW: Markdown formatting utilities for export
- `mobile/utils/storage.ts` - Extend with new storage keys for folders, screen recordings
- `mobile/utils/migration.ts` - Update with new migration functions for moments

### Native Modules (if needed)
- `mobile/modules/ScreenRecording/index.ts` - NEW: Native module interface for iOS/Android
- `mobile/modules/ScreenRecording/ios/ReplayKitBridge.swift` - NEW: iOS ReplayKit implementation
- `mobile/modules/ScreenRecording/android/MediaProjectionBridge.java` - NEW: Android MediaProjection implementation
- `mobile/modules/FloatingButton/android/FloatingButtonManager.java` - NEW: Android overlay window for floating button

### Notes
- **Migration Strategy:** Create `migrationService.ts` to handle one-time migration of existing `CapturedMoment` data to new format with `type: 'youtube_timestamp'`, empty `notes`, empty `tags`
- **Storage Pattern:** Follow existing pattern from `playlistStorage.ts` - use AsyncStorage with JSON serialization, schema versioning, and migration support
- **Context Pattern:** Follow existing pattern from `PlaylistContext.tsx` - provide state + actions, subscribe/notify pattern for real-time updates
- **Testing:** Add test files alongside implementation files (e.g., `RichTextEditor.test.tsx`)
- **Dependencies:** Will need to install: `@10play/tentap-editor`, `react-native-ffmpeg`, `react-native-draggable-view`, and potentially native screen recording packages

---

## Tasks

- [ ] 1.0 **Data Model Migration & Type System Updates**
  - Foundation for new moment types, folders, tags, and screen recordings

- [ ] 2.0 **Rich Text Editor Integration (In-Player Notes)**
  - Core annotation feature - notes editor that works without leaving video player

- [ ] 3.0 **Screen Recording System**
  - Screen recording with background buffer, floating button, and moment capture

- [ ] 4.0 **Folders & Tags Organization System**
  - Hierarchical folder structure and global tag system for content organization

- [ ] 5.0 **Video Previews (10s clips)**
  - Preview generation for YouTube moments and screen recording clips

- [ ] 6.0 **Export Functionality**
  - Export to Notion, Obsidian, and clipboard with formatted markdown

- [ ] 7.0 **UI Redesign & Visual Improvements**
  - Modernize interface with new design system, animations, and better UX

- [ ] 8.0 **Settings & Storage Management**
  - New settings for screen recording, previews, export, and storage cleanup

- [ ] 9.0 **Testing, Migration, & Polish**
  - Data migration, edge case handling, performance optimization, bug fixes

---

**Ready to generate sub-tasks?** Respond with **"Go"** to proceed with detailed breakdown of each parent task.
