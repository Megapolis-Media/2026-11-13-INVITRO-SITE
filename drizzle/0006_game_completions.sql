CREATE TABLE `game_completions` (
	`user` text NOT NULL,
	`game` text NOT NULL,
	`question` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `game_completions_user_game_question` ON `game_completions` (`user`,`game`,`question`);
--> statement-breakpoint
INSERT OR IGNORE INTO game_completions(user,game,question)
SELECT r.user,r.game,r.question FROM game_rounds r
JOIN participants p ON p.id=r.user WHERE r.solved=1 AND r.game IN ('yak','pelsh');
--> statement-breakpoint
INSERT OR IGNORE INTO game_completions(user,game,question)
SELECT a.user,substr(a.game,1,instr(a.game,':')-1),substr(a.game,instr(a.game,':')+1)
FROM achievements a JOIN participants p ON p.id=a.user
WHERE a.game LIKE 'yak:%' OR a.game LIKE 'pelsh:%';
