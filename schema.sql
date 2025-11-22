-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Job Categories Table
create table categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Winning Proposals Table
create table proposals (
  id uuid primary key default uuid_generate_v4(),
  category_id uuid references categories(id) on delete cascade,
  title text not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Portfolio Items Table
create table portfolio_items (
  id uuid primary key default uuid_generate_v4(),
  category_id uuid references categories(id) on delete cascade,
  title text not null,
  link text not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table categories enable row level security;
alter table proposals enable row level security;
alter table portfolio_items enable row level security;

-- Create policies to allow public read access (since this is a personal tool for now)
-- You can restrict this later if needed
create policy "Allow public read access" on categories for select using (true);
create policy "Allow public read access" on proposals for select using (true);
create policy "Allow public read access" on portfolio_items for select using (true);

-- Create policies to allow public insert/update/delete (for the admin/settings panel)
-- WARNING: In a production app with users, you would restrict this to authenticated users only.
create policy "Allow public insert" on categories for insert with check (true);
create policy "Allow public update" on categories for update using (true);
create policy "Allow public delete" on categories for delete using (true);

create policy "Allow public insert" on proposals for insert with check (true);
create policy "Allow public update" on proposals for update using (true);
create policy "Allow public delete" on proposals for delete using (true);

create policy "Allow public insert" on portfolio_items for insert with check (true);
create policy "Allow public update" on portfolio_items for update using (true);
create policy "Allow public delete" on portfolio_items for delete using (true);
