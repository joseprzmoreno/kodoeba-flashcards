import flask
from flask import request, jsonify
import pymysql
import json, random
import configparser

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

def fetch_one(sql):
    db = get_db()
    cur = db.cursor()    
    cur.execute(sql)
    res = cur.fetchone()
    cur.close()
    return res

def get_number_of_sentences():
    sql = "SELECT COUNT(*) total FROM sentences"
    total = fetch_one(sql)["total"]
    return int(total)

def get_random_sentence_pair(src, tgt, number_of_sentences, remove_ids):
    random_index = random.randrange(0, number_of_sentences)
    remove_ids_txt = ",".join(remove_ids)
    sql = """SELECT src.id srcid, src.sentence srcsentence, tgt.sentence tgtsentence
FROM sentences src
JOIN links l ON src.id = l.src_id
JOIN sentences tgt ON tgt.id = l.tgt_id
WHERE src.lang = '{}' AND tgt.lang = '{}' 
AND CHAR_LENGTH(src.sentence) <= 70
AND src.id > {}""".format(src, tgt, random_index)
    if len(remove_ids) > 0:
        sql += " AND src.id NOT IN ({})".format(remove_ids_txt)
    sql += " LIMIT 1"
    result = fetch_one(sql)
    return result

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
    return '''<h1>Kodoeba flashcards app</h1>'''

@app.route('/api/randomsentences/0/<src>/<tgt>', methods=['GET'])
def random_sentences_default(src, tgt):
    return random_sentences(src, tgt, 50)

@app.route('/api/randomsentences/0/<src>/<tgt>/<num>', methods=['GET'])
def random_sentences(src, tgt, num):
    if not represents_int(num) or int(num) < 1 or int(num) > 50:
        raise InvalidUsage('Number of sentences must be a number between 1 and 50', status_code=412) 
    number_of_sentences = get_number_of_sentences()
    sentence_pairs = []
    collected_ids = []
    count = 0
    while count < int(num):
        sentence_pair = get_random_sentence_pair(src, tgt, number_of_sentences, collected_ids)
        if sentence_pair == None:
            break
        else:
            count+=1
            sentence_pairs.append([sentence_pair["srcsentence"],sentence_pair["tgtsentence"]])
            collected_ids.append(str(sentence_pair["srcid"]))
    return json.dumps(sentence_pairs, ensure_ascii=False)

app.run()
