# KODOEBA/TATOEBA FLASHCARDS APPLICATION

You'll need to have Python 3 installed and mysql, as well as Python Virtual Environment.
The following instructions are best suited to Linux.

- Download repository.
- In the directory of the app, create a ```config.txt``` file with the following information:
```
[db]
user = YOUR_MYSQL_USER
password = YOUR_MYSQL_PASSWORD
```
- Create mysql database. In shell, run (replacing USER with your mysql user):
```mysql -u USER -p < db_create.sql```
- Create the directory ~/tatoeba for downloading files, or edit line "downloadsdirectory=..." in the file tatoeba.sh.
- Populate database with tatoeba sentences. Executing bash file tatoeba.sh (```./tatoeba.sh```) will do the job in Linux (you'll be required to enter your mysql password). Otherwise, you need to follow these steps:
  - Download and uncompress sentences.csv and links.csv from tatoeba downloads page: https://downloads.tatoeba.org
  - Using tatoebakrs database, run these two instructions:
    ```LOAD DATA LOCAL INFILE 'sentences.csv' INTO TABLE sentences FIELDS TERMINATED BY '\t' LINES TERMINATED BY '\n' (id, lang, sentence);```

    ```LOAD DATA LOCAL INFILE 'links.csv' INTO TABLE links FIELDS TERMINATED BY '\t' LINES TERMINATED BY '\n' (src_id, tgt_id);```
The files load process can take a few minutes.
- In shell, run: ```mysql -u USER -p < db_postprocessing.sql``` (replacing USER with your mysql user name. This adds some changes to the database to improve performance. This can take up to 25-30 minutes, please be patient).
- Activate python virtual environment. In the directory of the app:
    ```source myenv/bin/activate```
- Install requirements:  ```pip3 install -r requirements.txt```  or ```pip install -r requirements.txt```
- Execute api.py. In shell: ```python api.py```
- In a browser or Postman, launch: ```http://localhost:5000/api/randomsentences/0/eng/ell/50``` (if you use Google Chrome, I recommend adding extension JSONView). 
- In order to use the flashcards web page included, it is necessary to have a pre-loaded list of languages indicating which target languages are available for each one of them. The file is included in the repository, but if you want to generate it, so it is well updated, run: ```http://localhost:5000/get_available_languages_list``` (the process can take about ten minutes to complete). 
- To use the flashcards web page, run: ```http://localhost:5000``` . You can try exploring and changing controls. For languages with more sentences, it can take a few seconds to get the sentences. Anyone is invited to explore further solutions to improve mysql performance of the project.
- Deactivate virtual environment: ```deactivate```

