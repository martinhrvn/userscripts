// ==UserScript==
// @name        Duolingo Course Progress
// @namespace   https://github.com/kane77/userscripts
// @include     https://www.duolingo.com/*
// @author      Martin Harvan
// @version     2.3
// @grant GM_getValue
// ==/UserScript==
function inject(f) { //Inject the script into the document
  var script;
  script = document.createElement('script');
  script.type = 'text/javascript';
  script.setAttribute('name', 'lesson_stats');
  script.textContent = '(' + f.toString() + ')(jQuery)';
  document.head.appendChild(script);
}
inject(f);
function f($) {
  courseProgress = {};
  function duolingoStats() {
    try {
      var language = window.duo.user.attributes.learning_language;
      var from = duo.user.attributes.ui_language;
      var lang_key = language + '_' + from;
      var langData = window.duo.user.attributes.language_data[language];
      var totalSkills = langData.skills.models.length;
      var doneSkills = 0;
      var totalActivities = 0;
      var doneActivities = 0;
      for (var i = 0; i < langData.skills.models.length; i++) {
        var skill = langData.skills.models[i];
        totalActivities += skill.attributes.num_lessons;
        doneActivities += skill.attributes.num_lessons - skill.attributes.missing_lessons;
        if (skill.attributes.missing_lessons === 0) {
          doneSkills += 1;
        }
      }
      if (langData.bonus_skills) {
        totalSkills += langData.bonus_skills.length;
        for (var i = 0; i < langData.bonus_skills.models.length; i++) {
          var skill = langData.bonus_skills.models[i];
          totalActivities += skill.attributes.num_lessons;
          doneActivities += skill.attributes.num_lessons - skill.attributes.missing_lessons;
          if (skill.attributes.missing_lessons === 0) {
            doneSkills += 1;
          }
        }
      }
      readDCPIItems(lang_key);
      storeDCPItems(new Date(), doneSkills, doneActivities, lang_key);
      var lessonPercent = Math.round(doneActivities / totalActivities * 100);
      var skillPercent = Math.round(doneSkills / totalSkills * 100);
      var skillElem = createElem(doneSkills + "/" + totalSkills, skillPercent + "%", 'Skills', 'S');
      var lessonElem = createElem(doneActivities + "/" + totalActivities, lessonPercent + "%", 'Lessons', 'L');
      var stats = $('<div class="sidebar-stats lesson-progress strengthen-skills-container "></div>');
      skillElem.appendTo(stats);
      lessonElem.appendTo(stats);
      var lessonDiff = (doneActivities - parseInt(getLSItem('lessons', lang_key, 0)));
      if (lessonDiff > 0) {
        // console.log("Started " + getLSItem('date', lang_key, 0));
        var timeDiff = (new Date() - new Date(getLSItem('date', lang_key, 0)));
        var timePerLesson = timeDiff / lessonDiff;
        var estTime = (totalActivities - doneActivities) * timePerLesson;
        var finishDate = new Date(new Date().getTime() + estTime).toLocaleDateString();
        var days = Math.round(estTime / (1000 * 3600 * 24));
        if (!$('#estimate_stats').length) {

          var estText = createElem(finishDate, days + " days remaining", "Estimate", "E" );
          estText.appendTo(stats);
        }
      }
      if ($('#app').hasClass('home') && !$('.lesson-progress').length) {
        $('#weekly-progress').after(stats);
      }
    } catch (ex) {
      console.log(ex);
    }
  }
  function createElem(normalText, altText, name, icon) {
    var elemText = $('<span id="' + name + '_text"><strong>' + normalText + '</strong> ' + name + '</span>');
    var percentage = $('<span id="' + name + '_percent"><strong>' + altText + '</strong></span>');
    percentage.hide();
    var elem = $('<li style="text-align: left; display: block; margin-top: 2px;" id="' + name + '_stats" title="' + altText + '"><span class="icon icon-words-small ' + name + '-icon">' + icon + '</span></li>');
    elem.append(elemText);
    elem.append(percentage);
    $('.' + name + '-icon').mouseover(function () {
      $('#' + name + '_text').hide();
      $('#' + name + '_percent').css('display', 'inline-block');
    }).mouseout(function () {
      $('#' + name + '_percent').hide();
      $('#' + name + '_text').show();
    });
    return elem;
  }
  $(document).ready(function () {
    duolingoStats();
  });
  $(document).ajaxComplete(function () {
    duolingoStats();
  });
  function getLSItem(name, language, id) {
    // console.log("GET "+ name + " " + language);
    if (!(name in courseProgress)) {
      return null;
    }
    if (typeof id !== 'undefined') {
      return courseProgress[name][id];
    } else {
      return courseProgress[name];
    }
  }
  function setLSItem(name, language, id, value) {
    // console.log("SET "+ name + " " + language);
    if (!(name in courseProgress)) {
      courseProgress[name] = [];
    }
    courseProgress[name][id] = value;
  }
  function roundDate(date)
  {
    ndate = new Date(date)
    ndate.setHours(0);
    ndate.setMinutes(0);
    ndate.setSeconds(0);
    ndate.setMilliseconds(0);
    return ndate;
  }
  function storeDCPItems(date, skills, lessons, language) {
    var lastIndex = getLSItem('last_index', language);
    if (lastIndex == null) {
      lastIndex = 0;  // New course
    } else {
      if (lessons <= parseInt(getLSItem('lessons', language, lastIndex)) &&
      skills <= parseInt(getLSItem('skills', language, lastIndex))) {
        return;
      }
      if (roundDate(date) != roundDate(new Date(getLSItem('date', language, lastIndex)))) {
        lastIndex++;
      }
    }
    setLSItem('date', language, lastIndex, date);
    setLSItem('skills', language, lastIndex, skills);
    setLSItem('lessons', language, lastIndex, lessons);
    courseProgress['last_index'] = lastIndex;
    // console.log("===========");
    // console.log("Saving "+ language);
    // console.log("Saved "+ JSON.stringify(courseProgress));
    localStorage.setItem("dcp_" + language, JSON.stringify(courseProgress));
  }
  function readDCPIItems(language) {
    var _progressJSON = localStorage.getItem("dcp_" + language);
    // console.log("===========");
    // console.log("Reading "+ language);
    // console.log(_progressJSON);
    _progress = JSON.parse(_progressJSON);
    if (null != _progress) {
      courseProgress = _progress;
    }
    // console.log("READ "+ JSON.stringify(courseProgress));
  }
}

