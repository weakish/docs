// $(function(){

// });


// $(body).html($com)
function refactDom() {
  $("pre.prettyprint code").each(function (index, ele) {
    var githubRegex = /(?:https?:\/\/github\.com)/i;
    var url = getPlayUrl(ele);
    var actions = $("<div class='doc-example-action'><button class='copybtn' title='复制'><span class='icon icon-clipboard'></span></button></div>");
    if (url) {
      if (url.match(githubRegex)) {
        actions.prepend("<a class='runbtn' href='" + url + "' target='_blank' title='在 GitHub 中查看'><span class='icon icon-github'></span></a>");
      } else {
        actions.prepend("<a class='runbtn' href='" + url + "' target='_blank' title='运行'><span class='icon icon-console-run'></span></a>");
      }
    }
    $(ele).after(actions);
    var appsStr = " <div class='doc-example-selector' ng-show='apps.length' ><span>选择应用 <select ng-model='pageState.currentApp' ng-options='app.app_name for app in apps'></select></span>";
    if ($(ele).text().indexOf('{{appid}}') > -1) {
      $(ele).after(appsStr);
    }
  });
}



function prettyPrepare() {
  var noPrettyLangSpec = ['mermaid', 'seq', 'sequence'];
  // var pres = document.getElementsByTagName("pre");
  // for (var i = 0; i < pres.length; i++) {
  //   pres[i].className = "prettyprint";
  // }

  $.each($('pre'), function () {
    var pre = $(this);
    pre.find('code').each(function () {
      var code = $(this);
      var noPretty = false;
      noPrettyLangSpec.forEach(function (lang) {
        if (code.hasClass('lang-' + lang)) {
          noPretty = true;
        }
      });
      if (!noPretty) {
        pre.addClass('prettyprint');
      }
    });
  });
}

function glueCopy() {
  $(function () {
    var clip = new ZeroClipboard();
    clip.glue($(".copybtn"));
    clip.on("mousedown", function (client, args) {
      $(this).parents("pre.prettyprint").removeClass("active");
      clip.setText($(this).parents("pre").find("code").text());
    });
    clip.on("complete", function () {
      $(this).parents("pre.prettyprint").addClass("active");
    });
    clip.on('noflash', function () {
      $(".copybtn").hide();
    });
  });
}

function getPlayUrl(codeTag) {
  var COMMENT_OF_AN_URL = /^\/\/\s*(https?\:\/\/\S+)$/i;
  var code = codeTag.innerHTML.trim();
  var lastBreak = code.lastIndexOf('\n');
  if (lastBreak === -1) {
    return;
  }
  var lastLine = code.slice(lastBreak).trim();
  var results = lastLine.match(COMMENT_OF_AN_URL);
  if (!results) {
    return;
  }
  var url = results[1];
  codeTag.innerHTML = code.slice(0, lastBreak);
  return url;
}


var codeBlockTabber = (function () {
  'use strict';

  // save some bytes
  var w = window,
    d = document;

  function uniqArr(a) {
    var seen = {};
    return a.filter(function (item) {
      return seen.hasOwnProperty(item) ? false : (seen[item] = true);
    });
  }

  function getHashCode(str) {
    var hash = 0,
      i, chr;
    if (str.length === 0) return hash;
    for (i = 0; i < str.length; i++) {
      chr = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
  };

  function checkApiName(targetLang) {
    // update api name or class name by language
    var currentLang = targetLang.split('-').pop();

    // check inline code
    $.each($('code'), function () {
      if (autoSwitchApiName) {
        var code = $(this);
        var codeContent = code.html().toString();

        var codeId = code.data("codeId");
        var codeData = $('.' + codeId).data(currentLang);
        if (codeData) {
          code.html(codeData);
        }
      }
    });
  }

  function toggleLangSpec(targetLang) {
    var currentLang = targetLang.split('lang-').pop();
    $.each($('.lang-spec-start'), function () {
      const $this = $(this);
      var content = $this.nextUntil('.lang-spec-end');
      if ($this.hasClass(currentLang)) {
        content.show();
      } else {
        content.hide();
      }
    });
  }

  function prettyGraph() {

    var options = {
      theme: 'simple'
    };

    var $ds = $(".lang-seq");
    $ds.parent().removeClass('prettyprint').removeClass('prettyprinted');
    $ds.parent().addClass('no-pre-style');
    $ds.sequenceDiagram(options);


    $.each($('.lang-mermaid'), function () {
      $(this).parent().removeClass('prettyprint').removeClass('prettyprinted');
      $(this).parent().addClass('no-pre-style');
      $(this).addClass('mermaid');
    });

    mermaid.initialize({
      startOnLoad: true,
      // theme: 'forest'
    });

    mermaid.init({
      noteMargin: 10
    }, ".lang-mermaid");

  }
  var autoSwitchApiName = false;

  function fillLangSpec() {
    if (autoSwitchApiName) {
      $.each($('.code-key'), function () {
        var codeKey = $(this).data('codeKey');
        if (codeKey) {
          var codeId = getHashCode(codeKey);
          $(this).addClass(codeId);
        }
      });

      $.each($('code'), function () {
        var code = $(this);
        if (code.children().length > 0) return;
        var codeContent = code.html().toString();
        var codeId = getHashCode(codeContent);
        code.attr("data-code-id", codeId);
      });
    }
  }

  function checkLangSpec() {
    var defaultLangHost = $('.code-default-lang').first();
    if (defaultLangHost != undefined) {
      var defaultLang = defaultLangHost.data('lang');
      if (defaultLang != undefined) {
        autoSwitchApiName = true;
        fillLangSpec();
        checkApiName(defaultLang);
        toggleLangSpec(defaultLang);
      }
    }
  }

  function getLangClass($element) {
    const className = $element.attr('class');
    if (!className) {
      return undefined;
    }
    return $element.attr('class').split(' ').filter(function (cls) {
      return cls.indexOf('lang-') === 0;
    })[0];
  }

  function checkCodeBlocks() {
    var $codeBlocks = $('.prettyprint');
    var langLabelMap = {
      'lang-swift': 'Swift',
      'lang-android': 'Android',
      'lang-objc': 'Objective-C',
      'lang-objective-c': 'Objective-C',
      'lang-php': 'PHP',
      'lang-javascript': 'JavaScript',
      'lang-js': 'JavaScript',
      'lang-python': 'Python',
      'lang-java': 'Java',
      'lang-ts': 'TypeScript',
      'lang-es7': 'ECMAScript7',
      'lang-html': 'HTML',
      'lang-cs': 'C#',
      'lang-curl': 'curl',
      'lang-unity': 'Unity',
      'lang-nodejs': 'Node.js',
      'lang-node': 'Node.js'
    };

    // Multilingual init
    var $translatableElements = $('code, var');
    var snippetMap = {};
    var snippetDefault = 'objc';
    var snippetsJson = 'custom/js/languages.json';
    $.getJSON(snippetsJson, function (data) {
      snippetMap = data;
    })
      .done(function () {
        $.each($translatableElements, function () {
          for (var key in snippetMap[snippetDefault]) {
            if ($(this).text() === key) {
              $(this).attr('data-translatable', key);
            }
          }
        });
      })
      .fail(function () {
        console.log('fetch language error');
      })
      .always(function () {
        console.log('fetch language complete');
      });

    $.each($codeBlocks, function () {
      var $current = $(this);
      var currentCodeClass = getLangClass($current.children());

      var $nextAll = $current.nextUntil('*:not(pre)');
      var nextCodeClass = getLangClass($current.next('.prettyprint').children());
      var nextAllLangs = [currentCodeClass];
      var tabToggleDoms = [];
      var isFirstBlock = true;

      // if $nextAll exists, push lang tags to a temporary array
      if ($nextAll) {
        $.each($nextAll, function () {
          var lang = getLangClass($(this).children());
          nextAllLangs.push(lang);
        });
      }

      // if it's the very first code block of current scope
      if ($current.prev().hasClass('prettyprint')) {
        isFirstBlock = false;
      }

      // prepare toggler DOM
      $.each(nextAllLangs, function (i, lang) {
        if (lang === undefined) {
          lang = 'unknown';
        }
        const label = langLabelMap[lang] || lang.split('lang-').pop() || lang;
        tabToggleDoms.push('\
          <div class="toggle-item">\
            <a class="toggle" data-toggle-lang="' + lang + '" href="#">' + label + '</a>\
          </div>\
        ');
      });

      if (nextCodeClass) {
        $current.addClass('codeblock-toggle-enabled');

        if (currentCodeClass !== nextCodeClass) {
          var langCounter = uniqArr(nextAllLangs).length - 1;

          // hide sibling element
          $.each($nextAll, function () {
            $(this).addClass('codeblock-toggle-enabled');
            $(this).hide();
          });

          // append toggle
          if (isFirstBlock) {
            $('<div/>', {
              class: "code-lang-toggles",
              html: tabToggleDoms.join('')
            }).insertBefore($current);
          }

          $('.code-lang-toggles .toggle-item:first-child .toggle').addClass('active');
        }
      }
    });

    function setLang(targetLang) {
      checkApiName(targetLang);
      toggleLangSpec(targetLang);
      // check if is switching to another language first
      if (!$(this).hasClass('active')) {
        var prevHeight = 0;
        var nextHeight = 0;
        var heightOffset = 0;

        // sum all heights of previous visible code blocks with multilang enabled
        $(this).closest('.code-lang-toggles').prevAll('.codeblock-toggle-enabled:visible').each(function () {
          prevHeight += $(this).outerHeight(true);
        });

        // sum all heights of previous hidden code blocks with multilang enabled, also excludes unrelated (non-targetLang) codeblocks
        $(this).closest('.code-lang-toggles').prevAll('.codeblock-toggle-enabled').not(':visible').find('.' + targetLang).parent().each(function () {
          nextHeight += $(this).outerHeight(true);
        });

        heightOffset = prevHeight - nextHeight;

        if (heightOffset !== 0) {
          var currentTop = document.documentElement.scrollTop || document.body.scrollTop;
          window.scrollTo(0, currentTop - heightOffset);
          console.log('codeblock height offset: ' + heightOffset);
        }
      }

      console.log('switching to ' + targetLang);

      $.each($('.code-lang-toggles'), function () {
        var langArr = [];
        var $toggles = $(this).find('.toggle');

        $.each($toggles, function () {
          var lang = $(this).data('toggle-lang');
          langArr.push(lang);
        });

        if (langArr.indexOf(targetLang) > -1) {
          // Update toggler visibility
          $(this).find('.toggle').removeClass('active');
          $(this).find('.toggle[data-toggle-lang="' + targetLang + '"]').addClass('active');

          // Update codeblock visibility
          var $codeBlocks = $(this).nextUntil('*:not(.codeblock-toggle-enabled)');
          $.each($codeBlocks, function () {
            var $current = $(this);
            var isTarget = $current.find('code').hasClass(targetLang);
            if (isTarget) {
              $current.show();
            } else {
              $current.hide();
            }
          });
        } else {
          console.log('No matching codeblock in current scope!');
        }
      });

      // Update strings for specific language
      $.each($translatableElements, function () {
        var currentLang = targetLang.split('-').pop();
        var snippets = snippetMap[currentLang];
        for (var key in snippets) {
          if ($(this).data('translatable') === key) {
            $(this).text(snippets[key]);
          }
        }
      });
    }

    // click to switch language
    $('.code-lang-toggles .toggle').click(function (e) {
      e.preventDefault();
      var targetLang = $(this).data('toggle-lang');
      setLang(targetLang);
    });
  }

  return {
    start: checkCodeBlocks,
    render: prettyGraph,
    end: checkLangSpec,
  };

})();
