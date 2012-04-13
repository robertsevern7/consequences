USE consequences;
INSERT IGNORE INTO `carrier` (`id`, `name`) VALUES (1,'facebook');
INSERT IGNORE INTO `user` (`id`, `carrier_id`) VALUES (1,1);
INSERT IGNORE INTO `character` (`id`, `character_name`) VALUES (1,'rob\'s knob');
INSERT IGNORE INTO `protagonist` (`id`, `story_id`, `character_id`) VALUES (1,1,1);
INSERT IGNORE INTO `story` (`id`, `story_id`, `title`, `owner_id`, `max_sections`, `num_likes`) VALUES (1,1,'Dog Tits',1,5,0);
INSERT IGNORE INTO `section` (`id`, `user_id`, `story_id`, `content`) VALUES (1,1,1,'some dumb content');

