===KODOEBA/TATOEBA FLASHCARDS APPLICATION===

You'll need to have Python 3 installed and mysql, as well as Python Virtual Environment.
The following instructions are suited to Linux/Ubuntu.

1. In the directory of the app, create a config.txt file with the following information:

[db]
user = YOUR_MYSQL_USER
password = YOUR_MYSQL_PASSWORD

2. Create mysql database. In shell, run:

mysql -u USER -p < db_create.sql

3. Populate database with tatoeba sentences

Executing bash file tatoeba.sh will do the job (you'll be required to enter your mysql password).
Before executing, edit the line "downloadsdirectory=..." and add your custom directory.

Otherwise, you need to follow these steps:
- Download sentences.csv and links.csv from tatoeba downloads page: https://downloads.tatoeba.org
- Using tatoebakrs database, run these two instructions:
    LOAD DATA LOCAL INFILE 'sentences.csv' INTO TABLE sentences FIELDS TERMINATED BY '\t' LINES TERMINATED BY '\n' (id, lang, sentence);
    LOAD DATA LOCAL INFILE 'links.csv' INTO TABLE links FIELDS TERMINATED BY '\t' LINES TERMINATED BY '\n' (src_id, tgt_id);

4. Activate python virtual environment. In the directory of the app:
    source myenv/bin/activate

5. Execute api.py

6. In a navigator or Postman, launch: http://localhost:5000/api/randomsentences/0/eng/ell/50

7. Deactivate virtual environment: deactivate
