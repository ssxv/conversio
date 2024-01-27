CREATE INDEX tsv_index ON public.user USING gin(tsv);

create or replace function user_search_trigger() returns trigger language 'plpgsql' as $$ 
begin 
	new.tsv := setweight(to_tsvector(coalesce(new.email,'')), 'A') || setweight(to_tsvector(coalesce(new.name,'')), 'B');
	return new;
end 
$$

CREATE TRIGGER usertsvupdate BEFORE INSERT OR UPDATE
ON public.user FOR EACH ROW EXECUTE PROCEDURE user_search_trigger();

DROP TRIGGER usertsvupdate ON public.user;

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
