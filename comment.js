var _ = require('underscore');
var Promise = require('bluebird');
var cheerio = require('cheerio');
var request = require('request-promise');

var sessionToken = process.env.DOC_COMMENT_TOKEN
var commentServer = process.env.COMMENT_SERVER || 'https://comment.leanapp.cn'
var commentDoms = 'p';

exports.release = function(docSite) {
  return request({
    url: `${commentServer}/api/docReleases`,
    method: 'POST',
    headers: {
      'Session-Token': sessionToken,
    },
    body: {
      docSite
    },
    json: true
  })
}

exports.addCommentIdToDoc = function(fileName, content, release) {
  var $ = cheerio.load(content, { decodeEntities: false });
  var snippets = []
  $(commentDoms).each(function(i, elem) {
    if($(elem).text().trim().length > 0) {
      snippets.push({
        content: $(elem).text(),
        type: elem.name,
      })
    }
  });
  return exports.addSnippets(snippets)
  .then(snippetVersions => {
    return request({
      url: `${commentServer}/api/docs`,
      method: 'POST',
      headers: {
        'Session-Token': sessionToken,
      },
      body: {
        releaseId: release.id,
        fileName,
        snippetVersions,
      },
      json: true
    })
    .then(function(res) {
      $('html').first().attr('version', res.version);
      var index = 0;
      $(commentDoms).each(function(i, elem) {
        if($(elem).text().trim().length > 0) {
          $(elem).attr('id', snippetVersions[index]);
          $(elem).attr('version', snippetVersions[index]);
          index++;
        }
      });
      return $.html();
    })
  })
}

exports.addSnippets = function(snippets) {
  return Promise.map(chunk(snippets, 100), function(snippets) {
    return request({
      url: `${commentServer}/api/snippets`,
      method: 'POST',
      headers: {
        'Session-Token': sessionToken,
      },
      body: snippets,
      json: true
    })
  }, {concurrency: 4})
  .then(_.flatten)
}

const chunk = function(data, n) {
  var lists = _.groupBy(data, function(element, index){
      return Math.floor(index/n);
  });
  return _.toArray(lists);
}
