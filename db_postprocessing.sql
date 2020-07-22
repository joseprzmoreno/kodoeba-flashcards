USE tatoebakrs;

ALTER TABLE links
ADD COLUMN src_lang VARCHAR(20);

ALTER TABLE links
ADD COLUMN tgt_lang VARCHAR(20);

UPDATE links
SET src_lang = (SELECT lang FROM sentences WHERE sentences.id = links.src_id),
    tgt_lang = (SELECT lang FROM sentences WHERE sentences.id = links.tgt_id);

CREATE INDEX idx_lang ON sentences (lang);
CREATE INDEX idx_src ON links (src_lang);
CREATE INDEX idx_tgt ON links (tgt_lang);
CREATE INDEX idx_src_tgt ON links (src_lang, tgt_lang);




