CREATE TABLE `broadcast_posts` (
	`id` text PRIMARY KEY NOT NULL,
	`user` text,
	`kind` text NOT NULL,
	`sender_name` text NOT NULL,
	`position` text NOT NULL,
	`recipient` text NOT NULL,
	`recipient_email` text NOT NULL,
	`body` text NOT NULL,
	`template` text NOT NULL,
	`track` text NOT NULL,
	`ip` text NOT NULL,
	`state` text NOT NULL,
	`delivery` text NOT NULL,
	`media_id` text,
	`created` integer NOT NULL,
	`attempted` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE INDEX `broadcast_ip_created` ON `broadcast_posts` (`ip`,`created`);