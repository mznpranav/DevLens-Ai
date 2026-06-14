ALTER TABLE `analyses` MODIFY COLUMN `narrative` text DEFAULT ('');--> statement-breakpoint
ALTER TABLE `analyses` MODIFY COLUMN `architectureMap` text DEFAULT ('');--> statement-breakpoint
ALTER TABLE `analyses` MODIFY COLUMN `heatmap` text DEFAULT ('');--> statement-breakpoint
ALTER TABLE `analyses` MODIFY COLUMN `fileTree` text DEFAULT ('');--> statement-breakpoint
ALTER TABLE `analyses` MODIFY COLUMN `status` enum('pending','analyzing','completed','failed') DEFAULT 'analyzing';--> statement-breakpoint
ALTER TABLE `analyses` MODIFY COLUMN `error` text DEFAULT ('');