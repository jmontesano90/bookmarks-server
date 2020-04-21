-- First, remove the table if it exists
drop table if exists bookmarks;

-- Create the table anew
create table bookmarks (
  id INTEGER primary key generated by default as identity,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT NOT NULL,
  rating INTEGER NOT NULL
);

-- insert some test data
-- Using a multi-row insert statement here
insert into bookmarks (title, url, description, rating)
values
  ('Lord of the me','lordoftheme.com','I am the lord of me and its great VGS', '10'),
  ('Hairy pots','hairypots.com','Please dont read this', '1'),
  ('Airframe','something.com','Please read this', '10');