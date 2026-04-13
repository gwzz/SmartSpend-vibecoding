-- SmartSpend guardrails for amortized transactions and query performance.
-- Apply before deploying the matching app changes.

begin;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'transactions_end_date_gte_date'
  ) then
    alter table public.transactions
      add constraint transactions_end_date_gte_date
      check (end_date is null or end_date >= date);
  end if;
end $$;

create index if not exists idx_transactions_user_timestamp
  on public.transactions (user_id, timestamp desc);

create index if not exists idx_transactions_user_date
  on public.transactions (user_id, date);

commit;
