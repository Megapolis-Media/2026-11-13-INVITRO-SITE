CREATE TABLE `game_rounds` (
	`id` text PRIMARY KEY NOT NULL,
	`user` text NOT NULL,
	`game` text NOT NULL,
	`question` text NOT NULL,
	`letters` text DEFAULT '' NOT NULL,
	`attempts` integer DEFAULT 0 NOT NULL,
	`solved` integer DEFAULT 0 NOT NULL,
	`created` integer NOT NULL,
	`expires` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `game_rounds_user_created` ON `game_rounds` (`user`,`created`);