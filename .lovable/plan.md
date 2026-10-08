# DataCampo Dinâmico — Etapa 1 (MVP): Cenário + Perguntas dinâmicas + Prévia

## 1. O que já existe e será reaproveitado

| Item atual | Situação | Reaproveitamento |
|---|---|---|
| Login e-mail/senha, olhinho, recuperação de senha | Funciona | Mantido sem mudanças |
| `profiles` + `user_roles` (admin, pesquisador) + `has_role` | Funciona | Mantido. Admin = professor/coordenação; pesquisador = aluno em campo |
| Proteção de rotas (`_authenticated`) e `AdminLayout` | Funciona | Mantido |
| Tabela `surveys` | Só dados básicos | Passa a representar o **Cenário** (sem tabela nova) |
| Tabela `questions` (tipo, texto, `options` jsonb, obrigatória, ordem) | Existe, sem tela | Base do **gerador de perguntas dinâmicas** |
| Enum `question_type` (selecao_unica, multipla_escolha, texto_livre, escala_5, gps) | Existe | Reaproveitado integralmente |
| `survey_assignments`, `responses`, `response_answers` | Existem, sem tela | Intocados nesta etapa (usados nas etapas de coleta) |
| Página Pesquisas (lista + modal de criação) | Funciona | Evolui para lista de Cenários com link para o editor |
| Página Pesquisadores (lista + ativar/desativar) | Funciona | Mantida |

## 2. Lacunas para o DataCampo Dinâmico

- **Cenários**: `surveys` não tem campos pedagógicos (tema, turma/série, objetivo de aprendizagem, local de aplicação). `client_name` é obrigatório e não faz sentido em contexto escolar.
- **Perguntas dinâmicas**: não há tela para criar, editar, reordenar ou excluir perguntas.
- **Opções**: `options` jsonb existe, mas sem formato definido nem editor.
- **Pesquisadores (alunos) nas perguntas**: hoje pesquisador não consegue ler `questions` (só admin) — será necessário na etapa de coleta, não agora.
- **Coleta de campo, GPS, offline, mapa, resultados**: fora do escopo desta etapa.
- **Perfis**: os nomes "admin/pesquisador" ficam no banco; só os rótulos na tela mudam se desejado (ex.: "Professor(a)", "Aluno(a) pesquisador(a)") — decidir depois.
- **Marca**: textos "Goulart's Data Base" a trocar por "DataCampo Dinâmico — E.E. Profª Maria De Lourdes Toledo Areias".

## 3. Proposta da Etapa 1 (MVP)

Fluxo do admin:

```text
Pesquisas/Cenários (lista)
   -> Novo cenário (modal: título, tema, turma, objetivo, datas, status)
   -> Editor do cenário  /pesquisas/$id
        [Aba Perguntas]  adicionar / editar / reordenar / excluir
        [Aba Prévia]     questionário renderizado como o aluno verá (sem salvar respostas)
```

Regras do editor:
- Tipos suportados: Seleção única, Múltipla escolha, Texto livre, Escala 1–5, Localização GPS (na prévia o GPS aparece só como campo informativo, sem capturar).
- Opções editáveis apenas para seleção única/múltipla (mínimo 2, sem duplicadas).
- Reordenação com botões subir/descer (sem biblioteca de arrastar).
- Cenário com status "ativa" ou "concluida" que já tenha respostas: perguntas ficam somente leitura (evita corromper dados coletados).
- Salvamento por pergunta (cada ação grava imediatamente).

## 4. Arquivos da Etapa 1

Criar:
- `src/routes/_authenticated/pesquisas.$surveyId.tsx` — editor do cenário (abas Perguntas / Prévia)
- `src/components/survey/question-editor.tsx` — formulário de uma pergunta (tipo, texto, obrigatória, opções)
- `src/components/survey/question-list.tsx` — lista ordenável com ações
- `src/components/survey/survey-preview.tsx` — renderização do questionário (reutilizável depois na coleta)
- `src/lib/survey-schema.ts` — tipos e validação zod das perguntas/opções (formato único do `options`)
- `src/lib/questions.ts` — funções de leitura/escrita de perguntas

Alterar:
- `src/routes/_authenticated/pesquisas.tsx` — novos campos do cenário, `client_name` opcional, link "Editar perguntas"
- `src/lib/admin.ts` — `createSurvey`/`getSurvey`/`updateSurvey` com os campos novos
- `src/components/app-sidebar.tsx` — rótulo "Cenários" e nova marca
- `src/routes/index.tsx`, `src/routes/_authenticated/dashboard.tsx` — apenas textos de marca/escola e títulos de página
- `AGENTS.md` — regra do formato de `options` e de surveys = cenários

## 5. Alterações de banco (uma migration, só aditiva)

- `surveys`: adicionar colunas opcionais `theme text`, `school_class text`, `learning_goal text`, `location_name text`.
- `surveys.client_name`: definir `DEFAULT ''` (permite criar cenário sem cliente; nenhuma linha antiga muda).
- `questions`: adicionar `help_text text` opcional; índice único `(survey_id, order_index)` **não** será criado agora (reordenação troca posições em dois passos) — usar índice simples `(survey_id, order_index)`.
- `questions` e `surveys`: gatilho `updated_at` em `questions` (coluna nova `updated_at timestamptz default now()`).
- Gatilho de validação em `questions`: para seleção única/múltipla exige `options` como lista com 2+ itens.
- Sem mudança de RLS nesta etapa (admin já gerencia tudo). Política de leitura de perguntas para pesquisador atribuído fica para a etapa de coleta.

Formato de `options` (jsonb): `[{ "id": "uuid", "label": "Texto" }]` — o `id` estável permite renomear opção sem perder respostas futuras.

## 6. Compatibilidade com pesquisas existentes

- Nenhuma coluna removida, renomeada ou com tipo alterado; todas as novas são opcionais.
- Pesquisas antigas aparecem normalmente na lista; campos novos vazios mostram "—".
- `client_name` continua existindo e aparece como "Instituição/Parceiro (opcional)".
- Enums e tabelas de respostas intocados.
- Leitura de `options` tolerante: se vier lista de textos simples (formato antigo), é convertida na tela para `{id,label}`.
- Antes da migration: conferir quantas pesquisas/perguntas existem para validar o impacto (passo 1 da implementação).

## 7. Fora do escopo (próximas etapas)

Atribuição de alunos, coleta passo a passo, GPS real, offline, mapa, resultados e dashboard dinâmico.

Nada será implementado até a aprovação deste plano.