# Tests Requirements for PodCut Development

> **Important:** Tests MUST be written and pass for each task before moving to the next task.

---

## Test Strategy

### 1. Test-Driven Development (TDD) Approach
For each task:
1. Write tests FIRST (or alongside implementation)
2. Implement feature
3. Run tests and ensure they pass
4. Refactor if needed
5. **DO NOT proceed to next task until all tests pass**

### 2. Test Coverage Requirements
- **Minimum coverage:** 80% for all services, utilities, and business logic
- **Component testing:** Critical user flows must have E2E or integration tests
- **Regression prevention:** Add tests for every bug fixed

### 3. Types of Tests

#### Unit Tests
- **Services:** All business logic in `/services` directory
- **Utils:** All utility functions in `/utils` directory
- **Hooks:** Custom hooks behavior
- **Location:** Co-located with source files in `__tests__` directories

#### Integration Tests
- **Context providers:** State management flows
- **Storage operations:** AsyncStorage interactions
- **API calls:** YouTube metadata, screen recording

#### Component Tests
- **UI Components:** Rendering, user interactions
- **Use React Native Testing Library**

#### End-to-End Tests (Critical Flows)
- **Moment capture flow:** YouTube → Capture → Add Notes → Save
- **Screen recording flow:** Start → Capture moment → Stop
- **Export flow:** Select moments → Export → Verify format
- **Use Detox or similar**

---

## Tests Required Per Task

### Task 1.0: Data Model Migration & Type System

**Unit Tests:**
```
mobile/services/__tests__/migrationService.test.ts
- ✅ migrateOldMomentsToNewFormat() converts old format to new
- ✅ Migration adds type: 'youtube_timestamp'
- ✅ Migration adds empty notes and tags
- ✅ Migration preserves all existing data
- ✅ Migration runs only once (schema version check)
- ✅ Migration handles empty database
- ✅ Migration handles corrupted data gracefully

mobile/services/__tests__/momentStorage.test.ts
- ✅ saveMoments() serializes moments correctly
- ✅ loadMoments() deserializes moments correctly
- ✅ getMomentById() retrieves correct moment
- ✅ deleteMoment() removes moment correctly
- ✅ Schema version is saved and checked

mobile/services/__tests__/folderStorage.test.ts
- ✅ saveFolders() handles nested folders
- ✅ loadFolders() restores folder hierarchy
- ✅ getFolderById() works for nested folders
- ✅ deleteFolder() removes folder and its contents

mobile/services/__tests__/tagService.test.ts
- ✅ getAllTags() extracts unique tags from moments
- ✅ getTagSuggestions() returns filtered suggestions
- ✅ Autocomplete is case-insensitive
```

**Integration Tests:**
```
mobile/__tests__/integration/migration.test.ts
- ✅ Full migration flow from app startup
- ✅ Existing moments load correctly after migration
- ✅ New moments can be created after migration
```

---

### Task 2.0: Rich Text Editor Integration

**Component Tests:**
```
mobile/components/RichTextEditor/__tests__/RichTextEditor.test.tsx
- ✅ Editor renders with initial content
- ✅ Toolbar buttons work (bold, italic, etc.)
- ✅ Content changes trigger onChange callback
- ✅ Auto-save triggers after 3 seconds
- ✅ Markdown is saved correctly

mobile/components/MomentEditor/__tests__/MomentEditor.test.tsx
- ✅ Modal opens with animation
- ✅ Title field is pre-filled correctly
- ✅ TagInput autocomplete suggests existing tags
- ✅ Save button creates/updates moment
- ✅ Cancel button discards changes

mobile/components/MomentEditor/__tests__/TagInput.test.tsx
- ✅ Renders tag chips
- ✅ Autocomplete dropdown appears on typing
- ✅ Tags can be added and removed
- ✅ Duplicate tags are prevented
```

**Integration Tests:**
```
mobile/__tests__/integration/momentEditing.test.ts
- ✅ Create moment with notes and tags from player screen
- ✅ Edit existing moment preserves data
- ✅ Video continues playing while editor is open
- ✅ Notes and tags are saved to storage
```

---

### Task 3.0: Screen Recording System

**Unit Tests:**
```
mobile/services/__tests__/screenRecordingBuffer.test.ts
- ✅ Buffer stores last N minutes
- ✅ getLastNMinutes() extracts correct duration
- ✅ Buffer clears when stopped
- ✅ Memory limit is respected
- ✅ Compression works correctly

mobile/services/__tests__/screenRecording.ios.test.ts (iOS)
- ✅ startRecording() requests permissions
- ✅ Recording continues in background
- ✅ captureLastNMinutes() saves file
- ✅ stopRecording() cleans up resources

mobile/services/__tests__/screenRecording.android.test.ts (Android)
- ✅ (Same as iOS tests)
```

**Integration Tests:**
```
mobile/__tests__/integration/screenRecording.test.ts
- ✅ Start recording → background app → capture moment → file saved
- ✅ Floating button appears only when recording + backgrounded
- ✅ Screen recording moment is created with correct type
- ✅ Memory usage stays below 200MB
```

**E2E Tests (Manual on device):**
- ✅ Screen recording works on physical iOS device
- ✅ Screen recording works on physical Android device
- ✅ Floating button is draggable
- ✅ Capture works from TikTok/Instagram apps

---

### Task 4.0: Folders & Tags Organization

**Unit Tests:**
```
mobile/contexts/__tests__/FoldersContext.test.tsx
- ✅ createFolder() adds folder
- ✅ deleteFolder() removes folder and children
- ✅ addItemToFolder() updates folder items
- ✅ moveFolder() changes parent correctly
- ✅ Nested folder operations work (3+ levels)

mobile/hooks/__tests__/useFolders.test.ts
- ✅ Hook returns correct folder operations
- ✅ State updates trigger re-renders
```

**Component Tests:**
```
mobile/components/FolderTree/__tests__/FolderTree.test.tsx
- ✅ Renders folder hierarchy
- ✅ Expand/collapse animation works
- ✅ Breadcrumb navigation updates correctly

mobile/components/FolderTree/__tests__/FolderItem.test.tsx
- ✅ Long-press shows context menu
- ✅ Tap navigates into folder
```

**Integration Tests:**
```
mobile/__tests__/integration/folderManagement.test.ts
- ✅ Create folder → add moment → move to subfolder → verify
- ✅ Filter moments by folder works
- ✅ Filter moments by tags works
- ✅ Combined folder + tag filter works
```

---

### Task 5.0: Video Previews

**Unit Tests:**
```
mobile/services/__tests__/ffmpeg.test.ts
- ✅ extractPreview() creates 10s clip
- ✅ generateThumbnail() extracts frame
- ✅ compressVideo() reduces file size
- ✅ Preview extraction completes in < 2s

mobile/hooks/__tests__/useVideoPreview.test.ts
- ✅ generatePreview() creates and caches preview
- ✅ getPreviewPath() returns cached path if exists
- ✅ deletePreview() removes from cache
```

**Component Tests:**
```
mobile/components/VideoPreview/__tests__/VideoPreview.test.tsx
- ✅ Renders YouTube preview
- ✅ Renders local video preview
- ✅ Loading state shows spinner
- ✅ Play/Pause controls work
```

**Integration Tests:**
```
mobile/__tests__/integration/videoPreview.test.ts
- ✅ Long-press moment shows preview modal
- ✅ Preview plays 10s clip
- ✅ "Play Full" opens player at correct timestamp
- ✅ Cache auto-cleans when > 1GB
```

---

### Task 6.0: Export Functionality

**Unit Tests:**
```
mobile/utils/__tests__/markdown.test.ts
- ✅ formatMomentAsMarkdown() generates correct Notion format
- ✅ formatMomentAsMarkdown() generates correct Obsidian format
- ✅ escapeMarkdown() handles special characters
- ✅ Timestamps are formatted correctly
- ✅ Tags are included/excluded based on options

mobile/services/__tests__/export.test.ts
- ✅ exportToClipboard() copies to clipboard
- ✅ exportToFile() creates .md file
- ✅ shareFile() triggers share sheet
```

**Component Tests:**
```
mobile/components/ExportModal/__tests__/ExportModal.test.tsx
- ✅ Modal shows formatted preview
- ✅ Format selection updates preview
- ✅ Options toggles work
- ✅ Copy to clipboard works
- ✅ Save as file works
```

**Integration Tests:**
```
mobile/__tests__/integration/export.test.ts
- ✅ Export all moments → verify Notion format
- ✅ Export single video → verify Obsidian format
- ✅ Clipboard contains correct markdown
- ✅ File can be shared to other apps
```

---

### Task 7.0: UI Redesign

**Component Tests (for new components):**
```
mobile/components/FAB/__tests__/FAB.test.tsx
- ✅ FAB expands/collapses on tap
- ✅ Menu actions trigger correctly
- ✅ Animation is smooth (check timing)

mobile/components/BottomSheet/__tests__/BottomSheet.test.tsx
- ✅ Swipe up/down changes snap points
- ✅ Content renders correctly
```

**Visual Regression Tests (optional but recommended):**
```
mobile/__tests__/visual/HomeScreen.test.tsx
- ✅ Screenshot matches approved design
- ✅ Dark mode screenshot matches

mobile/__tests__/visual/PlayerScreen.test.tsx
- ✅ (Same for all major screens)
```

**Accessibility Tests:**
```
mobile/__tests__/accessibility/a11y.test.tsx
- ✅ All interactive elements have accessibility labels
- ✅ Color contrast meets WCAG AA (4.5:1)
- ✅ Touch targets are ≥ 44x44px
```

---

### Task 8.0: Settings & Storage Management

**Unit Tests:**
```
mobile/hooks/__tests__/useSettings.test.ts
- ✅ Settings persist to AsyncStorage
- ✅ Default values are correct
- ✅ Setting updates trigger re-renders

mobile/services/__tests__/storageManager.test.ts
- ✅ calculateTotalStorage() returns accurate stats
- ✅ clearPreviewCache() removes files
- ✅ clearOldRecordings() respects date threshold
- ✅ clearAllData() removes everything
```

**Integration Tests:**
```
mobile/__tests__/integration/settings.test.ts
- ✅ Change screen recording duration → verify applied
- ✅ Change preview quality → verify previews use new quality
- ✅ Change export format → verify format used in export
```

---

### Task 9.0: Testing, Migration, & Polish

**Final Test Suite:**
```
mobile/__tests__/e2e/criticalFlows.test.ts (Detox)
- ✅ Complete YouTube moment capture flow
- ✅ Complete screen recording moment capture flow
- ✅ Complete folder organization flow
- ✅ Complete export flow
- ✅ Complete settings change flow

mobile/__tests__/performance/performance.test.ts
- ✅ App startup time < 3s
- ✅ Moments list scrolling at 60fps
- ✅ Screen recording memory < 200MB
- ✅ Preview generation < 2s

mobile/__tests__/integration/regression.test.ts
- ✅ All fixed bugs have tests
- ✅ No regressions in previously working features
```

**Load Testing:**
```
mobile/__tests__/load/largeDataset.test.ts
- ✅ App handles 1000+ moments
- ✅ App handles 100+ folders
- ✅ Search with large dataset < 1s
```

---

## Test Commands

```bash
# Run all tests
pnpm test

# Run tests with coverage
pnpm test --coverage

# Run specific test file
pnpm test migrationService.test.ts

# Run tests in watch mode (during development)
pnpm test --watch

# Run E2E tests (Detox)
pnpm test:e2e

# Run specific task tests only
pnpm test mobile/services/__tests__/
```

---

## Test Coverage Requirements by Task

| Task | Min Coverage | Critical Files |
|------|--------------|----------------|
| 1.0  | 90%          | migrationService, storage services |
| 2.0  | 80%          | RichTextEditor, MomentEditor, MomentsContext |
| 3.0  | 85%          | screenRecording, ScreenRecordingContext |
| 4.0  | 80%          | FoldersContext, folderStorage, tagService |
| 5.0  | 80%          | ffmpeg, videoPreview |
| 6.0  | 85%          | export, markdown utils |
| 7.0  | 70%          | New UI components |
| 8.0  | 80%          | Settings, storageManager |
| 9.0  | 95%          | All critical flows |

---

## Continuous Integration (CI)

**GitHub Actions workflow (recommended):**
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: pnpm install
      - run: pnpm test --coverage
      - run: pnpm test:e2e
      - uses: codecov/codecov-action@v2
```

---

## When Tests Fail

1. **DO NOT skip tests** - Fix the failing test or the code
2. **DO NOT lower coverage requirements** - Write more tests instead
3. **DO NOT proceed to next task** - All tests must pass
4. **DO commit tests alongside feature code** - Tests are not optional

---

**Remember:** Tests are not a blocker to development - they ARE development. Write tests as you build features, not after.
