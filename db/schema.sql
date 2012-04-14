drop database if exists consequences;
create database consequences;

create table if not exists consequences.carrier(
	id integer unsigned AUTO_INCREMENT PRIMARY KEY,
	name varchar(255) not null
);
	

create table if not exists consequences.user(
	id integer unsigned AUTO_INCREMENT PRIMARY KEY,
	carrier_id integer unsigned not null,
	UNIQUE(carrier_id)
);

create table if not exists consequences.story  (
    id integer unsigned AUTO_INCREMENT PRIMARY KEY,
	title text not null,
	owner_id integer unsigned not null,
	max_sections integer not null default 5,
	num_likes integer not null  default 0
);

alter table consequences.story add foreign key (owner_id) references consequences.user(id);

create table if not exists consequences.section (
    id integer unsigned AUTO_INCREMENT PRIMARY KEY,
	user_id integer unsigned not null,
	story_id integer unsigned not null,
	content text default null,
	UNIQUE (user_id, story_id)
);  

alter table consequences.section add foreign key (user_id) references consequences.user(id);
alter table consequences.section add foreign key (story_id) references consequences.story(id);

create table if not exists consequences.character (
    id integer unsigned AUTO_INCREMENT PRIMARY KEY,
	character_name varchar(255) default null,
	UNIQUE(character_name)
);  

create table if not exists consequences.protagonist (
    id integer unsigned AUTO_INCREMENT PRIMARY KEY,
	story_id integer unsigned not null,
	character_id integer unsigned not null,
	UNIQUE(story_id, character_id)
);