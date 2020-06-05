USE tatoebakrs;

CREATE INDEX idx_lang ON sentences (lang);
CREATE INDEX idx_src ON links (src_id);
CREATE INDEX idx_tgt ON links (tgt_id);
CREATE INDEX idx_src_tgt ON links (src_id, tgt_id);


