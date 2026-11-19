CREATE TABLE `achievements` (
	`id` text PRIMARY KEY NOT NULL,
	`user` text NOT NULL,
	`game` text NOT NULL,
	`points` integer NOT NULL,
	`created` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `achievements_user_game` ON `achievements` (`user`,`game`);--> statement-breakpoint
CREATE TABLE `challenges` (
	`id` text PRIMARY KEY NOT NULL,
	`user` text NOT NULL,
	`game` text NOT NULL,
	`created` integer NOT NULL,
	`attempts` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `challenges_user_game` ON `challenges` (`user`,`game`);--> statement-breakpoint
CREATE TABLE `codes` (
	`email` text PRIMARY KEY NOT NULL,
	`hash` text NOT NULL,
	`expires` integer NOT NULL,
	`created` integer NOT NULL,
	`attempts` integer DEFAULT 0 NOT NULL,
	`ip` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `media` (
	`id` text PRIMARY KEY NOT NULL,
	`user` text NOT NULL,
	`key` text NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`kind` text NOT NULL,
	`size` integer NOT NULL,
	`consent` integer NOT NULL,
	`created` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `media_user` ON `media` (`user`);--> statement-breakpoint
CREATE TABLE `messages` (
	`id` text PRIMARY KEY NOT NULL,
	`user` text NOT NULL,
	`kind` text NOT NULL,
	`recipient` text NOT NULL,
	`body` text NOT NULL,
	`media_id` text,
	`created` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `messages_user` ON `messages` (`user`);--> statement-breakpoint
CREATE TABLE `participants` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`first` text DEFAULT '' NOT NULL,
	`last` text DEFAULT '' NOT NULL,
	`position` text DEFAULT '' NOT NULL,
	`seconds` integer DEFAULT 0 NOT NULL,
	`heartbeat` integer DEFAULT 0 NOT NULL,
	`created` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `participants_email_unique` ON `participants` (`email`);--> statement-breakpoint
CREATE TABLE `sessions` (
	`hash` text PRIMARY KEY NOT NULL,
	`user` text NOT NULL,
	`expires` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `tickets` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user` text NOT NULL,
	`kind` text NOT NULL,
	`created` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tickets_user_kind` ON `tickets` (`user`,`kind`);