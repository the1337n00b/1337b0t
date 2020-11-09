drop table if exists dc_servers;
create table dc_servers (
  id          serial not null primary key,
  guild_id    text not null,
  guild_name  text not null,
  require_dm  boolean not null default false,
  admins      json not null default '[]',
  defaults    json not null default '{}', -- channel defaults
  do_servers  json not null default '[]' -- {vol: 'configs', rconpass: 'P@ssw0rd'}
);
create unique index uix_guild on dc_servers (guild_id);

drop table if exists mc_servers;
create table mc_servers (
  id          serial not null primary key,
  uid         uuid default md5(random()::text || clock_timestamp()::text)::uuid,
  created     timestamptz not null default now(),
  updated     timestamptz not null default now(),
  guild_id    text not null,
  guild_name  text not null,
  creator     text not null,
  creator_id  text not null,
  operators   json not null default '[]',
  channels    json not null default '[]', -- only answer msgs about this server on speicific channels
  def         boolean not null default false,
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
CREATE TRIGGER update_server_trigger BEFORE UPDATE ON mc_servers FOR EACH ROW EXECUTE PROCEDURE update_server();

CREATE OR REPLACE FUNCTION set_def_server()
  RETURNS TRIGGER 
  LANGUAGE PLPGSQL
AS $$
DECLARE
  guild_exists int;
BEGIN
  IF NEW.def IS TRUE THEN
    UPDATE mc_servers SET def = FALSE, updated = '2000-01-01'
    WHERE guild_id = NEW.guild_id
      AND id != NEW.id;
  END IF;

  SELECT count(*) INTO guild_exists FROM dc_servers WHERE guild_id = NEW.guild_id and guild_name = NEW.guild_name;

  IF guild_exists = 0 THEN
    INSERT INTO dc_servers (guild_id, guild_name) VALUES (NEW.guild_id, NEW.guild_name)
    ON CONFLICT (guild_id) DO UPDATE SET guild_name = NEW.guild_name;
  END IF;

  RETURN NEW;
END;
$$;
CREATE TRIGGER set_def_server_trigger AFTER INSERT or UPDATE ON mc_servers FOR EACH ROW EXECUTE PROCEDURE set_def_server();

create unique index uix_mc_servers_uid on mc_servers (uid);
create unique index ix_server_name on mc_servers (guild_id, name);
create index ix_mc_servers_guild on mc_servers (guild_id, def desc);

drop table if exists do_servers;
create table do_servers (
  id          serial not null primary key,
  guild_id    text not null,
  name        text not null,
  title       text not null,
  docker_img  text not null,
  req_votes   int not null default 2,
  max_extend  int not null default 90,
  expire      int not null default 60,
  warn        int not null default 10,
  rconpass    text not null default 'P@ssw0rd',
  region      text not null default 'nyc1',
  vpc         text not null default 'default-nyc1',
  size        text not null default 's-1vcpu-2gb',
  do_token    text not null,
  ssh_name    text not null,
  host        text not null,
  vol         text,
  cname       text, -- 'mc'
  domain      text, -- 'blah.something.com'
  srv         text -- '_minecraft._tcp'
);

-- insert into mc_servers (guild_id, guild_name, creator, creator_id, def, name, title, host, port) values
-- ('123', 'test', 'keith', '456', true, 'cool_srv', 'the coolest server', '10.1.1.1', 1024)
-- returning id, guild_name, creator, name, title, def; commit;
-- select * from dc_servers;

-- insert into mc_servers (guild_id, guild_name, creator, creator_id, def, name, title, host, port) values
-- ('123', 'TEST', 'keith', '456', true, 'new_srv', 'the newest server', '10.1.1.2', 2048)
-- returning id, guild_name, creator, name, title, def; commit;
-- select * from dc_servers;

-- select id, created, updated, guild_name, creator, name, title, def from mc_servers; rollback;
-- update mc_servers set def = true where id = 5; commit;
-- select id, created, updated, guild_name, creator, name, title, def from mc_servers; rollback;
