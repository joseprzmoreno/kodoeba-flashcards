from transliterate import translit
import pinyin
from hangul_romanize import Transliter
from hangul_romanize.rule import academic
from pykakasi import kakasi,wakati

def has_transliteration(tat_code):
    codes = ["hye","ell","kat","rus","cmn","kor","jpn"]
    if tat_code in codes:
        return True
    return False

def get_translit_language_codes():
    tat = ["hye","ell","kat","rus"]
    tra = ["hy","el","ka","ru"]
    return [tat,tra]

def get_translit_lang_code(tat_code):
    codes = get_translit_language_codes()
    count=0
    for code in codes[0]:
        if code==tat_code:
            return codes[1][count]
        count+=1

def get_pinyin(txt):
    txt2 = ""
    for character in txt:
        txt2 += character + " "
    return pinyin.get(txt2)

def get_hangul(txt):
    transliter = Transliter(academic)
    return transliter.translit(txt)

def get_romaji(txt):
    kakasi_ = kakasi()
    kakasi_.setMode("H","a") # Hiragana to ascii, default: no conversion
    kakasi_.setMode("K","a") # Katakana to ascii, default: no conversion
    kakasi_.setMode("J","a") # Japanese to ascii, default: no conversion
    kakasi_.setMode("r","Hepburn") # default: use Hepburn Roman table
    kakasi_.setMode("s", True) # add space, default: no separator
    kakasi_.setMode("C", True) # capitalize, default: no capitalize
    conv = kakasi_.getConverter()
    result = conv.do(txt)
    return result

def get_transliteration(tat_lang, txt):
    if tat_lang in ["hye","ell","kat","rus"]:
        tr_lang = get_translit_lang_code(tat_lang)
        return translit(txt, tr_lang, reversed=True)
    elif tat_lang == "cmn":
        return get_pinyin(txt)
    elif tat_lang == "kor":
        return get_hangul(txt)
    elif tat_lang == "jpn":
        return get_romaji(txt)
    return ""
