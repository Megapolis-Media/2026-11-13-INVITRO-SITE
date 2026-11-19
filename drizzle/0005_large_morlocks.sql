CREATE TABLE `event_audit` (
	`id` text PRIMARY KEY NOT NULL,
	`action` text NOT NULL,
	`created` integer NOT NULL,
	`revision` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `event_control` (
	`id` integer PRIMARY KEY NOT NULL,
	`draft` text NOT NULL,
	`published` text NOT NULL,
	`revision` integer DEFAULT 0 NOT NULL,
	`updated` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `overlay_state` (
	`id` integer PRIMARY KEY NOT NULL,
	`ticket` integer,
	`visible` integer DEFAULT 0 NOT NULL,
	`revision` integer DEFAULT 0 NOT NULL,
	`updated` integer NOT NULL
);
