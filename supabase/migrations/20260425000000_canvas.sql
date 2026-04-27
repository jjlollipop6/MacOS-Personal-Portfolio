create table canvas_cells (
  cell_key   text        not null primary key,  -- "col,row"
  col        integer     not null,
  row        integer     not null,
  color      text        not null,
  updated_at timestamptz not null default now()
);

-- Allow anyone to read and write (shared public canvas)
alter table canvas_cells enable row level security;

create policy "public read"   on canvas_cells for select using (true);
create policy "public insert" on canvas_cells for insert with check (true);
create policy "public update" on canvas_cells for update using (true) with check (true);
create policy "public delete" on canvas_cells for delete using (true);

-- Enable realtime for this table
alter publication supabase_realtime add table canvas_cells;
