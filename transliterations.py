from transliterate import translit

def has_transliteration(tat_code):
    codes = ["hye","ell","kat","rus"]
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

def get_transliteration(tat_lang, txt):
    if tat_lang in ["hye","ell","kat","rus"]:
        tr_lang = get_translit_lang_code(tat_lang)
        return translit(txt, tr_lang, reversed=True)
    return ""
