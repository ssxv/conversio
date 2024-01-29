create index tsv_index on public.user using gin(tsv);


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

create or replace function user_search_trigger() returns trigger language 'plpgsql' as $$ 
begin 
	new.tsv := setweight(to_tsvector(generate_substrings_text(new.email, 4)), 'A') || setweight(to_tsvector(generate_substrings_text(new.name, 4)), 'A');
	return new;
end 
$$

create trigger usertsvupdate before insert
on public.user for each row execute function user_search_trigger();

drop trigger usertsvupdate on public.user;

-- view triggers
select event_object_schema as table_schema,
       event_object_table as table_name,
       trigger_schema,
       trigger_name,
       string_agg(event_manipulation, ',') as event,
       action_timing as activation,
       action_condition as condition,
       action_statement as definition
from information_schema.triggers
group by 1,2,3,4,6,7,8
order by table_schema, table_name;
