CREATE DATABASE tatoebakrs CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE tatoebakrs;

CREATE TABLE `sentences` (
  `id` int(11) NOT NULL,
  `lang` varchar(20) NOT NULL,
  `sentence` varchar(5000) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `links` (
  `src_id` int(11) NOT NULL,
  `tgt_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_lang ON sentences (lang);
CREATE INDEX idx_src ON links (src_id);
CREATE INDEX idx_tgt ON links (tgt_id);
CREATE INDEX idx_src_tgt ON links (src_id, tgt_id);

