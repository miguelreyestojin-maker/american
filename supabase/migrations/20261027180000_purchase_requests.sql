-- Solicitudes de compra. El público solo puede crearlas.
-- El administrador las lee y las confirma; al confirmar se descuenta el stock.

create table public.purchase_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  product_id uuid not null references public.products (id) on delete cascade,
  customer_name text not null,
  phone text not null,
  quantity integer not null,
  note text not null default '',
  status text not null default 'pending',
  constraint purchase_requests_name_not_blank check (char_length(btrim(customer_name)) > 0),
  constraint purchase_requests_phone_not_blank check (char_length(btrim(phone)) > 0),
  constraint purchase_requests_quantity_positive check (quantity > 0),
  constraint purchase_requests_status_check check (status in ('pending', 'sold'))
);

create index purchase_requests_created_at_idx
  on public.purchase_requests (created_at desc);

alter table public.purchase_requests enable row level security;

revoke all on public.purchase_requests from anon, authenticated;
grant insert on public.purchase_requests to anon, authenticated;
grant select, update on public.purchase_requests to authenticated;

create policy "Public creates pending purchase requests"
  on public.purchase_requests
  for insert
  to anon, authenticated
  with check (
    status = 'pending'
    and exists (
      select 1
      from public.products
      where products.id = product_id
        and products.is_available
        and products.stock >= quantity
    )
  );

create policy "Admins read purchase requests"
  on public.purchase_requests
  for select
  to authenticated
  using (public.is_admin());

create policy "Admins update purchase requests"
  on public.purchase_requests
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create or replace function public.confirm_purchase(request_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  req_status text;
  req_quantity integer;
  req_product uuid;
  current_stock integer;
begin
  if not public.is_admin() then
    raise exception 'not allowed';
  end if;

  select status, quantity, product_id
  into req_status, req_quantity, req_product
  from public.purchase_requests
  where id = request_id
  for update;

  if req_product is null then
    raise exception 'not found';
  end if;

  if req_status = 'sold' then
    return;
  end if;

  select stock
  into current_stock
  from public.products
  where id = req_product
  for update;

  if current_stock is null or current_stock < req_quantity then
    raise exception 'sin stock';
  end if;

  update public.products
  set stock = stock - req_quantity
  where id = req_product;

  update public.purchase_requests
  set status = 'sold'
  where id = request_id;
end;
$$;

revoke all on function public.confirm_purchase(uuid) from public, anon;
grant execute on function public.confirm_purchase(uuid) to authenticated;
