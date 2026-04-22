# Implementation Plan: (see bundled parent plan)

**This screen's plan lives in the parent Viết Kudo spec directory**, because the Addlink dialog ships as part of a coherent compose feature bundle:

➡️ [**../ihQ26W78P2-viet-kudo/plan.md**](../ihQ26W78P2-viet-kudo/plan.md)

The bundled plan covers all 3 compose-flow specs in one delivery:
- `ihQ26W78P2` Viết Kudo (parent modal)
- `p9zO-c4a4x` Dropdown list hashtag (compose-time picker)
- **`OyDLDuSGEa` Addlink Box** (this spec — link-insert dialog)

**Relevant sections for this dialog**:
- Architecture Decisions → Frontend Approach → "Nested modal (Addlink)" subsection
- Project Structure → `src/components/kudos/AddlinkDialog.tsx` + its test file
- Implementation Approach → **PR 4** owns this component (T-AL-COMPONENT-001, T-AL-TIPTAP-001, T-AL-OPEN-001, T-AL-TEST-001)
- Constitution Compliance → "Addlink Box FRs/TRs" subsection
- Risk Assessment → "Focus-trap edge cases" row (nested Addlink within Viết Kudo)

The Addlink dialog has zero standalone migrations, zero new deps, zero new tokens, zero new icons — it ships as part of PR 4 alongside the anonymous checkbox + motion-safe audit + axe-core sweep + SCREENFLOW flip.
