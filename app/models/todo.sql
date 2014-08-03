
create user todo_user password 'todo_password';

create table public.todo (
  id serial,  -- This is to emulate MongoDB's _id attribute assigned to every document.
  document json
);

alter table public.todo owner to todo_user;
