# SQL Style

<ruleset name="SQLStyle">

> Load in Phase CODE when writing, reviewing, or refactoring SQL.
> Formatting is owned by **SQLFluff**: enforce via CI, not review comments.
> For structural data access rules (pooling, transactions, indexes), see `.ai/skills/data-access.md`.

## Formatter-enforced (SQLFluff auto-fix)

> These rules run before the agent sees the code. No gate check needed.

| Rule                         | Coverage                                        |
| :--------------------------- | :---------------------------------------------- |
| `capitalisation.keywords`    | Keywords uppercase                              |
| `capitalisation.identifiers` | Identifiers snake_case lowercase (PostgreSQL)   |
| `layout.comma`               | Trailing commas                                 |
| `layout.operators`           | Trailing `AND` / `OR` (after operator)          |
| `references.qualification`   | Requires `table_name.column_name` qualification |

Activation recipe: `.ai/tooling/sqlfluff/.sqlfluff` + `.ai/tooling/README.md`.

## Vertical Style

One clause per line, content indented 2 spaces. Read top-to-bottom, no horizontal scroll.
Inline only when ≤ 3 fields AND ≤ 1 condition. Anything beyond goes vertical.

Never use short aliases (`u`, `o`, `t`). Always qualify with the full table name.

```sql
-- ✅ vertical
SELECT
  users.id,
  users.name,
  users.email
FROM
  users
WHERE
  users.is_active = TRUE AND
  users.created_at > '2024-01-01'
ORDER BY
  users.name ASC;

-- ✅ inline exception (≤ 3 fields, ≤ 1 condition)
SELECT users.id, users.name FROM users WHERE users.is_active = TRUE;
DELETE FROM logs WHERE logs.id = 123;
```

JOIN with a single ON condition, with ON on the same line as the table:

```sql
SELECT
  users.name,
  statuses.description
FROM
  users
JOIN
  statuses ON users.status_id = statuses.id
WHERE
  users.is_active = TRUE;
```

JOIN with multiple ON conditions, each on its own line, aligned after ON:

```sql
JOIN
  statuses
  ON users.status_id = statuses.id AND
     users.is_active = statuses.is_active AND
     statuses.type = 'DEFAULT'
```

## Visual Density

Clauses (`SELECT`, `FROM`, `WHERE`, `JOIN`) act as visual separators, so no blank lines between them.
Blank lines apply only where SQLFluff won't add them automatically:

**Function: one blank line between signature and body**

```sql
CREATE OR REPLACE FUNCTION get_football_team_by_id(team_id INT)
RETURNS TABLE (id INT, name TEXT) AS $$

BEGIN
  RETURN QUERY
  SELECT
    football_teams.id,
    football_teams.name
  FROM
    football_teams
  WHERE
    football_teams.id = team_id;
END;

$$ LANGUAGE plpgsql;
```

**CTEs: one blank line between each block**

```sql
WITH team_cte AS (
  SELECT
    football_teams.id,
    football_teams.name
  FROM
    football_teams
  WHERE
    football_teams.id = 1
),

active_players_cte AS (
  SELECT
    players.id,
    players.name,
    players.team_id
  FROM
    players
  WHERE
    players.is_active = TRUE
)

SELECT
  team_cte.name,
  active_players_cte.name
FROM
  team_cte
JOIN
  active_players_cte ON team_cte.id = active_players_cte.team_id;
```

**Function stages: one blank line between distinct logical blocks**

```sql
INSERT INTO active_orders
(
  order_id,
  customer_id,
  total_amount
)
SELECT
  orders.id,
  orders.customer_id,
  orders.total_amount
FROM
  orders
WHERE
  orders.status = 'active' AND
  orders.created_at >= start_date AND
  orders.created_at < end_date;

SELECT
  active_orders.order_id,
  customers.name AS customer_name
FROM
  active_orders
JOIN
  customers ON active_orders.customer_id = customers.id;
```

</ruleset>
