// ==UserScript==
// @name        Duolingo Course Progress
// @namespace   https://github.com/kane77/userscripts
// @include     https://www.duolingo.com/*
// @version     1.6
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
            var lessonPercent = Math.round(doneActivities / totalActivities * 100);
            var skillPercent = Math.round(doneSkills / totalSkills * 100);
            
            var skillElem = createElem(doneSkills, totalSkills, skillPercent, "Skills", "S");
            var lessonElem = createElem(doneActivities, totalActivities, lessonPercent, "Lessons", "L");
            
            var stats = $('<ul class="sidebar-stats lesson-progress"></ul>');
            skillElem.appendTo(stats);
            lessonElem.appendTo(stats);
            if ($('#app').hasClass('home') && !$('.lesson-progress').length) {
                $('.strengthen-skills-container').before(stats);
            }
        } catch (ex) {
            console.log(ex);
        }
    }
    
    function createElem(doneCount, totalCount, percent, name, icon) {
        var elemText = $('<span id="'+ name +'_text"><strong>' + doneCount + '/' + totalCount + '</strong> '+name+'</span>'); 
        var percentage = $('<span id="'+name+'_percent"><strong>' + percent + '%</strong></span>'); 
        percentage.hide();
        var elem = $('<li style="text-align: left; display: block; margin-top: 2px;" id="'+name+'_stats" title="' + percent + '%"><span class="icon icon-words-small '+name+'-icon">'+icon+'</span></li>');
        elem.append(elemText);
        elem.append(percentage);
        
        
        
        $('.'+name+'-icon').mouseover(function() {
            $('#'+name+'_text').hide();
            $('#'+name+'_percent').show();
            
        })
        .mouseout(function() {
            $('#'+name+'_percent').hide();
            $('#'+name+'_text').show();
        });   
        
        return elem;
    }
    
    $(document).ready(function () {
        duolingoStats();
    });
    $(document).ajaxComplete(function () {
        duolingoStats();
    });
}

