//apps data

var purl = '/1/';
angular.module("app", ['ui.gravatar', 'md5']);
angular.module("app").controller("AppCtrl", ['$scope', '$http', '$timeout', '$compile', '$rootScope', '$filter',

    function ($scope, $http, $timeout, $compile, $rootScope, $filter) {
        $scope.appid = "{{appid}}";
        $scope.appkey = "{{appkey}}";
        $scope.masterkey = "{{masterkey}}";
        $scope.sign_masterkey = "{{sign_masterkey}}";
        $scope.sign_appkey = "{{sign_appkey}}";
        var service = $scope.service || 'api';
        var domains = {
          n1: 'lncld.net',
          qcloud: 'lncldapi.com',
          us: 'lncldglobal.com',
        };
        var domain = domains[$rootScope.region] || domains['n1'];
        $scope.domain = '{{appid 前八位}}.' + service + '.' + domain;
        $rootScope.pageState = {};
        var sdkversion = 'unknown';
        if (typeof $sdk_versions != 'undefined') {
            sdkversion = $sdk_versions;
        }
        angular.element("body").scope().sdkversion = sdkversion;

        $http.get('/1/clients/self').success(function (data) {
            $scope.user = data;
        });

        $http.get("/1/clients/self/apps").success(
            function (data) {
                if (data.length > 0) {
                    $rootScope.pageState.currentApp = data[0];
                    $scope.$watch('pageState.currentApp', function () {
                        if ($scope.pageState.currentApp && $scope.pageState.currentApp.app_id) {
                            $scope.appid = $scope.pageState.currentApp.app_id;
                            $scope.appkey = $scope.pageState.currentApp.app_key;
                            $scope.masterkey = $scope.pageState.currentApp.master_key;
                            $scope.sign_masterkey = $filter('signify')($scope.pageState.currentApp.master_key, 'master');
                            $scope.sign_appkey = $filter('signify')($scope.pageState.currentApp.app_key);
                            var prefix = $scope.appid.slice(0, 8).toLowerCase();
                            $scope.domain = prefix + '.' + service + '.' + domain;
                        }
                    });
                    $scope.apps = data;
                }

            }).error(function (data) {

            });
        $scope.signout = function () {
            $http.post('/1/signout').success(function (data) {
                location.reload();
            });
        }
        // 2017-03-24 output undefined variables as is(surrounded by double curl braces)
        $scope.mustache = function (val) {
            if (typeof $scope[val] == 'undefined') {
                return '{{' + val + '}}';
            }
            else {
                return $scope[val];
            }
        }

        window.addEventListener("message", receiveMessage, false);

        function receiveMessage(event) {
            if (win != undefined)
                win.close();
            $scope.$apply(function () {
                getUser();
            });
        }
        var win;
        var commentHost = 'https://comment.leanapp.cn';
        $scope.commentHost = commentHost;
        var docVersion = $('html').first().attr('version');

        $scope.loginComment = function () {
            win = openWindow(commentHost + '/users/login', '登录', 600, 500);
            return false
        }

        $scope.showCommentDialog = function (e, snippetVersion) {
            $scope.snippetVersion = snippetVersion;
            getCommentsBySnipeet(snippetVersion);
            var mouseX = e.pageX;
            var mouseY = e.pageY;
            var xoffset = 10;
            var yoffset = 10;

            $('#comment-container').fadeIn(100);
            $('#comment-container').css({
                left: mouseX + xoffset,
                top: mouseY + yoffset
            });
            $('p[version=' + snippetVersion + ']').addClass('on');
        }

        function getComments() {
            $http.get(commentHost + '/docs/' + docVersion + '/commentCount', {
                withCredentials: true
            }).success(function (result) {
                var all = {};
                angular.forEach(result, function (v, k) {
                    // $('[version="'+v.snippetVersion+'"]').append(v.count);
                    all[v.snippetVersion] = v.count;
                });
                $scope.allComment = all;
            });
        }

        $scope.getCommentUser = getUser;
        function getUser() {
            $http.get(commentHost + '/users/current', {
                withCredentials: true
            }).success(function (result) {
                $scope.currentCommentUser = result;
            });
        }

        function getCommentsBySnipeet(snippet) {
            snippet = snippet || $scope.snippetVersion;
            $http.get(commentHost + '/docs/' + docVersion + '/snippets/' + snippet + '/comments', {
                withCredentials: true
            }).success(function (result) {
                $scope.currentComments = result;
            });
        }

        $scope.createComment = function (e) {
            if (!$scope.commentContent) {
                return;
            }
            $http({
                method: 'post',
                url: commentHost + '/docs/' + docVersion + '/snippets/' + $scope.snippetVersion + '/comments',
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                transformRequest: function (obj) {
                    var str = [];
                    for (var p in obj)
                        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                    return str.join("&");
                },
                data: {
                    content: $scope.commentContent
                }

            })
                .success(function (result) {
                    $scope.commentContent = '';
                    var snippet = $scope.snippetVersion;
                    if ($scope.allComment[snippet]) {
                        $scope.allComment[snippet] += 1;
                    } else {
                        $scope.allComment[snippet] = 1;
                    }
                    $scope.getCommentsBySnipeet();

                }).error(function (err) {
                    if (err.status == 401) {
                        // window.open(commentHost+'/users/login')

                        // location.href = commentHost+'/users/login';
                    }
                });
        }

        $scope.getCommentsBySnipeet = getCommentsBySnipeet;

        $scope.closeCommentModal = function () {
            $('p[version=' + $scope.snippetVersion + ']').removeClass('on');
            $('#comment-container').fadeOut(100);
        }

        getComments();
        getUser();
    }]);

angular.module('ui.gravatar').config([
    'gravatarServiceProvider', function (gravatarServiceProvider) {
        gravatarServiceProvider.defaults = {
            size: 100,
            "default": 'https://leancloud.cn/images/static/default-avatar.png' // Mystery man as default for missing avatars
        };

        // Use https endpoint
        gravatarServiceProvider.secure = true;
    }
]);

angular.module('app').controller('StartCtrl', [
    '$http',
    '$scope',
    '$timeout',
    '$compile',
    function ($http, $scope, $timeout, $compile) {
        $scope.links = {
            'android': {
                doc: '/docs/android_guide.html',
                demo: '/docs/sdk_down.html'
            },
            'ios': {
                doc: '/docs/leanstorage_guide-ios.html',
                demo: '/docs/sdk_down.html'
            },
            'js': {
                doc: '/docs/js_guide.html',
                demo: '/docs/sdk_down.html'
            },
            'unity': {
                doc: '/docs/unity_guide.html',
                demo: '/docs/sdk_down.html'
            },
            'wp': {
                doc: '/docs/dotnet_guide.html',
                demo: '/docs/sdk_down.html'
            }
        };

        $scope.selectedPlat = 'objc';

        $scope.createApp = function () {
            $http.post(purl + 'clients/self/apps', { name: $scope.appname }).success(function (data) {
                $scope.SelectedApp = data;
            }).error(function (data) {
            });
        };

        $scope.$watch('selectedPlat', function () {
            var dom = $('#start-main');
            dom.css("visibility", 'hidden').prev().removeClass('loaded');
            //$http.get('start/'+$scope.selectedPlat+'_start.html').
            $http.get('sdk_setup-' + $scope.selectedPlat + '.html').
                success(function (result) {
                    //$('#start-main').html(result);
                    var temp = $(result).find('.doc-content');

                    dom.html(
                        temp.find('.docs-meta').insertAfter(temp.find('h1').addClass('font-logo')).end().end()
                            .children()
                    );

                    $timeout(function () {
                        //$compile($('#start-main').contents())($scope);
                        $compile(dom.contents())($scope);
                        setTimeout(function () {
                            prettyPrepare();
                            prettyPrint();
                            $("pre.prettyprint code").each(function (index, ele) {
                                $(ele).after("<div class='doc-example-action'><button class='copybtn'><span class='icon icon-clipboard'></span></button></div>");
                            });
                            glueCopy();
                            codeBlockTabber.start();
                        }, 0);
                    }, 0);
                    dom.css("visibility", 'visible').prev().addClass('loaded');
                });
        });



    }
]);

angular.module('app').directive('lcComment', ['$compile', function ($compile) {
    return {
        restrict: 'AE',
        scope: {
            version: '@version',
            allComment: '=allComment'
        },
        template: '<div class="toggle-comment" ng-class="{\'has-comments\':allComment[version]}" ng-click="f($event)"><span>{{allComment[version]}}<var ng-show="!allComment[version]">+</var></span></div>',
        link: function (scope, element, attrs) {
            scope.f = function (e) {
                scope.$parent.showCommentDialog(e, scope.version);
            }
        }
    }
}]);

// angular.module('app').directive('pre', function() {
//     return {
//         restrict: 'E',
//         link: function postLink(scope, element, attrs) {
//               element.html(prettyPrintOne(element.html()));
//         }
//     };
// });

// 2017-03-22 LC-X-SIGN
angular.module('app').filter('signify', ['md5', function (md5) {
    return function (item, type) {
        var suffix = '';
        var ts = Date.now() || new Date().getTime();
        if (type === 'master') {
            suffix = ',master';
        }
        return md5(ts + item) + ',' + ts + suffix;
    };
}]);

