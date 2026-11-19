CREATE TABLE `lottery_settings` (
	`id` integer PRIMARY KEY NOT NULL,
	`open` integer DEFAULT 0 NOT NULL,
	`groups` integer DEFAULT 13 NOT NULL,
	`updated` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `ticket_mail` (
	`ticket` integer PRIMARY KEY NOT NULL,
	`state` text DEFAULT 'pending' NOT NULL,
	`attempted` integer DEFAULT 0 NOT NULL,
	`generation` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE `participants` ADD `agglomeration` text DEFAULT '' NOT NULL;