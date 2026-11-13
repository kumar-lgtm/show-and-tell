# Independent voice prototype review

Date: 2026-11-04. Reviewed the voice prototype worktree only. No deployment, publication, commits, or changes to the parent's running servers.

Verdict: no unresolved defect observed in the reviewed paths after the fixes below. This is bounded automated Chromium QA, not approval of native OS permission dialogs or production hosted behavior.

## Findings resolved during review

1. **P1 — retained session audio could be replaced by dictation.** Reproduced with distinct payloads: fail talk-and-point transcription containing `controlled-qa-audio-1`, successfully dictate a separate comment containing `controlled-qa-audio-2`, then retry the original session. Before the fix, the retry uploaded audio-2. `toolbar/voice.js` now retains audio on each capture and stores talk-and-point captures by their original session ID. The exact-payload regression now passes.
2. **P1 — incomplete provider timing could remove spoken words.** `server/voice.js` formerly dropped malformed timed segments while retaining a nonempty partial segment list, which the editor preferred over the complete text. The server owner now preserves full text in one uncertain segment whenever timed text is incomplete; invalid or incomplete word arrays degrade precision instead of replacing text. The dedicated normalizer regressions pass.
3. **P1 — discard/reviewer change during save could corrupt save state.** Source review found the save loop rereading mutable global `session` while discard and reviewer changes could replace it. The UI owner now snapshots the save draft, disables destructive editing during save, guards programmatic discard, resets `saving` in `finally`, and persists using the original draft's reviewer. The pending-save test changes the reviewer to Ben while saving Ana's draft and confirms the note and saved draft remain Ana's.
4. **Dictation integration checked after UI corrections.** The capture event now distinguishes dictation from full sessions so native comment input stays mounted. Pointer-down captures the insertion selection. Caret insertion, typing during transcription, failed-transcription retry, and original comment preservation pass. The test waits for Agentation's existing 50ms popup entrance focus timer before moving the caret.

Project/reviewer draft scope is intentional for a voice session that may retain multiple page contexts. The recovery test restores a `/` draft while viewing `/other`, confirms original-page provenance and saving to `/`, and confirms another reviewer does not inherit the draft.

## Automated evidence

- Build: `pnpm --config.verify-deps-before-run=false build` passed. The final UI owner build was 692249 bytes.
- `node --test --no-warnings test/voice-server.test.mjs test/voice-model.test.mjs test/voice-format.test.mjs`: **35 passed, 0 failed, 0 skipped**. Required loopback permission for the isolated HTTP test. An earlier restricted run had 34 passes and one environment-only `listen EPERM`; the permitted rerun passed all 35.
- Opt-in `test/voice-browser.test.mjs`: **18 passed, 0 failed, 0 skipped**, 5.67 seconds. This is 17 behavior cases plus the parent test. The browser fixture uses a temporary isolated store and its own ephemeral loopback server.
- Default `node --test --no-warnings test/voice-browser.test.mjs`: **1 skipped**, no browser/server started.
- The browser suite collects runtime exceptions and finished with none.

Reproduce browser QA (needs Playwright installed somewhere on the machine):

```sh
AGENTATION_KIT_BROWSER_TESTS=1 \
AGENTATION_KIT_PLAYWRIGHT=/path/to/node_modules/playwright \
node --test --no-warnings test/voice-browser.test.mjs
```

The 17 browser behavior cases cover microphone denial; the legacy hosted configuration alias; Point suppression of host action and native Agentation popup; Interact passthrough without retargeting; Escape exclusion for input fields and return to General; denied and wrong-tab screenshot fallback with working regions; successful verified-tab region screenshot and saved metadata; session transcription retry; cancelled microphone permission resolved late; discarded transcription resolved late; pending-save immutable draft/reviewer state; edit/split/reassign/delete and partial-save retry with stable IDs; 320/390 controls; dictation at the saved caret; preserving typing during transcription; independent audio ownership; failed dictation retry; original page/reviewer draft recovery. The test count groups related behavior as described in its source.

The positive screenshot case uses an explicitly controlled `canvas.captureStream` with a matching capture handle. It captures a 190x80 JPEG while the stream is red, changes the stream to blue, confirms the saved crop remains red and below 44000 characters, and confirms the exact image and geometry survive annotation persistence. This proves the crop and serialization path under controlled browser APIs; it does not exercise the real OS screen picker. The legacy-global compatibility case rewrites only the local loader configuration global to `__SHAREKIT_AGENTATION__`, confirms the kit-specific global is absent, and proves mount, recording, transcript review and persistence through the same isolated local backend. It is not a live hosted deployment test.

## Visual evidence and limits

`voice-editor-320.png` and `voice-editor-390.png` were inspected full size. The editor fits each viewport, source-page provenance is visible, text is legible, and visible buttons meet the 44px size check. The footer wraps at 320px and remains inside the viewport.

Microphone and display permission APIs in this suite are controlled test doubles. The parent independently owns the real MediaRecorder/local Whisper end-to-end check. This reviewer did not test native permission prompts, live Cloudflare/Workers AI, a real OS screen-sharing picker, or real Safari/iOS. Hosted authorization, atomic budget, duration validation, and output formatting are covered by local unit/API tests, not live Cloudflare inference. CLI/MCP voice presentation is covered by the shared formatter tests; no live MCP client session was exercised here.

Write lane: only `test/voice-browser.test.mjs` plus this report and screenshots under this independent QA directory. Parent owns product fixes and commits.
