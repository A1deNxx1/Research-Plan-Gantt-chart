CREATE TABLE `plan_edits` (
	`task_id` text PRIMARY KEY NOT NULL,
	`payload` text NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_by` text NOT NULL
);
