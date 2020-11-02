create table servers (
  id          serial,
  uid         uuid default md5(random()::text || clock_timestamp()::text)::uuid,
  created     timestamptz not null default now(),
  updated     timestamptz not null default now(),
  guild_id    text not null,
  guild_name  text not null,
  creator     text not null,
  creator_id  text not null,
  def         boolean default false,
  name        text not null,
  title       text not null,
  host        text not null,
  port        int not null,
  rpass       text,
  rport       int
);

CREATE OR REPLACE FUNCTION update_server()
  RETURNS TRIGGER 
  LANGUAGE PLPGSQL
AS $$
BEGIN
  IF NEW.updated = '2000-01-01' THEN
    NEW.updated = OLD.updated;
  ELSE
    NEW.updated = NOW();
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER update_server_trigger BEFORE UPDATE ON servers FOR EACH ROW EXECUTE PROCEDURE update_server();

CREATE OR REPLACE FUNCTION set_def_server()
  RETURNS TRIGGER 
  LANGUAGE PLPGSQL
AS $$
BEGIN
  IF NEW.def IS TRUE THEN
    UPDATE servers SET def = FALSE, updated = '2000-01-01'
    WHERE guild_id = NEW.guild_id
      AND id != NEW.id;
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER set_def_server_trigger AFTER INSERT or UPDATE ON servers FOR EACH ROW EXECUTE PROCEDURE set_def_server();

create unique index uix_servers_uid on servers (uid);
create unique index ix_server_name on servers (guild_id, name);
create index ix_servers_guild on servers (guild_id, def desc);

insert into servers (guild_id, guild_name, creator, creator_id, def, name, title, host, port) values
('123', 'test', 'keith', '456', true, 'cool_srv', 'the coolest server', '10.1.1.1', 1024)
returning id, guild_name, creator, name, title, def;

insert into servers (guild_id, guild_name, creator, creator_id, def, name, title, host, port) values
('123', 'test', 'keith', '456', true, 'new_srv', 'the newest server', '10.1.1.2', 2048)
returning id, guild_name, creator, name, title, def;

select id, created, updated, guild_name, creator, name, title, def from servers; rollback;
update servers set def = true where id = 5; commit;
select id, created, updated, guild_name, creator, name, title, def from servers; rollback;
