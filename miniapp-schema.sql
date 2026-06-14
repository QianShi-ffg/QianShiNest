-- ============================================================
-- 小程序模块生产库建表 SQL
-- 适用模块：miniapp 登录用户、工具使用记录
-- 注意：生产环境默认只建表，不删除已有数据。
-- 如需重建，请先备份数据，再手动执行下方注释中的 DROP TABLE。
-- ============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 如需重建小程序表，确认备份后再取消注释执行：
-- DROP TABLE IF EXISTS `miniapp_tool_usage`;
-- DROP TABLE IF EXISTS `miniapp_user`;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE IF NOT EXISTS `miniapp_user` (
  `id` int NOT NULL AUTO_INCREMENT,
  `openid` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `unionid` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `nickName` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `avatarUrl` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `username` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `userCode` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `role` varchar(255) COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'user',
  `lastLoginTime` timestamp NULL DEFAULT NULL,
  `createTime` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updataTime` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_miniapp_user_openid` (`openid`),
  UNIQUE KEY `idx_miniapp_user_username` (`username`),
  UNIQUE KEY `idx_miniapp_user_userCode` (`userCode`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `miniapp_tool_usage` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `toolKey` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `toolTitle` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `entryType` varchar(255) COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'open',
  `createTime` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_miniapp_tool_usage_user_tool` (`userId`, `toolKey`),
  KEY `idx_miniapp_tool_usage_userId` (`userId`),
  KEY `idx_miniapp_tool_usage_toolKey` (`toolKey`),
  CONSTRAINT `fk_miniapp_tool_usage_user`
    FOREIGN KEY (`userId`) REFERENCES `miniapp_user` (`id`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
