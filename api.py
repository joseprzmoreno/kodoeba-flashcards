import flask
from flask import request, jsonify, render_template
import pymysql
import json, random, time
import configparser
from transliterations import *

app = flask.Flask(__name__)
app.config["DEBUG"] = True

def get_db():
    config_parser = configparser.RawConfigParser()   
    config_file_path = r'./config.txt'
    config_parser.read(config_file_path)
    user = config_parser.get('db', 'user')
    password = config_parser.get('db', 'password')
    
    return pymysql.connect(host='localhost', port=3306, user=user, password=password, db='tatoebakrs',
                           cursorclass=pymysql.cursors.DictCursor)

def fetch_all(sql):
    db = get_db()
    cur = db.cursor()    
    cur.execute(sql)
    ress = cur.fetchall()
    cur.close()
    return ress

def process_word_string(txt):
    words = []
    chunks = txt.split(",")
    for chunk in chunks:
        word = chunk.strip()
        if len(word)>2 and word[0]=='/' and word[-1]=='/':
            word = word[1:-1]
        word = word.replace("'","''")
        words.append(word)
    return words

def build_extra_sql_for_required_words(words, is_src_or_tgt):
    sql = " AND ( "
    chunks = []
    for word in words:
        if word != '':
            chunks.append(" {}.sentence REGEXP '\\\\b{}\\\\b'".format(is_src_or_tgt, word))
    if len(chunks)==0:
        return ""
    sql += " OR ".join(chunks) + " ) "
    return sql
   
def get_random_sentence_pairs(src, tgt, num, include_words_src='', include_words_tgt=''):
    sql = """SELECT src.sentence srcsentence, tgt.sentence tgtsentence
FROM sentences src
JOIN links l ON src.id = l.src_id 
JOIN sentences tgt ON l.tgt_id = tgt.id 
WHERE l.src_lang = '{}' AND l.tgt_lang = '{}'
AND CHAR_LENGTH(src.sentence) <= 70
AND CHAR_LENGTH(tgt.sentence) <= 70
""".format(src,tgt)

    if include_words_src != None and include_words_src != '':
        sql += build_extra_sql_for_required_words(process_word_string(include_words_src), 'src')
    if include_words_tgt != None and include_words_tgt != '':
        sql += build_extra_sql_for_required_words(process_word_string(include_words_tgt), 'tgt')

    sql += " ORDER BY RAND() LIMIT {}".format(num)
    
    results = fetch_all(sql)
    translations = []
    for result in results:
        src_translit = ""
        tgt_translit = ""
        if has_transliteration(src):
            src_translit = get_transliteration(src,result["srcsentence"])
        if has_transliteration(tgt):
            tgt_translit = get_transliteration(tgt,result["tgtsentence"])
        translations.append({"src_sentence":result['srcsentence'], "tgt_sentence":result['tgtsentence'],
                             "src_translit":src_translit, "tgt_translit":tgt_translit})
    return translations

#From: https://stackoverflow.com/questions/7824101/return-http-status-code-201-in-flask
class InvalidUsage(Exception):
    status_code = 400

    def __init__(self, message, status_code=None, payload=None):
        Exception.__init__(self)
        self.message = message
        if status_code is not None:
            self.status_code = status_code
        self.payload = payload

    def to_dict(self):
        rv = dict(self.payload or ())
        rv['message'] = self.message
        return rv

@app.errorhandler(InvalidUsage)
def handle_invalid_usage(error):
    response = jsonify(error.to_dict())
    response.status_code = error.status_code
    return response

#From: https://stackoverflow.com/questions/1265665/how-can-i-check-if-a-string-represents-an-int-without-using-try-except
def represents_int(s):
    try: 
        int(s)
        return True
    except ValueError:
        return False

@app.route('/', methods=['GET'])
def home():
    return render_template('index.html')

@app.route('/api/randomsentences/0/<src>/<tgt>', methods=['GET','POST'])
def random_sentences_default(src, tgt):
    return random_sentences(src, tgt, 50)

@app.route('/api/randomsentences/0/<src>/<tgt>/<num>', methods=['GET','POST'])
def random_sentences(src, tgt, num):
    #raise ValueError('A very specific bad thing happened.')
    #return
    if not represents_int(num) or int(num) < 1 or int(num) > 100:
        raise InvalidUsage('Number of sentences must be a number between 1 and 50', status_code=412)
    include_words_left = request.form.get('includeWordsLeft', '')
    include_words_right = request.form.get('includeWordsRight', '')
    sentence_pairs = get_random_sentence_pairs(src, tgt, int(num), include_words_left, include_words_right)
    return json.dumps(sentence_pairs, ensure_ascii=False)

@app.route('/get_languages', methods=['GET','POST'])
def get_languages():
    with open("languages.json") as file:
        languages=json.load(file)
        return json.dumps(languages)

#Will be executed once to have available language list preprocessed.
@app.route('/get_available_languages_list', methods=['GET','POST'])
def get_available_languages_list():
    
    with open("languages.json") as file:
        languages=json.load(file)

    f = open('available_languages.json', 'w')
    f.write("[\n")

    sql = """SELECT src.lang srclang, tgt.lang tgtlang
FROM sentences src
JOIN links l ON l.src_id = src.id
JOIN sentences tgt ON tgt.id = l.tgt_id
WHERE CHAR_LENGTH(src.sentence) <= 70
AND CHAR_LENGTH(tgt.sentence) <= 70
AND src.lang <> tgt.lang
GROUP BY src.lang, tgt.lang
HAVING count(tgt.id) >= 100
ORDER BY src.lang, tgt.lang
"""
    lines = fetch_all(sql)
    
    for language in languages:
        language["targets"] = []
        for line in lines:
            if language["code"]==line["srclang"]:
                language["targets"].append(line["tgtlang"])
    count = 0  
    for language in languages:
        targets_txt = '","'.join(language["targets"])
        f.write('{"code":"' + language["code"] + '","name":"' + language["name"] + '","targets":["' + targets_txt + '"]}')
        if count < (len(languages) - 1):
            f.write(",\n")
        else:
            f.write("\n")
        count += 1

    f.write("]")
    f.close()
    return json.dumps(languages)

@app.route('/get_available_languages', methods=['GET','POST'])
def get_available_languages():
    with open("available_languages.json") as file:
        languages=json.load(file)
        return json.dumps(languages)
    
app.run()
