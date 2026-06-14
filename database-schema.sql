-- ============================================================
-- 2. 全量重建当前后端表结构
-- 如果只是补表，不想删除现有数据，请不要执行本段 DROP TABLE。
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `article_list`;
DROP TABLE IF EXISTS `changelog`;
DROP TABLE IF EXISTS `classify_list`;
DROP TABLE IF EXISTS `comment`;
DROP TABLE IF EXISTS `like_record`;
DROP TABLE IF EXISTS `count_token`;
DROP TABLE IF EXISTS `diary`;
DROP TABLE IF EXISTS `friend_ship`;
DROP TABLE IF EXISTS `menu`;
DROP TABLE IF EXISTS `project`;
DROP TABLE IF EXISTS `resume`;
DROP TABLE IF EXISTS `role`;
DROP TABLE IF EXISTS `tag_list`;
DROP TABLE IF EXISTS `user`;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE `classify_list` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `describe` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `createTime` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `article_list` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `articleContent` longtext COLLATE utf8mb4_general_ci,
  `articleStatus` int NOT NULL,
  `createTime` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updataTime` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `tag` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `classifyId` int NOT NULL,
  `describe` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `coverUrl` longtext COLLATE utf8mb4_general_ci,
  `Views` int NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `idx_article_list_classifyId` (`classifyId`),
  CONSTRAINT `fk_article_list_classify_list`
    FOREIGN KEY (`classifyId`) REFERENCES `classify_list` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `count_token` (
  `id` int NOT NULL AUTO_INCREMENT,
  `access_token` longtext COLLATE utf8mb4_general_ci NOT NULL,
  `refresh_token` longtext COLLATE utf8mb4_general_ci NOT NULL,
  `apiKey` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `secretKey` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `expires_in` int NOT NULL,
  `createTime` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updataTime` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `user` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `password` longtext COLLATE utf8mb4_general_ci NOT NULL,
  `photo` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `role` varchar(255) COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'admin',
  `permissions` longtext COLLATE utf8mb4_general_ci,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `diary` (
  `id` int NOT NULL AUTO_INCREMENT,
  `type` varchar(255) COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'text',
  `media` longtext COLLATE utf8mb4_general_ci,
  `poster` longtext COLLATE utf8mb4_general_ci,
  `content` longtext COLLATE utf8mb4_general_ci NOT NULL,
  `longContent` longtext COLLATE utf8mb4_general_ci,
  `location` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `date` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `weather` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `likes` int NOT NULL DEFAULT 0,
  `comments` int NOT NULL DEFAULT 0,
  `createTime` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updataTime` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `project` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `category` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `projectType` varchar(255) COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'personal',
  `desc` longtext COLLATE utf8mb4_general_ci,
  `longDesc` longtext COLLATE utf8mb4_general_ci,
  `image` longtext COLLATE utf8mb4_general_ci,
  `images` longtext COLLATE utf8mb4_general_ci,
  `videoUrl` longtext COLLATE utf8mb4_general_ci,
  `tags` longtext COLLATE utf8mb4_general_ci,
  `role` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `date` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `github` longtext COLLATE utf8mb4_general_ci,
  `demo` longtext COLLATE utf8mb4_general_ci,
  `createTime` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updataTime` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `friend_ship` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `icon` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `blogUrl` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `desc` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `screenShot` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `status` varchar(255) COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'approved',
  `contact` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `hasBacklink` tinyint NOT NULL DEFAULT 0,
  `createTime` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updataTime` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `tag_list` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `describe` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `createTime` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_tag_list_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `resume` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `subtitle` longtext COLLATE utf8mb4_general_ci,
  `name` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `role` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `avatar` longtext COLLATE utf8mb4_general_ci,
  `resumeFile` longtext COLLATE utf8mb4_general_ci,
  `resumePassword` longtext COLLATE utf8mb4_general_ci,
  `location` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `summary` longtext COLLATE utf8mb4_general_ci,
  `skills` longtext COLLATE utf8mb4_general_ci,
  `experiences` longtext COLLATE utf8mb4_general_ci,
  `educations` longtext COLLATE utf8mb4_general_ci,
  `projects` longtext COLLATE utf8mb4_general_ci,
  `createTime` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updataTime` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `changelog` (
  `id` int NOT NULL AUTO_INCREMENT,
  `version` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `date` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `tag` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `title` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `changes` longtext COLLATE utf8mb4_general_ci,
  `createTime` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updataTime` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `comment` (
  `id` int NOT NULL AUTO_INCREMENT,
  `targetType` varchar(255) COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'diary',
  `targetId` int NOT NULL,
  `parentId` int DEFAULT NULL,
  `replyTo` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `author` varchar(20) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '访客',
  `content` longtext COLLATE utf8mb4_general_ci NOT NULL,
  `likes` int NOT NULL DEFAULT 0,
  `status` varchar(255) COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'visible',
  `ip` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `createTime` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updataTime` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `like_record` (
  `id` int NOT NULL AUTO_INCREMENT,
  `targetType` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `targetId` int NOT NULL,
  `ip` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `createTime` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_like_record_target_ip` (`targetType`, `targetId`, `ip`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `menu` (
  `id` int NOT NULL AUTO_INCREMENT,
  `key` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `icon` varchar(255) COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'Operation',
  `route` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `group` varchar(255) COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'main',
  `sort` int NOT NULL DEFAULT 0,
  `visible` tinyint NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_menu_key` (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `role` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `code` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `permissions` longtext COLLATE utf8mb4_general_ci,
  `createTime` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updataTime` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
