<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- surveys = Cenários escolares (DataCampo Dinâmico); questions.options jsonb usa [{id,label}] (ver src/lib/survey-schema.ts normalizeOptions para legado). Cenário com respostas e status != rascunho: perguntas somente leitura.
- Field collection submits only through the `submit_field_response` RPC (atomic, idempotent by client_submission_id); researchers have no INSERT/UPDATE/DELETE policies on responses/response_answers — keeps sent collections immutable and offline-retry safe.
- Researcher visibility of surveys/questions goes through `can_collect_survey()` (active + no assignments or assigned) — single source of truth for the assignment rule.
- Scenario assignments are replaced only via the admin-only RPC `set_survey_assignments` (atomic, unique per survey+researcher); profile is_active changes are guarded by a trigger so only admins can toggle it.
- CSV exports are built client-side from RLS-scoped reads (src/lib/export.ts), use ';' + UTF-8 BOM for Excel pt-BR, and never include latitude/longitude/accuracy.