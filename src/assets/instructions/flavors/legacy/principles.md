# Legacy Architecture Principles

> Inherits Security, Reliability, Narrative from code-style.md.

## Pipeline

```
Request → UI (Event) → Service → Repository → UI (Response)
```

- **UI (Event)**: Entry point: user interaction creates Request.
- **Service (BLL)**: Business orchestration. Receives clean Data/DTOs.
- **Repository (DAL)**: Persistence + raw SQL/PROCS only. Returns entities/DataTables.
- **UI (Response)**: Service delivers pre-mapped DTOs to Passive View.

## Passive View (Presenter Pattern)

UI file (.vb, .cs, .java) = Mute Shell. Displays only what Service provides.

- **No Business Logic in UI**: Never implement calculations in event handlers (`button_Click`).
- **Mapped DTOs**: Service returns DTO/ViewModel pre-formatted. UI only does `grid.DataSource = result.value`.
- **No Raw DataSets**: Never pass `DataSet`/`DataTable` to UI. Map inside Service/BLL.

## Service Responsibility (Anti-God-Object)

- **Narrative**: Read the code like a story. High-level intent at the top, implementation details below. Entry point first, orchestration above implementation. Each method orchestrates OR implements, never both.
- **Delegation**: Specific Service classes per feature area (Vertical Slice approach) to avoid monolithic files.

## SQL Hardening

- **100% Parameterization**: Never string concatenation for SQL. Use DB-specific parameter objects.
- **Encapsulated Repositories**: All SQL/Procs in Repository, never leaked to Service or UI.
- **Vertical Formatting**: Follow SQL Strategy from staff-dna.md.
