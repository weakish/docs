angular.module('app').controller('WeappDomainsCtrl', [
    '$http',
    '$scope',
    '$rootScope',
    '$timeout',
    '$compile',
    function ($http, $scope, $rootScope, $timeout, $compile) {
        $scope.domains = {
          upload: '正在获取配置',
          download: '正在获取配置'
        };

        $scope.$watch('pageState.currentApp',function(){
          var currentApp = $rootScope.pageState.currentApp;
          console.log($rootScope.pageState.currentApp);
          if (currentApp) {
            // Magic: 通过 push_group 判断节点
            if (currentApp.push_group === 'g0') {
              var suffix = currentApp.app_id.slice(0, 8).toLowerCase();
              $scope.extraRequestDomains = [
                suffix + '.api.lncld.net',
                suffix + '.engine.lncld.net',
                suffix + '.rtm.lncld.net'
              ];
              $scope.requestDomainsLength = 6;
            } else if (currentApp.push_group === 'q0'){
              var suffix = currentApp.app_id.slice(0, 8).toLowerCase();
              $scope.extraRequestDomains = [
                'tab.leancloud.cn',
                suffix + '.api.lncldapi.com',
                suffix + '.engine.lncldapi.com',
                suffix + '.rtm.lncldapi.com'
              ];
              $scope.requestDomainsLength = 7;
            } else {
              $scope.extraRequestDomains = [];
              $scope.requestDomainsLength = 3;
            }

            AV.applicationId = undefined;
            AV.applicationKey = undefined;
            AV.init({
              appId: currentApp.app_id,
              appKey: currentApp.app_key,
              masterKey: currentApp.master_key,
            });
            var file = new AV.File('weapp-domains-generator-test-file.txt', {
              base64: 'ZmVlbCBmcmVlIHRvIGRlbGV0ZSB0aGlzIGZpbGUu',
            });
            file._fileToken().then(function(uploadInfo) {
              console.log(uploadInfo);
              var downloadDomain;
              var result = uploadInfo.url.match(/\:\/\/([^\/]*)/);
              if (result) {
                downloadDomain = result[1].toLowerCase();
              } else {
                downloadDomain = '获取文件域名异常';
              }
              $scope.domains.download = downloadDomain;
              var uploadDomain;
              var result = uploadInfo.upload_url.match(/\:\/\/([^\/]*)/);
              if (result) {
                uploadDomain = result[1].toLowerCase();
              } else {
                uploadDomain = '获取文件域名异常';
              }
              $scope.domains.upload = uploadDomain;
              $scope.$digest();
              file.id = uploadInfo.objectId;
              return file.destroy({
                useMasterKey: true
              });
            }).catch(function(error) {
              console.error(error);
              $scope.error = error;
            });
          }
        });

    }
]);
