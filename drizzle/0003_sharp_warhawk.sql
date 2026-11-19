CREATE INDEX `broadcast_user_created` ON `broadcast_posts` (`user`,`created`);--> statement-breakpoint
CREATE INDEX `codes_ip_created` ON `codes` (`ip`,`created`);--> statement-breakpoint
CREATE INDEX `tickets_kind` ON `tickets` (`kind`);