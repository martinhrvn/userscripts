// ==UserScript==
// @name        Duolingo Course Progress
// @namespace   https://github.com/kane77/userscripts
// @include     https://www.duolingo.com/*
// @version     1.3
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
  function duolingoStats() {
      try {

          var langData = window.duo.user.attributes.language_data[window.duo.user.attributes.learning_language]; 
          var totalSkills = langData.skills.models.length;
          var doneSkills = 0;
          var totalActivities = 0;
          var doneActivities = 0;
          
        
          for(var i = 0; i < langData.skills.models.length; i++) {
            var skill = langData.skills.models[i];
            totalActivities += skill.attributes.num_lessons;
            doneActivities += skill.attributes.num_lessons - skill.attributes.missing_lessons;
            if(skill.attributes.missing_lessons == 0) {
              doneSkills += 1;
            }
          }
          var lessonPercent = Math.round(doneActivities / totalActivities * 100);
          var skillPercent = Math.round(doneSkills / totalSkills * 100);
          var stats = $('<ul class="sidebar-stats lesson-progress"><li title="'+ skillPercent +'%"><span class="icon icon-words-small">S</span><strong><span id="skill">'+doneSkills+'/'+totalSkills+'</span></strong> Skills</li><li title="'+ lessonPercent +'%"><span class="icon icon-words-small">a</span><strong><span id="skill">'+doneActivities+'/'+totalActivities+'</span></strong> Lessons</li></ul>');
          if($('#app').hasClass('home') && !$('.lesson-progress').length) {  
            $('.strengthen-skills-container').before(stats);
          }

      } catch(ex) {
        console.log(ex);
      }
  }
  $(document).ready(function() {
		duolingoStats();
	}); 

    $(document).ajaxComplete(function() {
		duolingoStats();
	});
	

}

