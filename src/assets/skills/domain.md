# Domain Modeling: DDD-Lite

<ruleset name="DomainModeling">

> Load in **Phase CODE** when modeling new aggregates, defining entities / value objects, or working in a use case where the business language is the leverage point.

---

## Vocabulary (Ubiquitous Language)

- **Entity**: identity matters; lifecycle persists. `Order(id, ...)`. Two entities with the same fields but different ids are distinct.
- **Value Object (VO)**: identity does NOT matter; equality by value. `Money(100, 'USD')`, `EmailAddress('a@b.com')`. Always immutable.
- **Aggregate**: cluster of entities + VOs treated as one consistency boundary. One **Aggregate Root** (entity) is the only public entry; collaborators reference by id, never by direct nested access.
- **Bounded Context**: a section of the domain where a term has one consistent meaning. `Customer` in Sales ≠ `Customer` in Billing, different contexts, different shapes.
- **Anti-Corruption Layer (ACL)**: translation boundary between two contexts (or domain ↔ external system). Keeps each side's model clean.

---

## Modeling Rules

| Rule                                           | Applies when                                                 |
| :--------------------------------------------- | :----------------------------------------------------------- |
| Entities have an explicit id                   | Always: never rely on memory address or DB row id alone      |
| VOs are immutable + equal-by-value             | Money, address, email, date range, score, percentage         |
| Operations on VOs return new VOs               | `money.add(other)` returns a new `Money`, never mutates      |
| Invariants live in the entity, not the service | `Order.cancel()` checks status; service orchestrates         |
| Aggregate root is the only entry point         | Repository returns the root; nested entities are not exposed |
| Cross-aggregate reference by id only           | `Order` has `customerId`, not the full `Customer` object     |
| One aggregate per transaction                  | If a write spans two aggregates, the boundary is wrong       |

---

## Ubiquitous Language Discipline

- **Code mirrors the business term.** If product says "fulfillment", code says `Fulfillment`. Not `OrderProcessing`, not `Delivery`.
- **One term, one meaning per bounded context.** Cross-context translation happens at the boundary (ACL / mapper).
- **Reject generic terms in domain code.** No `Manager`, `Service`, `Helper`, `Processor` for domain logic. Name the operation: `cancelOrder`, `reserveStock`, not `OrderManager.handle`.
- **Verbs match business actions.** `placeOrder` not `createOrder`; `shipFulfillment` not `updateStatus`.

---

## Anti-Patterns

- **Anemic domain model**: entities reduced to data bags; behavior leaked to services. Pull invariants back into entities.
- **Database-driven design**: starting from tables and reverse-engineering the domain. Start from business operations and let the schema follow.
- **Cross-aggregate transactions**: if a write spans two aggregates, the boundary is wrong: re-model.
- **Generic naming**: `EntityManager`, `DataService`, `OrderHelper`. Placeholder names indicate missing domain insight.
- **Sharing `Customer` across all contexts**: same name, different needs in Sales vs Support vs Billing → split per context.

---

## Light vs Heavy DDD

This skill is **DDD-Lite**: aggregates, entities, VOs, ubiquitous language, bounded contexts, ACL. It deliberately omits Domain Events, CQRS, Event Sourcing, Sagas. Those belong to a heavier skill if and when the system warrants them. Don't introduce them as ceremony for small bounded contexts.

</ruleset>
