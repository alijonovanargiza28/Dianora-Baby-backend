# DIANORA BABY backend implementation report

## Architecture and domain changes

The existing NestJS monorepo, Apollo code-first GraphQL, Mongoose schemas/models, JWT/password hashing, guards, `@Roles`, `@AuthMember`, ObjectId helpers, `$facet` pagination and upload/static-file architecture are retained. Dependencies and compiler options were not upgraded or replaced. `package.json` changes only correct the existing production and e2e paths; the Nest project root typo was corrected.

Reused/adapted modules: Member, Auth, Like, Follow, View, Comment, BoardArticle, Socket and the existing batch application. Article naming remains BoardArticle to preserve existing APIs and stored documents. Product favorites use LikeGroup.PRODUCT; article likes remain LikeGroup.ARTICLE. Comments and views similarly extend the existing group architecture.

New modules: SellerCode, Product, Brand, Review, Cart, Coupon, Address, Order, Payment, Delivery, Notification, Message, Event, FAQ, Support and Dashboard. OrderItems are embedded typed subdocuments within one parent Order, with seller-specific projections; no second order storage or separate admin application is introduced.

The old Property module is disconnected from the live API, while its source and schemas remain for migration/reference and legacy helper types. No Property document was deleted or automatically renamed. Legacy MEMBER/PROPERTY social records remain stored. Obsolete memberProperties is hidden from GraphQL and is not reused as a fake product count.

Banner storage and AdminAuditLog were omitted as optional domains. Hero may remain frontend-owned. No Home collection, separate marketplace Collection model, gift registry, birthday reward, real payment/courier SDK, Redis, queue, search server or new frontend was added.

## Important enums

- MemberType: USER, SELLER, ADMIN, CS. MemberStatus: ACTIVE, BLOCK, DELETE.
- SellerCodeStatus: ACTIVE, USED, EXPIRED, REVOKED.
- ProductStatus: ACTIVE, PAUSE, SOLD_OUT, DELETE.
- ProductType: CLOTHING, SHOES, TOYS, BABY_CARE, BOOKS, STROLLER, ACCESSORY, DEVELOPMENT_TOYS, FEEDING, BATH, OTHER.
- ProductCategory: SALE, TOP, BOTTOM, DRESS, OUTERWEAR, SET, SHOES, DEVELOPMENT_TOYS, PLUSH_TOYS, BOOKS, CREAM, LOTION, SHAMPOO, BATH, STROLLER, CAR_SEAT, BAG, HAT, SOCKS, BOTTLE, PACIFIER, TABLEWARE, OTHER.
- ProductCollection: NEWBORN, BABY, GIRLS, BOYS, MOM, MONTHLY_PHOTO, FIRST_BIRTHDAY, HOLIDAY.
- ProductSort: NEWEST, PRICE_LOW_TO_HIGH, PRICE_HIGH_TO_LOW, MOST_VIEWED, MOST_FAVORITED, BEST_SELLING, TRENDING, DISCOUNT.
- OrderStatus: PENDING, CONFIRMED, PREPARING, READY_FOR_DELIVERY, SHIPPED, DELIVERED, CANCELLED, REFUNDED.
- PaymentStatus: PENDING, PAID, FAILED, REFUNDED, CANCELLED.
- ReviewGroup: PRODUCT, SELLER. ContentStatus: ACTIVE, PAUSE, DELETE.
- DiscountType: PERCENT, FIXED. CouponStatus: ACTIVE, DISABLED.
- BoardArticleCategory: BABY_CARE, PARENTING, PRODUCT_GUIDE, NEWS, EVENTS, TIPS, FREE.
- EventType: NEWBORN, MONTHLY_PHOTO, BABY_100_DAYS, FIRST_BIRTHDAY, BIRTHDAY, BABY_SHOWER, HOLIDAY, SALE.
- FAQCategory: ORDER, PAYMENT, DELIVERY, RETURN_EXCHANGE, PRODUCT, SELLER, ACCOUNT, OTHER.
- SupportStatus: OPEN, IN_PROGRESS, RESOLVED, CLOSED.
- NotificationType: LIKE, COMMENT, FOLLOW, ORDER, DELIVERY, EVENT, MESSAGE, SYSTEM. Status: WAIT, READ. Filter: ALL, UNREAD, READ. Groups: PRODUCT, ARTICLE, MEMBER, ORDER, EVENT, MESSAGE; PROPERTY is retained only to read legacy notification records.

Exact enum/type/input definitions are exported in `graphql-schema.graphql`. Seller content remains one seller-entered string; no per-language product fields are added. Frontend UI languages remain UZ, KO, EN.

## Authorization and behavior

- Public: signup/login, active product/brand/seller/article/event/FAQ browsing and active reviews. Public product listings exclude deleted/paused products and inactive sellers. Nested public Member fields hide phone, address and full name.
- Authenticated accounts: own profile, cart, addresses, orders, payment actions, favorites, follows, comments, messages, notifications and support. JWT determines ownership; frontend IDs cannot choose the current account. Profile role/status/password updates are rejected.
- SELLER: create ACTIVE products with positive initial stock, update/manage only own products, own seller order portions, preparation stages, articles and dashboard. ADMIN-paused products require ADMIN reactivation. Variant identities are retained by color/size; variants with open order references cannot be removed.
- ADMIN: member role/status management, seller codes, product moderation, brands, orders, payments, coupons, events, FAQ, article/review/comment moderation, support assignment, delivery, system announcements and dashboard.
- CS: assigned tickets, claim unassigned tickets, limited ticket-linked order support, and centralized delivery operations. CS has no unrestricted ADMIN permissions. The support queue exposes only ticket ID, subject and creation time until assignment.
- Protected calls reload Member status/role from the database. BLOCK/DELETE and role changes invalidate protected capabilities even while an older JWT remains cryptographically valid.
- SellerCode and SELLER member creation share one transaction. Duplicate Member fields do not consume a seller code. Used/revoked/expired codes are rejected. No public request may create ADMIN or CS.
- Brand is separate from Seller. Public Seller profiles expose stored real product/follower/review/sales statistics; seller products are fetched using normal Product filters.
- Product filters combine category/type/collection/brand/seller/color/size/price/discount/status/name in MongoDB. Size/color use one `$elemMatch`. Price sorting/filtering uses the discounted price. `saleOnly: true` retrieves discounted products across categories for the Home sale section. Discount 20/30/40 are exact percentage filters; `productPrice` is the base price and `finalPrice` is the current discounted price.
- Products without color/size use one plain stock variant. Clothing carts require explicit variant IDs; no random variant selection occurs. Cart mutations recalculate from current Product and enforce active sellers, product state, positive quantity, valid variants and stock.
- Public pages use bounded `$facet` pagination. Product NEW is derived from the last 14 days, SALE from discount, BEST SELLER from at least 10 delivered units, and TRENDING from engagement rank of at least 50. These are deterministic defaults, not random statistics.
- Product rank uses views + 2*favorites + 5*delivered units. Daily batch updates ranks directly in MongoDB. Clearing recently visited removes the member's Product view records; article views are kept.
- Only a DELIVERED, PAID order belonging to the author grants review eligibility. Product/seller reviews are unique per author/group/target. Ratings and counts are recomputed transactionally when a review is created or moderated.

## Checkout and delivery contract

1. Create an owned address; add current product variant IDs to the cart.
2. `createOrder(input: { addressId, requestId, couponCode? })` reads the authenticated cart. `requestId` is a required per-member idempotency key; repeating a successful key returns the same order.
3. Server checks every product, seller, variant and quantity; price snapshots come from Product. Conditional stock updates prevent overselling. Order + embedded items + Payment + Delivery + coupon usage + notifications + cart clearing share one transaction.
4. `subtotal` is the sum after product discounts, before coupon/delivery. `productDiscount` records the base-price difference. `total = subtotal - couponDiscount + deliveryFee`. Address, names, images, variant attributes and item prices are snapshots.
5. `payOrderDemo(paymentId)` is owner-only, changes Payment to PAID, and confirms the parent and its items. FAILED demo payments may be retried. No real funds are moved.
6. Each seller moves only their items CONFIRMED -> PREPARING -> READY_FOR_DELIVERY. Parent readiness requires every seller's items to be ready. Sellers see their own item snapshots without another seller's items or the parent's private payment/address totals.
7. ADMIN/CS moves all-ready, paid orders to SHIPPED, then DELIVERED. Tracking information and timestamps are preserved. Delivered product/seller sales counters increment once.
8. Customers may cancel before any seller starts preparation. ADMIN may cancel before shipment. Cancellation restores retained variants, reverses coupon usage and cancels/refunds demo payment consistently. ADMIN may refund a delivered paid order; delivered-sales statistics are reversed and stock is not automatically restocked for a delivered return.
9. Optional Buy Again validates current variants/prices/stock and adds them to the current cart. It is a convenience sequence; a later item failure may leave already-added items in the cart.

MongoDB replica-set support is required for all multi-document transactions. A standalone deployment fails closed with `MONGODB_REPLICA_SET_REQUIRED`, without a partial checkout fallback. Cart update revisions also protect against clearing/replacing concurrently changed cart contents.

## Messages, notifications and uploads

`sendMessage` preserves sender/receiver/product context and history. A customer may initiate Ask Seller with an active seller; sellers may reply to an existing customer conversation. List/read operations are participant/receiver scoped. Message notifications point to the peer/member conversation context.

The existing native `ws` gateway is extended, not replaced. Authenticate with `{event: "authenticate", data: {token: "..."}}`, then send `{event: "sendMessage", data: {receiverId, productId?, text}}`. Authentication, DTO validation and the same MessageService apply. `newMessage` is emitted only to authenticated sender/receiver sockets; stored tokens are revalidated before delivery. GraphQL sends use the same broadcast hook. Native WebSocket payloads do not use Socket.IO framing.

Notifications include product/article favorites/comments, follows, order/payment/delivery changes, messages, active event publication and admin system announcements. Event/system fan-out streams active members in bounded batches. Per-member queries support ALL/UNREAD/READ, newest/oldest, pagination, unread count and mark-one/mark-all-read.

Uploads retain `graphql-upload` streaming and `/uploads`. Targets are allow-listed: member, product, brand, event, article. PNG/JPEG, 15 MB per file and at most 10 files apply. Role restrictions prevent USER uploads into seller/admin-only domains. Filenames are generated independently of the caller's filename; partial writes are removed on failure. The local upload system is intentionally retained.

## Database and rollout

Declared indexes are exported in `database-indexes.json`: unique account identifiers, unique seller codes/coupon codes, per-member cart, per-member checkout request, per-order payment/delivery, default addresses, unique reviews, product seller/brand/status/category, seller order items, notification receiver/status/time, message participants/read state and support creator/assignee/status.

These are schema declarations. No indexes or migrations were applied to the existing remote database during this task. Review existing duplicates before an index rollout; use Mongoose index initialization or your normal controlled deployment process. Do not run `syncIndexes` blindly against legacy collections.

`migrate-dianora.ts` defaults to a read-only database dry-run. `--apply` changes AGENT -> SELLER, initializes new statistics, RECOMMEND -> PRODUCT_GUIDE and HUMOR -> FREE. Old Property collections/references remain intact. `bootstrap-admin.ts` defaults to a no-connection dry-run and requires environment-provided credentials for explicit application.

## Verification and remaining acceptance work

Verified locally:

- API and batch TypeScript/build checks.
- Full Nest module dependency graph, existing WebSocket initialization and code-first GraphQL schema generation with disconnected models.
- Unit/security tests covering role elevation attempts, SellerCode states/session usage, password hashing, blocked/deleted accounts, JWT-authoritative identity, ownership filters, verified-purchase reviews, combined product filters, variant stock validation, coupon limits, multi-seller readiness and checkout orchestration.
- Checkout tests assert one parent with two sellers, backend price/address snapshots, conditional stock updates, transaction-scoped persistence, insufficient-stock rejection and cart revision protection.

Not verified against a real database/network:

- Actual MongoDB commit/rollback behavior and concurrent seller-code use, stock contention, repeated checkout/cancellation/payment/delivery/review operations.
- Database migration/index execution on existing data.
- HTTP health e2e and live WebSocket sessions: sandbox port binding returned EPERM, and execution outside the sandbox was not approved.

A temporary MongoDB download was not approved; no existing remote database was contacted. Mock transaction tests verify orchestration and failure paths, not real database atomicity. The backend must not be described as fully production-accepted until these integration checks pass in a replica-set test environment.

Optional later work: Banner/admin audit log if needed, actual payment/courier integrations, token revocation if logout requirements change, deployment-specific currency/delivery policies, and frontend connection. These are not core TODO placeholders in implemented services.

All Queries and Mutations are listed in `graphql-operations.md`; their exact signatures are in `graphql-schema.graphql`.
