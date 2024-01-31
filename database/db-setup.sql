-- set search_path to public;
-- drop extension if exists "uuid-ossp";
-- create extension "uuid-ossp" schema public;
create extension if not exists "uuid-ossp" schema pg_catalog version "1.1"; 


create or replace function generate_substrings_text(input_string text, start_length int)
returns text as $$
declare
    input_length int;
    i int;
    j int;
    result_text text := '';
begin
    input_length := length(input_string);

    -- Iterate over all possible substring lengths
    for i in start_length..input_length loop
        -- Iterate over all possible starting positions
        for j in 1..(input_length - i + 1) loop
            -- Concatenate the current substring to the result
            result_text := result_text || ' ' || substring(input_string from j for i);
        end loop;
    end loop;

    -- Remove the leading space
    result_text := trim(both ' ' from result_text);

    return result_text;
end;
$$ language plpgsql;


create or replace function user_search_trigger()
returns trigger as $$ 
begin 
	new.tsv := setweight(to_tsvector(generate_substrings_text(new.email, 4)), 'A') || setweight(to_tsvector(generate_substrings_text(new.name, 4)), 'A');
	return new;
end 
$$ language plpgsql;


CREATE TABLE public."user" (
	"id" uuid NOT NULL DEFAULT uuid_generate_v4(),
	"createdAt" timestamp NOT NULL DEFAULT now(),
	"modifiedAt" timestamp NOT NULL DEFAULT now(),
	"name" text NOT NULL,
	"email" text NOT NULL,
	"hash" text NOT NULL,
	"salt" text NOT NULL,
	"tsv" tsvector NULL,
	CONSTRAINT "PK_user_id" PRIMARY KEY ("id"),
	CONSTRAINT "UQ_user_email" UNIQUE ("email")
);


create index tsv_index on public."user" using gin("tsv");


create trigger usertsvupdate before insert
on public."user" for each row execute function user_search_trigger();


CREATE TABLE public."message" (
	"id" uuid NOT NULL DEFAULT uuid_generate_v4(),
	"createdAt" timestamp NOT NULL DEFAULT now(),
	"modifiedAt" timestamp NOT NULL DEFAULT now(),
	"message" text NOT NULL,
	"from" uuid NOT NULL,
	"to" uuid NOT NULL,
	"read" bool NOT NULL DEFAULT false,
	"clientId" uuid NOT NULL,
	CONSTRAINT "PK_message_id" PRIMARY KEY ("id")
);
