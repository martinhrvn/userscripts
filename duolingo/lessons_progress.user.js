// ==UserScript==
// @name        Lessons progress
// @namespace   http://rubycoder.org
// @include     https://www.duolingo.com/*
// @version     1
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
  
          var stats = $('<ul class="sidebar-stats"><li><span class="icon icon-words-small">S</span><strong><span id="skill">'+doneSkills+'/'+totalSkills+'</span></strong> Skills</li><li><span class="icon icon-words-small">a</span><strong><span id="skill">'+doneActivities+'/'+totalActivities+'</span></strong> Activities</li></ul>');
          if($('#app').hasClass('home')) {  
            $('.strengthen-skills-container').before(stats);
          }

      } catch(ex) {
        console.log(ex);
      }
  }
  $(document).ready(function() {
		duolingoStats();
	}); 
	
}

