
$(document).ready(function () {

    timeouts = [];
    mustReadAloud = $('#useTts').prop('checked');
    request = undefined;

    function detectIfMustReadAloud()
    {
      var language1 = $('#language1').val();
      var language2 = $('#language2').val();
      if (mustReadAloud && langsWithAudio.includes(language1) && langsWithAudio.includes(language2) && isChrome)
      {
        return true;
      }
      else
      {
        return false;
      }
    }

    //global variables for audio
    var synth = window.speechSynthesis;
    var voices = [];
    var isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
    var langsWithAudio = ["spa","por","fra","ita","eng","deu","rus","hin","cmn","ind","jpn","kor","pol","nld"]; //id,jp,ko,nl,pl
    var langVoices = ["es-US","pt-BR","fr-FR","it-IT","en-US","de-DE","ru-RU","hi-IN","zh-CN","id-ID","ja-JP","ko-KR","pl-PL","nl-NL"];

    $('.transition-radio-group').hide();
    $('#transition-box-1').hide();

    //add event for pressing keys
    $(document).keypress(function (e)
    {
        var code = e.keyCode || e.which;
        if (code == 102)
        {
            $('#btn_next').click();
        }
    });

    $(document).ajaxStart(function ()
    {
        $("#loading").show();
        $('#flashcards-container').hide();
    }).ajaxStop(function ()
    {
        $("#loading").hide();
        $('#flashcards-container').show();
    }).ajaxError(function ()
    {
        $("#loading").hide();
        $('#flashcards-container').show();
    });

    function loadSettings()
    {

        if (localStorage.allTransitionsAutomatic && localStorage.allTransitionsAutomatic == 1)
        {
            $('#allTransitionsAutomatic').prop('checked', true);
        }
        else if (localStorage.allTransitionsAutomatic && localStorage.allTransitionsAutomatic == 0)
        {
            $('#allTransitionsAutomatic').prop('checked', false);
        }
        else
        {
            $('#allTransitionsAutomatic').prop('checked', true);
        }

        if (localStorage.useTts == 1)
        {
            $('#useTts').prop('checked', true);
        }
        else
        {
            $('#useTts').prop('checked', false);
        }

        var params = ["language1", "language2", "flashcardsNum", "autSpeed1", "autSpeed2","trans12Speed", "transpSpeed", "ttsSpeedSrc", "ttsSpeedTgt"];
        var defaults = ["eng", "spa", "50", "71.42", "85.70", "2", "4", "1", "1"];

        for (var i = 0; i < params.length; i++)
        {
            if (localStorage.getItem(params[i]))
            {
                $('#' + params[i]).val(localStorage.getItem(params[i]));
            }
            else
            {
                $('#' + params[i]).val(defaults[i]);
            }
        }

        var params = ["trans12", "transp"];
        var defaults = ["seconds", "seconds"];

        for (var i = 0; i < params.length; i++)
        {
            if (localStorage.getItem(params[i]))
            {
                var titleParam = localStorage.getItem(params[i])[0].toUpperCase() +
                    localStorage.getItem(params[i]).slice(1);

                $('#' + params[i] + titleParam).prop('checked', true);
            }
            else
            {
                  $('#' + params[i] + "Seconds").prop('checked', true);
            }
        }
    }

    function sortLanguages(arr)
    {
        arr.sort(function (a, b)
        {
            if (a.name < b.name)
                return -1;
            if (a.name > b.name)
                return 1;
            return 0;
        });
        return arr;
    }

    function getLanguageName(code)
    {
        var languages = JSON.parse($('#allLanguages').val());
        for (var i = 0; i < languages.length; i++)
        {
            if (languages[i].code == code)
            {
                return languages[i].name;
            }
        }
        return "unnamed";
    }

    function notify(text, kind)
    {
        $.notify({
            message: text
        },
                {
                    type: kind,
                    z_index: 1100
                });
    }

    function validates()
    {
        var validates = true;
        var errorMessage = "";
        var automatic = $('#allTransitionsAutomatic').prop('checked');

        if (!automatic)
        {
            var transitionBetweenFlashcards = $('input[name=trans12]:checked').val();
            var transitionBetweenPairs = $('input[name=transp]:checked').val();
            var TBFSeconds = $('#trans12Speed').val();
            var TBPSeconds = $('#transpSpeed').val();

            if (transitionBetweenFlashcards == "seconds" && transitionBetweenPairs == "seconds" && TBPSeconds <= TBFSeconds)
            {
                validates = false;
                errorMessage += "The seconds for transition between pairs must be greater than the seconds for transition between flashcards\n";
            }
        }

        var numFlashcards = parseInt($('#flashcardsNum').val());
        if (numFlashcards < 1 || numFlashcards > 100)
        {
            validates = false;
            errorMessage += "The number of flashcard pairs must be a number between 10 and 50\n";
        }

        return {"validates": validates, "errorMessage": errorMessage};
    }

    //standardized apostrophe and quotes (otherwise it causes an error in speech synthesis)
    function sanitizeApostrophe(text)
    {
    		var sign = "'";
        var signHtml = "&#39;";
        var quotes = "&#34;";
    		var re = new RegExp(sign, "g");
        var re2 = new RegExp(signHtml, "g");
        var re3 = new RegExp(quotes, "g");
        text = text.replace(re, "’");
        text = text.replace(re2, "’");
        text = text.replace(re3, '"');
        return text;
    }

    //function that generates speech synthesis (web speech api)
    function speak(language, txt, speedRate) {
    	 voices = synth.getVoices();
         var u = new SpeechSynthesisUtterance(txt);

         if (speedRate==undefined)
         {
           speedRate = 1;
         }
         if (speedRate > 4.0)
         {
           speedRate = 4.0;
         }
         if (speedRate < 0.25)
         {
           speedRate = 0.25;
         }
         u.rate = speedRate;

    	 for (i=0;i<voices.length;i++) {
    		if (voices[i].lang == language) {
    			u.voice = voices[i];
    			break;
    		}
    	 }
         synth.speak(u);
         u.onend = function(event) {
             $('#btn_next').click();
         }
    }


    //populate selects
    $.ajax(
    {
        url: "get_available_languages",
        type: "POST",
        cache: false,
        dataType: "json",
        success: function (languages) {
            languages = sortLanguages(languages);
            var html = "";
            for (var i = 0; i < languages.length; i++)
            {
                var language = languages[i];
                if (language.targets.length > 1 || (language.targets.length == 1 && language.targets[0] != ""))
                {
                    html += "<option value='" + language.code + "'>" + language.name + "</option>";
                }
            }
            $("#language1").html(html);
            $('#language1').val("eng");
            $("#allLanguages").val(JSON.stringify(languages));
            if (localStorage.language1)
            {
              $('#language1').val(localStorage.language1);
              getAvailableLanguages(localStorage.language1);
              $('#language2').val(localStorage.language2);
            }
            else
            {
              $('#language1').val("eng");
              getAvailableLanguages("eng");
              $('#language2').val("spa");
              localStorage.language1 = "eng";
              localStorage.language2 = "spa";
            }
        }
    });

    $('#language1').change(function ()
    {
        localStorage.language1 = $('#language1').val();
        getAvailableLanguages($("#language1").val());
    });

    $('#language2').change(function ()
    {
        localStorage.language2 = $('#language2').val();
    });

    $('#flashcardsNum').mouseup(function ()
    {
        localStorage.flashcardsNum = $('#flashcardsNum').val();
    });

    $('#flashcardsNum').keyup(function ()
    {
        localStorage.flashcardsNum = $('#flashcardsNum').val();
    });

    $('#autSpeed1').mouseup(function ()
    {
        localStorage.autSpeed1 = $('#autSpeed1').val();
    });

    $('#autSpeed1').keyup(function ()
    {
        localStorage.autSpeed1 = $('#autSpeed1').val();
    });

    $('#autSpeed2').mouseup(function ()
    {
        localStorage.autSpeed2 = $('#autSpeed2').val();
    });

    $('#autSpeed2').keyup(function ()
    {
        localStorage.autSpeed2 = $('#autSpeed2').val();
    });

    $('#trans12Speed').mouseup(function ()
    {
        localStorage.trans12Speed = $('#trans12Speed').val();
    });

    $('#trans12Speed').keyup(function ()
    {
        localStorage.trans12Speed = $('#trans12Speed').val();
    });

    $('#transpSpeed').mouseup(function ()
    {
        localStorage.transpSpeed = $('#transpSpeed').val();
    });

    $('#transpSpeed').keyup(function ()
    {
        localStorage.transpSpeed = $('#transpSpeed').val();
    });

    $('input:radio[name="trans12"]').change(function ()
    {
        localStorage.trans12 = $('input[name=trans12]:checked').val();
    });

    $('input:radio[name="transp"]').change(function ()
    {
        localStorage.transp = $('input[name=transp]:checked').val();
    });

    $('#ttsSpeedSrc').mouseup(function ()
    {
        localStorage.ttsSpeedSrc = $('#ttsSpeedSrc').val();
    });

    $('#ttsSpeedSrc').keyup(function ()
    {
        localStorage.ttsSpeedSrc = $('#ttsSpeedSrc').val();
    });

    $('#ttsSpeedTgt').mouseup(function ()
    {
        localStorage.ttsSpeedTgt = $('#ttsSpeedTgt').val();
    });

    $('#ttsSpeedTgt').keyup(function ()
    {
        localStorage.ttsSpeedTgt = $('#ttsSpeedTgt').val();
    });

    function getAvailableLanguages(srcLang)
    {
        var allLanguages = JSON.parse($('#allLanguages').val());
        var html = "";
        for (var i = 0; i < allLanguages.length; i++)
        {
            var language = allLanguages[i];
            if (language.code == srcLang)
            {
                var targetLanguages = [];
                for (var j = 0; j < language.targets.length; j++)
                {
                    var target = language.targets[j];
                    var name = getLanguageName(target);
                    targetLanguages.push({"code": target, "name": name});
                }

                targetLanguages = sortLanguages(targetLanguages);

                for (var j = 0; j < targetLanguages.length; j++)
                {
                    var target = targetLanguages[j];
                    html += "<option value='" + target.code + "'>" + target.name + "</option>";
                }
                $('#language2').html(html);
            }
        }
    }

    function showFlashcards(sentencePairs)
    {

        var automatic = $('#allTransitionsAutomatic').prop('checked');
        var automaticSpeed1 = $('#autSpeed1').val();
        var automaticSpeed2 = $('#autSpeed2').val();
        var transitionBetweenFlashcards = $('input[name=trans12]:checked').val();
        var transitionBetweenPairs = $('input[name=transp]:checked').val();
        var TBFSeconds = $('#trans12Speed').val();
        var TBPSeconds = $('#transpSpeed').val();
        var totalTime = (TBPSeconds * 1000 * (sentencePairs.length + 1) + TBFSeconds * 1000);

        if (automatic)
        {
            totalTime = 0;
        }

        $('#btn_stop').click();
        $('#btn_start').prop('disabled', true);

        if (automatic)
        {
          if (!detectIfMustReadAloud())
          {

              $('#btn_next').prop('disabled', true);
              $('#transition-box-1').hide();

              var transitionsBetweenFlashcards = [];
              var transitionsBetweenPairs = [0];
              var accumulatedTime = 0;

              for (var i = 0; i < sentencePairs.length; i++)
              {
                  var sentencePair = sentencePairs[i];
                  var transitionBF = Math.ceil(automaticSpeed1 * sentencePair.src_sentence.length);

                  //set a minimum time
                  if (transitionBF < 600)
                  {
                      transitionBF = 600;
                  }

                  accumulatedTime += transitionBF;
                  transitionsBetweenFlashcards.push(accumulatedTime);

                  var transitionBP = Math.ceil(automaticSpeed2 * sentencePair.tgt_sentence.length);
                  if (transitionBP < 600)
                  {
                      transitionBP = 600;
                  }
                  accumulatedTime += transitionBP;
                  transitionsBetweenPairs.push(accumulatedTime);

                  totalTime += transitionBF + transitionBP;
              }

              for (var i = 0; i < sentencePairs.length; i++)
              {
                  var sentencePair = sentencePairs[i];
                  eval("timeouts.push(setTimeout(function(){showFlashcard('" + escape(sentencePair.src_sentence) +
                  "','" + escape(sentencePair.src_translit) + "','left-flashcard')}," + (transitionsBetweenPairs[i]) + "));");
                  eval("timeouts.push(setTimeout(function(){showFlashcard('" + escape(sentencePair.tgt_sentence) +
                  "','" + escape(sentencePair.tgt_translit) + "','right-flashcard')}," + (transitionsBetweenFlashcards[i]) + "));");
                  if (i < (sentencePairs.length - 1))
                  {
                      eval("timeouts.push(setTimeout(function(){showFlashcard('','','right-flashcard')}," + (transitionsBetweenPairs[i + 1]) + "));");
                  }
              }
              timeouts.push(setTimeout(function ()
              {
                  normalize()
              }, totalTime));
          }
          else
          {
            $('#btn_next').prop('disabled', false);
            var nextPair = 0;
            nextPlace = "left-flashcard";

            $('#btn_next').click(function (e)
            {
                e.preventDefault();
                if (nextPair >= sentencePairs.length)
                {
                    normalize();
                }
                else
                {
                    if (nextPlace == "left-flashcard")
                    {
                          showFlashcard(escape(sentencePairs[nextPair].src_sentence), escape(sentencePairs[nextPair].src_translit), 'left-flashcard');
                          $('#right-flashcard').html('');
                    }
                    else
                    {
                        showFlashcard(escape(sentencePairs[nextPair].tgt_sentence), escape(sentencePairs[nextPair].tgt_translit), 'right-flashcard');
                        nextPair++;
                    }
                    nextPlace = changePlace();
                }
             });

             $('#btn_next').click();

           }
        }
        else
        {
            if (transitionBetweenPairs == "seconds" && (transitionBetweenFlashcards == "seconds" || transitionBetweenFlashcards == "instantly"))
            {
                if (transitionBetweenFlashcards == "instantly")
                {
                    TBFSeconds = 0;
                }
                $('#btn_next').prop('disabled', true);
                $('#transition-box-1').hide();

                for (var i = 0; i < sentencePairs.length; i++)
                {
                    var sentencePair = sentencePairs[i];
                    eval("timeouts.push(setTimeout(function(){showFlashcard('" + escape(sentencePair.src_sentence) + "','" + escape(sentencePair.src_translit) + "','left-flashcard')}," + ((TBPSeconds) * i * 1000) + "));");
                    eval("timeouts.push(setTimeout(function(){showFlashcard('" + escape(sentencePair.tgt_sentence) + "','" + escape(sentencePair.tgt_translit) + "','right-flashcard')}," + (((TBPSeconds) * i * 1000) + TBFSeconds * 1000) + "));");
                    eval("timeouts.push(setTimeout(function(){showFlashcard('','','right-flashcard')}," + (((TBPSeconds) * i * 1000) + TBPSeconds * 1000) + "));");
                }
                timeouts.push(setTimeout(function ()
                {
                    normalize()
                }, totalTime));

            }

            if (transitionBetweenPairs == "button" && transitionBetweenFlashcards == "button")
            {
                $('#btn_next').prop('disabled', false);
                $('#transition-box-1').show();

                var nextPair = 0;
                nextPlace = "left-flashcard";

                $('#btn_next').click(function (e)
                {
                    e.preventDefault();
                    if (nextPair >= sentencePairs.length)
                    {
                        normalize();

                    }
                    else
                    {
                        if (nextPlace == "left-flashcard")
                        {
                            showFlashcard(escape(sentencePairs[nextPair].src_sentence), escape(sentencePairs[nextPair].src_translit),'left-flashcard');
                            $('#right-flashcard').html('');
                        }
                        else
                        {
                            showFlashcard(escape(sentencePairs[nextPair].tgt_sentence), escape(sentencePairs[nextPair].tgt_translit), 'right-flashcard');
                            nextPair++;
                        }
                        nextPlace = changePlace();
                    }

                });
                $('#btn_next').click();

            }

            if (transitionBetweenPairs == "button" && transitionBetweenFlashcards == "instantly")
            {
                $('#btn_next').prop('disabled', false);
                $('#transition-box-1').show();
                nextPair = 0;
                $('#btn_next').click(function (e)
                {
                    e.preventDefault();
                    if (nextPair >= sentencePairs.length)
                    {
                        $('#btn_stop').click();
                    }
                    else
                    {
                        showFlashcard(escape(sentencePairs[nextPair].src_sentence), escape(sentencePairs[nextPair].src_translit), 'left-flashcard');
                        showFlashcard(escape(sentencePairs[nextPair].tgt_sentence), escape(sentencePairs[nextPair].tgt_translit), 'right-flashcard');
                        nextPair++;
                    }

                });
                $('#btn_next').click();

            }

            if (transitionBetweenPairs == "button" && transitionBetweenFlashcards == "seconds")
            {
                $('#btn_next').prop('disabled', false);
                $('#transition-box-1').show();
                nextPair = 0;
                $('#btn_next').click(function (e)
                {
                    e.preventDefault();
                    if (nextPair >= sentencePairs.length)
                    {
                        normalize();
                    }
                    else
                    {
                        for (var i = 0; i < timeouts.length; i++)
                        {
                            clearTimeout(timeouts[i]);
                        }
                        timeouts = [];
                        showFlashcard(escape(sentencePairs[nextPair].src_sentence), escape(sentencePairs[nextPair].src_translit), 'left-flashcard');
                        $('#right-flashcard').html('');
                        eval("timeouts.push(setTimeout(function(){showFlashcard('" + escape(sentencePairs[nextPair].tgt_sentence) + "','" + escape(sentencePairs[nextPair].tgt_translit) + "','right-flashcard')}," + (TBFSeconds * 1000) + "));");
                        nextPair++;
                    }

                });
                $('#btn_next').click();
            }

            if (transitionBetweenPairs == "seconds" && transitionBetweenFlashcards == "button")
            {
                nextPair = -1;
                for (var i = 0; i < sentencePairs.length; i++)
                {
                    $('#btn_next').prop('disabled', false);
                    $('#transition-box-1').show();
                    eval("timeouts.push(setTimeout(function(){showFlashcard('" + escape(sentencePairs[i].src_sentence) + "','" + escape(sentencePairs[i].src_translit) + "','left-flashcard'),nextPair++}," + ((TBPSeconds) * i * 1000) + "));");
                    eval("timeouts.push(setTimeout(function(){showFlashcard('','','right-flashcard')}," + (((TBPSeconds) * i * 1000) + TBPSeconds * 1000) + "));");

                }
                timeouts.push(setTimeout(function ()
                {
                    normalize()
                }, totalTime));


                $('#btn_next').click(function (e)
                {
                    e.preventDefault();
                    if (nextPair >= 0)
                    {
                        showFlashcard(escape(sentencePairs[nextPair].tgt_sentence), escape(sentencePairs[nextPair].tgt_translit) , 'right-flashcard');
                    }

                });

            }
        }
    }

    function showFlashcard(txt, translit, whichFlashcard)
    {
        var html = "<div class='sentence'>" + txt + "</div>";

        if (translit !== '')
        {
          html += "<div class='transliteration'>" + translit + "</div>";
        }

        $('#' + whichFlashcard).html(html);

        if (detectIfMustReadAloud())
        {

            var language1 = $('#language1').val();
            var language2 = $('#language2').val();

            if (whichFlashcard == 'left-flashcard')
            {
                var language = language1;
                var speed = $('#ttsSpeedSrc').val();
            }
            else
            {
                var language = language2;
                var speed = $('#ttsSpeedTgt').val();
            }

            var languageChr = langVoices[langsWithAudio.indexOf(language)];
            speak(languageChr, sanitizeApostrophe(txt), speed);
        }

    }

    function normalize()
    {
        $('#left-flashcard').html('');
        $('#right-flashcard').html('');
        $('#btn_start').prop('disabled', false);
        $('#transition-box-1').hide();
        $('#btn_next').prop('disabled', true);
        $('#btn_next').unbind();
    }

    function escape(txt)
    {
        txt = txt.replace(/\'/g, "&#39;");
        txt = txt.replace(/\"/g, '&#34;');
        txt = txt.replace(/\</g, "&lt;");
        txt = txt.replace(/\</g, "&gt;");
        return txt;
    }

    function changePlace()
    {
        if (nextPlace == "left-flashcard")
        {
            return "right-flashcard";
        }
        else
        {
            return "left-flashcard";
        }
    }

    function showNoSentencesMessage()
    {
        notify('There are no sentence pairs for those criteria.','warning');
    }

    $('#allTransitionsAutomatic').click(function (e)
    {
        if ($(this).prop('checked'))
        {
            localStorage.allTransitionsAutomatic = 1;
            $('.transition-radio-group').hide();
            $('#tts_box').show();
            $('#useTts').prop('checked', true);
        }
        else
        {
            localStorage.allTransitionsAutomatic = 0;
            $('.transition-radio-group').show();
            $('#tts_box').hide();
            $('#useTts').prop('checked', false);
        }
    });

    $('#useTts').click(function (e)
    {
        if ($(this).prop('checked'))
        {
            mustReadAloud = true;
            localStorage.useTts = 1;
        }
        else
        {
            mustReadAloud = false;
            localStorage.useTts = 0;
        }
    });

    $('#btn_stop').click(function (e)
    {
        e.preventDefault();
        for (var i = 0; i < timeouts.length; i++)
        {
            clearTimeout(timeouts[i]);
        }
        timeouts = [];
        normalize();
    });

    $('#btn_start').click(function (e)
    {

        e.preventDefault();
        if ($('#collapseOne').is(":visible"))
        {
          $('#btn-collapse').click();
        }
        $('.flashcard').html('');

        for (var i = 0; i < timeouts.length; i++)
        {
            clearTimeout(timeouts[i]);
        }
        timeouts = [];

        var validation = validates();

        if (!validation.validates)
        {
            notify(validation.errorMessage, 'warning');
            return false;
        }

        var language1 = $('#language1').val();
        var language2 = $('#language2').val();
        var numFlashcards = parseInt($('#flashcardsNum').val());
        var includeWordsLeft = $('#includeWordsLeft').val();
        var includeWordsRight = $('#includeWordsRight').val();

        //get sentence pairs
        request = $.ajax(
        {
            url: "api/randomsentences/0/" + language1 + "/" + language2 + "/" + numFlashcards,
            type: "POST",
            cache: false,
            dataType: "json",
            data: {
              'includeWordsLeft': includeWordsLeft,
              'includeWordsRight': includeWordsRight
            },
            success: function (sentencePairs) {
              if (sentencePairs.length > 0)
              {
                  showFlashcards(sentencePairs)
              }
              else
              {
                  showNoSentencesMessage();
              }
            },
            error: function (xhr, status, error) {
                var err = eval("(" + xhr.responseText + ")");
                alert(err.Message);
            }
        });
    });

    //localStorage
    loadSettings();
    if ($('#allTransitionsAutomatic').prop('checked') === true)
    {
        $('.transition-radio-group').hide();
        $('#tts_box').show();
        $('#useTts').prop('checked', true);
    }
    else
    {
        $('.transition-radio-group').show();
        $('#tts_box').hide();
        $('#useTts').prop('checked', false);
    }



});
