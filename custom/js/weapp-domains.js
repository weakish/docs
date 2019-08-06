angular.module('app').controller('WeappDomainsCtrl', [
  '$http',
  '$scope',
  '$rootScope',
  '$timeout',
  '$compile',
  function ($http, $scope, $rootScope, $timeout, $compile) {
      const APP_ROUTER_DOMAIN = 'app-router.leancloud.cn';

      $scope.$watch('pageState.currentApp',function(){
        var currentApp = $rootScope.pageState.currentApp;
        console.log($rootScope.pageState.currentApp);
        $scope.domains = {
          request: ['正在获取配置'],
          upload: '正在获取配置',
          download: '正在获取配置'
        };  
        if (currentApp) {
          $http.get('/1.1/clients/self/apps/' + currentApp.app_id + '/platformCustomDomains').then(function (data) {
            if (data.data && data.data.length) {
              $scope.domains.request = data.data.map(function(domainInfo) {
                return domainInfo.domain;
              });
            } else {
              return $http.get('https://app-router.leancloud.cn/2/route?appId=' + currentApp.app_id).then(function (data) {
                $scope.domains.request = [APP_ROUTER_DOMAIN, data.data.api_server, data.data.engine_server, data.data.rtm_router_server];
              })
            }
          }).catch(function() {
            console.error(error);
            $scope.error = error;
            $scope.domains.request = ['获取 request 域名异常'];
          })

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
          file._fileToken(undefined, {
            useMasterKey: true
          }).then(function(uploadInfo) {
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
