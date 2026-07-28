-- MediStore — Supabase (Postgres) schema.
--
-- Run this once in the Supabase SQL Editor (Project -> SQL Editor -> New
-- query) before running `npm run db:seed`. This is a 1:1 port of the
-- SQLite schema the app used to run on, with two intentional differences:
--   1. created_at/updated_at are real `timestamptz` columns instead of
--      SQLite-formatted text strings.
--   2. `revenue`, `price`, `total` etc. use `double precision` (not
--      `numeric`) so supabase-js returns them as JS numbers, not strings —
--      the app does plain arithmetic on these values everywhere.
--
-- The app connects with the service_role key, which bypasses Row Level
-- Security, so no RLS policies are defined here — authorization is
-- enforced in the Next.js app (requireAdmin(), session ownership checks),
-- exactly as it was against SQLite.

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists users (
  id text primary key,
  name text not null,
  email text unique not null,
  password_hash text,
  image text,
  provider text not null default 'credentials',
  role text not null default 'customer',
  phone text,
  created_at timestamptz not null default now()
);

create table if not exists addresses (
  id text primary key,
  user_id text not null references users(id) on delete cascade,
  full_name text not null,
  phone text not null,
  line1 text not null,
  city text not null,
  state text not null,
  postal_code text not null,
  is_default integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists categories (
  id text primary key,
  name text not null,
  slug text unique not null,
  description text,
  icon text,
  sort_order integer not null default 0
);

create table if not exists products (
  id text primary key,
  name text not null,
  slug text unique not null,
  description text,
  short_description text,
  category_id text references categories(id),
  brand text,
  type text not null default 'general',
  price double precision not null,
  compare_at_price double precision,
  cost_price double precision,
  stock integer not null default 0,
  sku text unique,
  unit text,
  image text,
  images text,
  requires_prescription integer not null default 0,
  rating double precision not null default 0,
  reviews_count integer not null default 0,
  featured integer not null default 0,
  status text not null default 'active',
  tags text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists reviews (
  id text primary key,
  product_id text not null references products(id) on delete cascade,
  user_id text not null references users(id) on delete cascade,
  rating integer not null,
  comment text,
  created_at timestamptz not null default now()
);

create table if not exists coupons (
  id text primary key,
  code text unique not null,
  discount_percent double precision not null,
  active integer not null default 1,
  expires_at timestamptz
);

create table if not exists orders (
  id text primary key,
  order_number text unique not null,
  user_id text not null references users(id),
  status text not null default 'pending',
  payment_method text not null default 'cod',
  payment_status text not null default 'unpaid',
  subtotal double precision not null,
  discount double precision not null default 0,
  shipping_fee double precision not null default 0,
  total double precision not null,
  coupon_code text,
  full_name text not null,
  phone text not null,
  address_line1 text not null,
  city text not null,
  state text not null,
  postal_code text not null,
  notes text,
  tracking_number text,
  carrier text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists order_items (
  id text primary key,
  order_id text not null references orders(id) on delete cascade,
  product_id text references products(id),
  name text not null,
  image text,
  price double precision not null,
  quantity integer not null,
  cost_price double precision
);

create table if not exists returns (
  id text primary key,
  return_number text unique not null,
  order_id text not null references orders(id) on delete cascade,
  order_item_id text not null references order_items(id) on delete cascade,
  user_id text not null references users(id),
  reason text not null,
  comment text,
  quantity integer not null default 1,
  status text not null default 'requested',
  refund_amount double precision not null default 0,
  admin_note text,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create index if not exists idx_products_category on products(category_id);
create index if not exists idx_products_type on products(type);
create index if not exists idx_orders_user on orders(user_id);
create index if not exists idx_order_items_order on order_items(order_id);
create index if not exists idx_returns_order on returns(order_id);

-- ---------------------------------------------------------------------------
-- Analytics RPC functions
--
-- These back src/lib/db/analytics.ts. The reporting queries involve joins,
-- GROUP BY and date-range filtering that are much cleaner expressed as SQL
-- than rebuilt with the supabase-js query builder, so the app calls these
-- via supabase.rpc(...) instead.
-- ---------------------------------------------------------------------------

create or replace function dashboard_stats()
returns table (
  total_revenue double precision,
  revenue_last30 double precision,
  orders_count bigint,
  orders_last30 bigint,
  customers_count bigint,
  avg_order_value double precision,
  pending_orders bigint,
  pending_returns bigint,
  refunded_amount double precision,
  low_stock_count bigint
)
language sql stable as $$
  select
    (select coalesce(sum(total), 0) from orders where status != 'cancelled'),
    (select coalesce(sum(total), 0) from orders where status != 'cancelled' and created_at >= now() - interval '30 days'),
    (select count(*) from orders),
    (select count(*) from orders where created_at >= now() - interval '30 days'),
    (select count(*) from users where role = 'customer'),
    case when (select count(*) from orders) > 0
      then (select coalesce(sum(total), 0) from orders where status != 'cancelled') / (select count(*) from orders)
      else 0 end,
    (select count(*) from orders where status in ('pending', 'processing')),
    (select count(*) from returns where status = 'requested'),
    (select coalesce(sum(refund_amount), 0) from returns where status = 'refunded'),
    (select count(*) from products where stock <= 10 and status = 'active');
$$;

create or replace function revenue_series(days_back int)
returns table (day date, revenue double precision, orders bigint)
language sql stable as $$
  select date(created_at) as day, coalesce(sum(total), 0) as revenue, count(*) as orders
  from orders
  where status != 'cancelled' and created_at >= now() - (days_back::text || ' days')::interval
  group by date(created_at)
  order by day asc;
$$;

create or replace function category_breakdown(range_start date default null, range_end date default null)
returns table (category text, revenue double precision, units bigint)
language sql stable as $$
  select coalesce(c.name, 'Uncategorized') as category,
         coalesce(sum(oi.price * oi.quantity), 0) as revenue,
         coalesce(sum(oi.quantity), 0) as units
  from order_items oi
  join orders o on o.id = oi.order_id and o.status != 'cancelled'
  left join products p on p.id = oi.product_id
  left join categories c on c.id = p.category_id
  where (range_start is null or date(o.created_at) >= range_start)
    and (range_end is null or date(o.created_at) <= range_end)
  group by category
  order by revenue desc;
$$;

create or replace function top_products(lim int default 5, range_start date default null, range_end date default null)
returns table (name text, units bigint, revenue double precision, cost double precision, image text)
language sql stable as $$
  select oi.name as name,
         sum(oi.quantity) as units,
         sum(oi.price * oi.quantity) as revenue,
         sum(coalesce(oi.cost_price, 0) * oi.quantity) as cost,
         max(oi.image) as image
  from order_items oi
  join orders o on o.id = oi.order_id and o.status != 'cancelled'
  where (range_start is null or date(o.created_at) >= range_start)
    and (range_end is null or date(o.created_at) <= range_end)
  group by oi.name
  order by revenue desc
  limit lim;
$$;

create or replace function order_status_breakdown(range_start date default null, range_end date default null)
returns table (status text, count bigint)
language sql stable as $$
  select status, count(*) as count
  from orders
  where (range_start is null or date(created_at) >= range_start)
    and (range_end is null or date(created_at) <= range_end)
  group by status
  order by count desc;
$$;

create or replace function sales_report(range_start date default null, range_end date default null)
returns table (
  revenue double precision,
  cogs double precision,
  gross_profit double precision,
  gross_margin_pct double precision,
  discounts double precision,
  shipping_collected double precision,
  refunds double precision,
  net_profit double precision,
  orders_count bigint,
  cancelled_count bigint,
  units_sold bigint,
  avg_order_value double precision,
  customers_count bigint
)
language sql stable as $$
  with order_totals as (
    select coalesce(sum(total), 0) as revenue,
           coalesce(sum(discount), 0) as discounts,
           coalesce(sum(shipping_fee), 0) as shipping,
           count(*) as count,
           count(distinct user_id) as customers
    from orders
    where status != 'cancelled'
      and (range_start is null or date(created_at) >= range_start)
      and (range_end is null or date(created_at) <= range_end)
  ),
  cancelled as (
    select count(*) as c
    from orders
    where status = 'cancelled'
      and (range_start is null or date(created_at) >= range_start)
      and (range_end is null or date(created_at) <= range_end)
  ),
  cogs_row as (
    select coalesce(sum(coalesce(oi.cost_price, 0) * oi.quantity), 0) as cogs,
           coalesce(sum(oi.quantity), 0) as units
    from order_items oi
    join orders o on o.id = oi.order_id and o.status != 'cancelled'
    where (range_start is null or date(o.created_at) >= range_start)
      and (range_end is null or date(o.created_at) <= range_end)
  ),
  refund_row as (
    select coalesce(sum(refund_amount), 0) as refunds
    from returns
    where status = 'refunded'
      and (range_start is null or date(coalesce(resolved_at, created_at)) >= range_start)
      and (range_end is null or date(coalesce(resolved_at, created_at)) <= range_end)
  )
  select
    ot.revenue,
    cr.cogs,
    ot.revenue - cr.cogs as gross_profit,
    case when ot.revenue > 0 then (ot.revenue - cr.cogs) / ot.revenue * 100 else 0 end as gross_margin_pct,
    ot.discounts,
    ot.shipping,
    rr.refunds,
    (ot.revenue - cr.cogs) - rr.refunds as net_profit,
    ot.count,
    c.c,
    cr.units,
    case when ot.count > 0 then ot.revenue / ot.count else 0 end as avg_order_value,
    ot.customers
  from order_totals ot, cancelled c, cogs_row cr, refund_row rr;
$$;

-- Note: the original SQLite version of this query computed daily cost with
-- a correlated subquery on a column outside GROUP BY, which SQLite allows
-- but silently returns only one arbitrary order's cost per day instead of
-- the day's total. Postgres rejects that outright, so this version fixes
-- it with a proper day-level aggregate.
create or replace function sales_series(start_date date, end_date date)
returns table (day date, revenue double precision, orders bigint, cost double precision)
language sql stable as $$
  with daily_orders as (
    select date(created_at) as day,
           coalesce(sum(total), 0) as revenue,
           count(*) as orders
    from orders
    where status != 'cancelled' and date(created_at) between start_date and end_date
    group by date(created_at)
  ),
  daily_cost as (
    select date(o.created_at) as day,
           coalesce(sum(coalesce(oi.cost_price, 0) * oi.quantity), 0) as cost
    from order_items oi
    join orders o on o.id = oi.order_id
    where o.status != 'cancelled' and date(o.created_at) between start_date and end_date
    group by date(o.created_at)
  )
  select d.day, d.revenue, d.orders, coalesce(c.cost, 0) as cost
  from daily_orders d
  left join daily_cost c on c.day = d.day
  order by d.day asc;
$$;

-- ---------------------------------------------------------------------------
-- Customer list/detail RPCs
--
-- Back src/lib/db/users.ts. Same reasoning as the analytics functions above:
-- per-customer order aggregates (correlated subqueries) don't map cleanly
-- onto the supabase-js query builder.
-- ---------------------------------------------------------------------------

create or replace function list_customers(search text default null, lim int default 50, off int default 0)
returns table (
  id text, name text, email text, phone text, created_at timestamptz,
  orders_count bigint, total_spent double precision, last_order_at timestamptz
)
language sql stable as $$
  select u.id, u.name, u.email, u.phone, u.created_at,
         (select count(*) from orders o where o.user_id = u.id) as orders_count,
         (select coalesce(sum(total), 0) from orders o where o.user_id = u.id and o.status != 'cancelled') as total_spent,
         (select max(created_at) from orders o where o.user_id = u.id) as last_order_at
  from users u
  where u.role = 'customer'
    and (search is null or u.name ilike '%' || search || '%' or u.email ilike '%' || search || '%' or u.phone ilike '%' || search || '%')
  order by u.created_at desc
  limit lim offset off;
$$;

create or replace function count_customers(search text default null)
returns bigint
language sql stable as $$
  select count(*) from users u
  where u.role = 'customer'
    and (search is null or u.name ilike '%' || search || '%' or u.email ilike '%' || search || '%' or u.phone ilike '%' || search || '%');
$$;

create or replace function customer_order_stats(uid text)
returns table (orders_count bigint, total_spent double precision, last_order_at timestamptz)
language sql stable as $$
  select count(*) as orders_count,
         coalesce(sum(case when status != 'cancelled' then total else 0 end), 0) as total_spent,
         max(created_at) as last_order_at
  from orders where user_id = uid;
$$;

-- ---------------------------------------------------------------------------
-- Atomic stock adjustments
--
-- SQLite's `stock = MAX(stock - ?, 0)` was a single atomic UPDATE. The
-- supabase-js query builder can't express a read-modify-write in one
-- round trip, so these keep it atomic in Postgres instead.
-- ---------------------------------------------------------------------------

create or replace function decrement_stock(pid text, qty int)
returns void
language sql as $$
  update products set stock = greatest(stock - qty, 0) where id = pid;
$$;

create or replace function restock_product(pid text, qty int)
returns void
language sql as $$
  update products set stock = stock + qty where id = pid;
$$;
