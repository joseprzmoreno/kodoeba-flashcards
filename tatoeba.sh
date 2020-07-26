#!/bin/bash
deletecommand="truncate table tatoebakrs.links;truncate table tatoebakrs.sentences;"
downloadsdirectory="~/tatoeba"
sentenceslink="https://downloads.tatoeba.org/exports/sentences.tar.bz2"
linkslink="https://downloads.tatoeba.org/exports/links.tar.bz2"
sentencesfile="sentences.tar.bz2"
linksfile="links.tar.bz2"
sentencesload="LOAD DATA LOCAL INFILE 'sentences.csv' INTO TABLE sentences FIELDS TERMINATED BY '\t' LINES TERMINATED BY '\n' (id, lang, sentence);"
linksload="LOAD DATA LOCAL INFILE 'links.csv' INTO TABLE links FIELDS TERMINATED BY '\t' LINES TERMINATED BY '\n' (src_id, tgt_id);"
sentencescsv="sentences.csv"
linkscsv="links.csv"

echo ">> Deleting content of database tatoebakrs"
/usr/bin/mysql -u root -p tatoebakrs << eof

$deletecommand
eof

echo "Content has been deleted"

echo "Downloading tatoeba files"
cd $downloadsdirectory
wget "$sentenceslink"
wget "$linkslink"

echo "Uncompressing files"
tar -xvf "$sentencesfile"
tar -xvf "$linksfile"

echo "Loading files to database"
/usr/bin/mysql -u root -p tatoebakrs << eof

$sentencesload
$linksload

eof

echo "Deleting files"
rm "$sentencesfile"
rm "$linksfile"
rm "$sentencescsv"
rm "$linkscsv"

echo "Done"
