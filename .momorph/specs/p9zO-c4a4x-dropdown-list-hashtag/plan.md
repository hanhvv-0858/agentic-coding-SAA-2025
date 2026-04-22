# Implementation Plan: (see bundled parent plan)

**This screen's plan lives in the parent Viết Kudo spec directory**, because the hashtag picker ships as part of a coherent compose feature bundle:

➡️ [**../ihQ26W78P2-viet-kudo/plan.md**](../ihQ26W78P2-viet-kudo/plan.md)

The bundled plan covers all 3 compose-flow specs in one delivery:
- `ihQ26W78P2` Viết Kudo (parent modal)
- **`p9zO-c4a4x` Dropdown list hashtag** (this spec — compose-time picker)
- `OyDLDuSGEa` Addlink Box (link-insert dialog)

**Relevant sections for this picker**:
- Architecture Decisions → Frontend Approach → "Child overlays" subsection
- Project Structure → `src/components/kudos/HashtagPicker.tsx` + its test file
- Implementation Approach → **PR 3** owns this component (T-HP-COMPONENT-001, T-HP-WIRING-001, T-HP-TEST-001)
- Constitution Compliance → "Dropdown hashtag picker FRs/TRs" subsection

The picker has zero standalone migrations, zero new deps, zero new tokens, zero new icons — it ships as part of PR 3 alongside the parent's validation error state + image uploader + @mention wiring.
