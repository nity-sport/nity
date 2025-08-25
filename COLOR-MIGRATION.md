# Color System Migration Guide

## Overview
Este documento guia a migração do sistema de cores antigo para o novo sistema de design.

## Novo Sistema de Cores

### Error/Red Colors
```css
--error-900: #410005;  /* Muito escuro */
--error-800: #650911;
--error-700: #852129;
--error-600: #A5363F;  /* Padrão para erros */
--error-500: #C54C56;
--error-400: #E6636E;
--error-300: #FF818B;
--error-200: #FFADB4;
--error-100: #FFEBED;  /* Muito claro */
```

### Blue Colors
```css
--blue-1: #1F4042;     /* Azul escuro */
--blue-2: #023E8C;     /* Primary dark */
--blue-3: #0659A7;     /* Azul médio */
--blue-4: #379AD8;     /* Primary light */
```

### Green Colors
```css
--green-1: #0F4905;    /* Verde escuro */
--green-2: #59A64E;    /* Verde médio */
--green-3: #C0D908;    /* Verde claro */
```

### Yellow Colors
```css
--yellow-1: #493805;   /* Amarelo escuro */
--yellow-2: #A77F06;   /* Amarelo médio */
--yellow-3: #F2B705;   /* Amarelo brilhante */
```

### Gray/Neutral Colors
```css
--black: #000000;
--gray-900: #212529;   /* Muito escuro */
--gray-800: #343A40;
--gray-700: #495057;
--gray-600: #6C757D;
--gray-500: #ADB5BD;   /* Médio */
--gray-400: #CED4DA;
--gray-300: #DEE2E6;
--gray-200: #E9ECEF;
--gray-100: #F8F9FA;   /* Muito claro */
--white: #FFFFFF;
```

## Mapeamento de Cores Antigas → Novas

| Cor Antiga | Nova Equivalente | Observações |
|------------|------------------|-------------|
| `--color-primary-dark` | `--blue-2` | ✅ Exato |
| `--color-primary-light` | `--blue-4` | ✅ Exato |
| `--color-background` | `--gray-100` | ✅ Exato |
| `--color-surface` | `--white` | ✅ Exato |
| `--color-surface-dark` | `--gray-900` | ✅ Exato |
| `--color-surface-mid` | `--gray-700` | ✅ Exato |
| `--color-muted` | `--gray-500` | ✅ Exato |
| `--color-border` | `--gray-400` | ✅ Exato |
| `--color-border-light` | `--gray-300` | ✅ Exato |
| `--color-error` | `--error-600` | ⚠️ Mudou de #bc271b para #A5363F |
| `--color-success` | `--green-1` | ⚠️ Mudou de #0c6600 para #0F4905 |
| `--color-warning` | `--yellow-3` | ⚠️ CORRIGIDO: era azul (#6eb8fe), agora é amarelo (#F2B705) |
| `--color-surface-alt` | `--gray-800` | ✅ Exato |

## Como Migrar Arquivos

### Passo 1: Substitua cores de Gray
```css
/* Antes */
color: var(--color-background);
border-color: var(--color-border);

/* Depois */
color: var(--gray-100);
border-color: var(--gray-400);
```

### Passo 2: Substitua cores de Blue
```css
/* Antes */
background: var(--color-primary-dark);

/* Depois */
background: var(--blue-2);
```

### Passo 3: Use nova escala para estados
```css
/* Error states - use diferentes tons conforme intensidade */
.error-text { color: var(--error-600); }
.error-bg-light { background: var(--error-100); }
.error-bg-strong { background: var(--error-700); }

/* Success states */
.success-text { color: var(--green-2); }
.success-bg { background: var(--green-1); }

/* Warning states */
.warning-text { color: var(--yellow-2); }
.warning-bg { background: var(--yellow-1); }
```

## Status da Migração

### ✅ Completo
- [ ] Nenhum arquivo migrado ainda

### 🔄 Em Progresso
- [ ] theme-config.css (sistema híbrido implementado)

### ⏳ Pendente (38 arquivos)
- [ ] components/cards/ExperienceCard.module.css
- [ ] components/sections/ExperiencesSection/ExperiencesSection.module.css
- [ ] components/sections/Hero/Hero.module.css
- [ ] components/sections/Hero/HeroSearchBar.module.css
- [ ] components/sections/TrainingCentersSection/TrainingCenterSection.module.css
- [ ] components/sections/TrainingCentersSection/TrainingCenterCard.module.css
- [ ] components/layout/Header.module.css
- [ ] components/sections/AboutSection/AboutSection.module.css
- [ ] styles/globals.css
- [ ] pages/settings/Settings.module.css
- [ ] pages/owner/dashboard.module.css
- [ ] pages/Auth/Auth.module.css
- [ ] pages/admin/*.module.css (7 arquivos)
- [ ] components/layout/Footer.module.css
- [ ] components/forms/**/*.module.css (19 arquivos)

## Principais Mudanças Visuais

1. **Warning color corrigida**: Era azul (#6eb8fe), agora é amarelo (#F2B705)
2. **Error color atualizada**: De #bc271b para #A5363F (mais consistente)
3. **Success color atualizada**: De #0c6600 para #0F4905 (mais escuro)
4. **Sistema de tons**: Agora temos 9 tons de error e escalas para todas as cores

## Próximos Passos

1. Migrar arquivos core primeiro (Header, Footer, globals.css)
2. Depois componentes principais (Hero, Cards)
3. Por último, formulários e páginas admin
4. Remover cores legadas após migração completa