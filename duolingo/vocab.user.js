// ==UserScript==
// @name        Duolingo Vocab
// @namespace   https://github.com/kane77/userscripts
// @include     https://www.duolingo.com/*
// @author      Martin Harvan
// @version     0.1
// @grant GM_getValue
// ==/UserScript==
function inject(f) { //Inject the script into the document
  var script;
  script = document.createElement('script');
  script.type = 'text/javascript';
  script.setAttribute('name', 'vocabulary');
  script.textContent = '(' + f.toString() + ')(jQuery)';
  document.head.appendChild(script);
}
inject(f);
function f($) {
  function duolingoVocab() {
    console.log("running vocab extraction");
    try {
      var sv = true;
      var language = window.duo.user.attributes.learning_language;
      var obj = localStorage['duolingo_vocabulary_'+language];
      if (!obj) {
        obj = {};
      } 
      else {
        obj = JSON.parse(obj);
      }
      if (jQuery('.icon-speaker-small').length) {
        //console.log('Swedish');
      } 
      else {
        //console.log('english')
        sv = false;
      }
      var tokens = jQuery('.token.non-space');
      //console.log(tokens);
      jQuery.each(tokens, function (index, value) {
        var str = '';
        var header = jQuery('#' + value.id + ' ~ span th');
        if (header.length && header[0].innerHTML.trim()) {
          jQuery.each(header, function (i, th) {
            str += ' '+th.innerHTML;
          });
          str.trim();
        };
        var translation = jQuery('#' + value.id + ' ~ span td');
        jQuery.each(translation, function (i, v) {
          //console.log('iterating translations')
          if (!str || i == 0) {
            
          
          var key = sv ? (str ? str : value.innerHTML)  : v.innerHTML;
          var val = sv ? v.innerHTML : (str ? str : value.innerHTML);
            val = val.toLowerCase().trim();
            key = key.toLowerCase().trim();
            if(val === "new word" || !val) {
              return
            }
          if (obj[key]) {
            var arr = obj[key.toLowerCase()]
            arr.push(val.toLowerCase());
            obj[key] = unique(arr);
          } else {
            var arr = new Array();
            arr.push(val.toLowerCase());
            obj[key.toLowerCase()] = unique(arr);
          }};
        });
        //console.log(obj);
        localStorage['duolingo_vocabulary_'+language] = JSON.stringify(obj);
      })
    } catch (ex) {
      //console.log(ex);
    }
  }
  $(document).ready(function () {
    duolingoVocab();
  });
  $(document).ajaxComplete(function () {
    duolingoVocab();
  });

  function unique(arr) {
    var a = arr.concat();
    for (var i = 0; i < a.length; ++i) {
      for (var j = i + 1; j < a.length; ++j) {
        if (a[i] === a[j])
        a.splice(j--, 1);
      }
    }
    return a;
  }
}

