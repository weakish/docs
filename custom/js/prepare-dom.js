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
