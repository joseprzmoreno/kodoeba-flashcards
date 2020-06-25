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
- Download and uncompress sentences.csv and links.csv from tatoeba downloads page: https://downloads.tatoeba.org
- Using tatoebakrs database, run these two instructions:

    LOAD DATA LOCAL INFILE 'sentences.csv' INTO TABLE sentences FIELDS TERMINATED BY '\t' LINES TERMINATED BY '\n' (id, lang, sentence);

    LOAD DATA LOCAL INFILE 'links.csv' INTO TABLE links FIELDS TERMINATED BY '\t' LINES TERMINATED BY '\n' (src_id, tgt_id);

The files load process may take a few minutes.

4. In shell, run: mysql -u USER -p < db_add_indexes.sql (this adds some indexes to the database).

5. Activate python virtual environment. In the directory of the app:
    source myenv/bin/activate

   You'll need to install flask and pymysql libraries in Python:
   
   pip3 install flask
   
   pip3 install pymysql

6. Execute api.py (through Python Idle; in shell: python api.py, etc.)

7. In a browser or Postman, launch: http://localhost:5000/api/randomsentences/0/eng/ell/50 (if you use Google Chrome, I recommend adding extension JSONView).

8. In order to use the flashcards web page included, it is necessary to have a pre-loaded list of languages indicating which target languages are available for each one of them.

The file is included, but if you want to generate it, so it is more updated, run: http://localhost:5000/get_available_languages_list (the process can take about ten minutes to complete). 

9. To use the flashcards web page, run: http://localhost:5000 . You can try changing controls, etc. For heavier languages, it can take some seconds to get the sentences. This is a problem 

I am trying to solve. Ordering mysql very large tables by RAND() is very time-consuming.

10. Deactivate virtual environment: deactivate

