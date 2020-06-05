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
    
    return pymysql.connect(host='localhost', port=3306, user=user, password=password, db='tatoebakrs')

def fetch_all(sql):
    db = get_db()
    cur = db.cursor()    
    cur.execute(sql)
    ress = cur.fetchall()
    cur.close()
    return ress

@app.route('/', methods=['GET'])
def home():
    return '''<h1>Kodoeba flashcards app</h1>'''

@app.route('/api/randomsentences/0/<src>/<tgt>/<num>', methods=['GET'])
def random_sentences(src, tgt, num=50):
    results = []
    sql = """SELECT src.sentence srcsentence, tgt.sentence tgtsentence
FROM sentences src
JOIN links l ON src.id = l.src_id
JOIN sentences tgt ON tgt.id = l.tgt_id
WHERE src.lang = '{}' AND tgt.lang = '{}' 
AND CHAR_LENGTH(src.sentence) <= 70
ORDER BY RAND() LIMIT {}
""".format(src, tgt, num)    
    results = fetch_all(sql)
    return json.dumps(results, ensure_ascii=False)

app.run()

