# Visual Density

> Scope: cross-cutting. Applies to any language or stack in the project.
>
> The router files this under Surgical, which describes this file and not the rule. The core rule is already recited on every Phase CODE entry, as **Vertical Density** in the `WorkChecklist`, and verified at Phase TEST. What loads on demand is the depth below: the cases, the counter-examples, and the per-language notes.

Code gets read far more often than it gets written. **Visual density** (how the eye scans through code) is about grouping what belongs together and separating what is distinct, without needing comments to guide the reader.

## Fundamental concepts

| Concept                   | What it is                                                                                                                                        |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| **blank line**            | Separator between cohesive groups. One only, never two in a row                                                                                   |
| **tight pair**            | Two adjacent lines with a direct relationship and no blank between them. Breathing room goes before or after the pair, never inside               |
| **atomic trio**           | Three consecutive, simple, homogeneous declarations (`const` / `let`) kept together. Prefer the trio over `2+1` since the split creates an orphan |
| **chained semantic pair** | Tight pair where the last line uses, **directly**, the value declared on the line above                                                           |
| **explanatory return**    | A particular case of tight pair: `const X = …` on a single line, followed by `return X` with no blank between them                                |
| **multi-line block**      | An object literal, array literal, or statement broken across multiple lines. Requires a blank line after it to isolate the block                  |
| **fragments → assembly**  | A final line that stitches together multiple earlier fragments. A distinct phase, with a blank line before the assembly                           |
| **orphan line**           | An isolated declaration sitting between blank lines, which belongs to the group above. Creates a pause for no reason                              |
| **declaration + guard**   | A variable followed by the `if` that validates it. Breathing room goes after the pair, not inside it                                              |
| **wall of code**          | Four or more related lines without breathing room. Always break into `2+2`                                                                        |
| **method phase**          | A logical step (prepare, transform, persist, respond). Each phase earns its own breathing room                                                    |
| **column alignment**      | Extra spaces used to align `=` or `:` vertically. An anti-pattern: fragile to renames, generates noisy diffs                                      |

## Quick reference

| Rule                                    | Description                                                                                                                                                  |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Default group: 2 lines**              | Related lines stay together. The natural separation is by pair                                                                                               |
| **Trio tolerated**                      | Three consecutive simple homogeneous declarations (`const`, `let`) can stay together when splitting would create a lone line                                 |
| **4+ breaks into 2+2**                  | From four related lines onward, always split to avoid the wall                                                                                               |
| **Explanatory return is a tight pair**  | `const X = …; return X;` is a pair with no blank between them, regardless of how many steps come above                                                       |
| **Separated return**                    | A blank line goes before the `return` only when the line immediately above is multi-line, a side effect, or when the value was created several steps earlier |
| **Chained semantic pair**               | When the final line depends **directly** on the line above it (e.g. `label = f(cityLine)`), they stay tight                                                  |
| **Fragments → assembly**                | A final line that stitches multiple fragments is a distinct phase, with a blank line before it                                                               |
| **Declaration + guard = pair**          | A variable and the `if` validating it stay together. Breathing room comes after the pair                                                                     |
| **Multi-line takes a blank line after** | An object literal, array literal, or statement broken across multiple lines requires a blank line after it                                                   |
| **Consecutive ifs with `{}` blocks**    | Always a blank line between them. Exception: a trio of one-line guards stays tight                                                                           |
| **No column alignment**                 | A single space around `=` or `:`. No artificial spacing                                                                                                      |
| **Long strings**                        | Extract fragments into named variables before assembling the final result                                                                                    |
| **Never a double blank**                | Exactly one blank line between groups. Two is noise                                                                                                          |

## The core rule

**Small groups separated by a single blank line.** Two is the natural size. Three is allowed when splitting would create a lone line. From four onward, always break. Never two blank lines in a row: that is noise, not breathing room.

## Explanatory return: a tight pair

A named `const` directly above the `return` explains the returned value. Whenever the line immediately above is that `const` on a single line and the `return` returns exactly that variable, the two form a pair with no blank between them. **Regardless of how many steps come above**: the blank line separates the pair from what comes before, but never fragments the pair itself.

<details>
<summary>❌ Bad: a blank line fragments the pair</summary>

```js
function mapErrorToStatus(error) {
  const status = errorStatusByCode[error.code] ?? 500;

  return status;
}
```

The blank line isolates the `return` as if it were a closing paragraph, but there is no paragraph above, only a single line. The eye searches for the block that was being closed and finds nothing.

</details>

<details>
<summary>✅ Good: tight pair</summary>

```js
function mapErrorToStatus(error) {
  const status = errorStatusByCode[error.code] ?? 500;
  return status;
}
```

Two lines that read as a single unit: "status comes from the table, return it."

</details>

## Tight return vs separated return

The rule is simple: the `return` stays **tight** against the line immediately above **only when that line is the `const` that names the returned value** (the explanatory return) and that `const` fits on a single line.

In every other case, a blank line goes before the `return`:

- the line above is **multi-line** (an object or a statement broken across multiple lines);
- the line above is a **side effect** (`await`, a function with no return value) that does not name the value;
- the returned value was created **several steps earlier**, with no direct pair above the return.

<details>
<summary>❌ Bad: fragmented return when the line above is single-line and names the value</summary>

```js
function formatOrderDate(isoString, locale = "pt-BR") {
  const parsedDate = new Date(isoString);
  const formatter = new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const formattedDate = formatter.format(parsedDate);

  return formattedDate;
}
```

`formatter` is multi-line and requires a blank line **after** it. The blank line was placed in the wrong spot: before the `return`, fragmenting the explanatory return pair `formattedDate` + `return formattedDate`.

</details>

<details>
<summary>✅ Good: multi-line isolated, explanatory return tight</summary>

```js
function formatOrderDate(isoString, locale = "pt-BR") {
  const parsedDate = new Date(isoString);
  const formatter = new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const formattedDate = formatter.format(parsedDate);
  return formattedDate;
}
```

</details>

<details>
<summary>✅ Good: return with a blank line when the value is a multi-line object</summary>

```js
function buildOrderResponse(order, requestId) {
  const data = {
    id: order.id,
    total: order.total,
    items: order.items,
  };

  return { data, requestId };
}
```

`data` is a multi-line object. The blank line before the `return` isolates the large block from the final envelope.

</details>

<details>
<summary>✅ Good: return with a blank line when the value was created several steps earlier</summary>

```js
async function registerUser(input) {
  const user = await userRepository.create(input);

  const token = generateToken(user.id);
  await sendWelcomeEmail(input.email, token);

  return user;
}
```

`return user` does not form a pair with `await sendWelcomeEmail` (a side effect). `user` was created several lines above. The blank line before the `return` marks the closing.

</details>

## An orphan line is worse than a tight trio

Three consecutive simple declarations form a cohesive group. Splitting them into `2+1` leaves the last line stranded between blank lines, with no context: the reader pauses to find the reason for the split and discovers it was only another constant. Keep the three together. Only break into `2+2` when there are four or more.

<details>
<summary>❌ Bad: orphan line between blank lines</summary>

```js
const MINIMUM_DRIVING_AGE = 18;
const ORDER_STATUS_APPROVED = 2;

const ONE_DAY_MS = 86_400_000;
```

The lone line looks like a separate step but is only another constant. The reader pauses for a reason that does not exist.

</details>

<details>
<summary>✅ Good: tight trio</summary>

```js
const MINIMUM_DRIVING_AGE = 18;
const ORDER_STATUS_APPROVED = 2;
const ONE_DAY_MS = 86_400_000;
```

</details>

<details>
<summary>✅ Good: four declarations become 2+2</summary>

```js
const MINIMUM_DRIVING_AGE = 18;
const ORDER_STATUS_APPROVED = 2;

const ONE_DAY_MS = 86_400_000;
const MAX_RETRY_ATTEMPTS = 3;
```

</details>

## Chained semantic pair

When the final line **depends** on the one above (using the freshly declared value), the two form a chained semantic pair. The natural break goes before the pair, not between the value and its direct consumer.

<details>
<summary>❌ Bad: direct dependency broken apart</summary>

```csharp
public static string BuildShippingLabel(Order order)
{
    var fullName = $"{order.Customer.FirstName} {order.Customer.LastName}";
    var addressLine = $"{order.Address.Street}, {order.Address.Number}";

    var cityLine = $"{order.Address.City} - {order.Address.State}, {order.Address.ZipCode}";

    var label = $"{fullName}\n{addressLine}\n{cityLine}\nOrder #{order.Id}";

    return label;
}
```

`cityLine` is consumed immediately by `label`. Splitting them with a blank line hides the relationship.

</details>

<details>
<summary>✅ Good: tight semantic pair</summary>

```csharp
public static string BuildShippingLabel(Order order)
{
    var fullName = $"{order.Customer.FirstName} {order.Customer.LastName}";
    var addressLine = $"{order.Address.Street}, {order.Address.Number}";

    var cityLine = $"{order.Address.City} - {order.Address.State}, {order.Address.ZipCode}";
    var label = $"{fullName}\n{addressLine}\n{cityLine}\nOrder #{order.Id}";
    return label;
}
```

Two tight pairs: `cityLine + label` (chained semantic pair) and `label + return label` (explanatory return). The reader sees "name, address / city, label, return."

</details>

## Fragments → assembly: blank line before the consumer

When **two or more fragments** are prepared and a final line **consumes several fragments** (not only the last one), treat the assembly as a distinct phase, with a blank line before it. This is the classic "prepare the parts → assemble the result" case, different from the chained semantic pair (where the final line depends **directly** on the line above and therefore stays tight).

Quick heuristic:

- The final line uses **only the freshly declared value** above? Chained semantic pair, stays tight.
- The final line **stitches multiple fragments** declared on different lines? Fragments → assembly, blank line before.

<details>
<summary>❌ Bad: fragments and assembly glued as if they were a homogeneous trio</summary>

```js
function buildDeliveryMessage(user, order) {
  const fullName = `${user.firstName} ${user.lastName}`;
  const address = `${order.address.street}, ${order.address.city} - ${order.address.state}`;
  const deliveryMessage = `Hello ${fullName}, your order #${order.id} has been confirmed and will be delivered to ${address} within ${order.deliveryDays} business days.`;
  return deliveryMessage;
}
```

`deliveryMessage` consumes `fullName` _and_ `address` _and_ `order.id` _and_ `order.deliveryDays`. It is not a direct pair with `address`: it is the assembly phase. Glued as a trio, the phases become invisible.

</details>

<details>
<summary>✅ Good: fragments as a pair, assembly isolated, explanatory return tight</summary>

```js
function buildDeliveryMessage(user, order) {
  const fullName = `${user.firstName} ${user.lastName}`;
  const address = `${order.address.street}, ${order.address.city} - ${order.address.state}`;

  const deliveryMessage = `Hello ${fullName}, your order #${order.id} has been confirmed and will be delivered to ${address} within ${order.deliveryDays} business days.`;
  return deliveryMessage;
}
```

Two visible phases: "prepare fragments" (pair) and "assemble + deliver" (tight explanatory return).

</details>

## Declaration + guard = one group

A variable followed by the `if` that validates it forms a semantic pair **when the guard fits on a single line**: `if (...) return;`, `if (...) throw ...;`. In that case the blank line comes **after** the pair, not inside it.

When the guard is written as a **`{ }` block** (any number of physical lines, even with a single statement inside), the `if` becomes its own phase, because the block already carries its own visual weight. The multi-line rule applies: a blank line **before** the block. The criterion is visual, not semantic.

<details>
<summary>✅ Good: inline guard (one line), tight pair with the declaration</summary>

```js
const product = await fetchProduct(id);
if (!product) throw new NotFoundError();

const result = process(product);
```

</details>

<details>
<summary>✅ Good: block guard, own phase with a blank line before it</summary>

```js
const handler = eventHandlers[eventType];

if (!handler) {
  logUnhandledEventType(eventType);
  return;
}

const eventPayload = event.data;
```

</details>

<details>
<summary>✅ Good: block guard even with a single instruction takes a blank line before</summary>

```js
const response = await requestFn();

if (response.status !== 429) {
  return response;
}

const delayMs = Math.pow(2, attempt) * 1000;
```

The block takes up three physical lines: its own visual weight. Inline would be tight, but as a block, blank line before.

</details>

## Method phases

Methods with multiple steps (fetch, transform, persist, respond) should make each phase visible. Each phase can have up to two lines before a blank, or three when they are simple declarations of the same type.

## Multi-line: blank line after the block

When an object literal, array literal, or statement breaks across multiple lines, the block already takes its own visual space. Place a blank line **after** it to isolate the large block from the next step. Without breathing room, the reader cannot see where the block ends and the next thing begins.

<details>
<summary>❌ Bad: multi-line object glued to the next statement</summary>

```js
async function createSession(user) {
  const claims = {
    sub: user.id,
    email: user.email,
    roles: user.roles,
    issuedAt: Date.now(),
  };
  const token = await signJwt(claims);
  return token;
}
```

</details>

<details>
<summary>✅ Good: blank line after the object isolates the block</summary>

```js
async function createSession(user) {
  const claims = {
    sub: user.id,
    email: user.email,
    roles: user.roles,
    issuedAt: Date.now(),
  };

  const token = await signJwt(claims);
  return token;
}
```

</details>

## Consecutive ifs: braced blocks need breathing room

Two consecutive `if` statements with **multi-line blocks** (`{ ... }`) glued together form a wall: the eye cannot distinguish where one block ends and the other begins. Always insert a blank line between them.

**Exception:** one-line guards (short early returns) form a homogeneous trio and stay tight. The atomic trio rule applies.

<details>
<summary>❌ Bad: two `{}` blocks glued together</summary>

```js
function processOrder(order) {
  if (order.status === "pending") {
    notifyCustomer(order);
    scheduleReview(order);
  }
  if (order.total > 1_000) {
    flagForAudit(order);
    notifyManager(order);
  }
}
```

</details>

<details>
<summary>✅ Good: blank line between the blocks</summary>

```js
function processOrder(order) {
  if (order.status === "pending") {
    notifyCustomer(order);
    scheduleReview(order);
  }

  if (order.total > 1_000) {
    flagForAudit(order);
    notifyManager(order);
  }
}
```

</details>

<details>
<summary>✅ Good: one-line guards stay tight (atomic trio)</summary>

```js
function validateInput(input) {
  if (!input) throw new ValidationError("Input required");
  if (!input.email) throw new ValidationError("Email required");
  if (!input.password) throw new ValidationError("Password required");

  return input;
}
```

</details>

## No column alignment

Do not align `=`, `:`, or values vertically with multiple spaces. Always use **a single space**. Artificial alignment breaks with any rename, generates noisy diffs, and trains the eye to look for columns that disappear at the first refactor.

<details>
<summary>❌ Bad: extra spaces to align columns</summary>

```js
const userName = "alice";
const userEmail = "alice@example.com";
const userRole = "admin";
const lastLoginAt = new Date();
```

</details>

<details>
<summary>✅ Good: single space, no extra padding</summary>

```js
const userName = "alice";
const userEmail = "alice@example.com";
const userRole = "admin";
const lastLoginAt = new Date();
```

</details>

## Long strings

A long string crammed into a `return` hides the parts that compose it. Extract fragments into named variables before assembling the final result: the final template stays readable and the pieces gain semantics.

---

## By language

The same principles, with idiomatic examples per stack, live in the upstream `thiagocajadev/code-style` repository under `docs/<language>/conventions/visual-density.md` (JavaScript, C#, CSS, SQL).
