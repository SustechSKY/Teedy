'use strict';

/**
 * Register page controller.
 */
angular.module('docs').controller('Register', function($scope, $dialog, $state, Restangular, $translate) {
  // Initialize user object
  $scope.user = {};
  
  /**
   * Submit registration request.
   */
  $scope.register = function() {
    // 创建请求数据对象
    var requestData = {
      username: $scope.user.username,
      email: $scope.user.email,
      password: $scope.user.password,
      status: 'PENDING',
      requestTime: new Date().toISOString()
    };
    
    // 使用 Restangular.one() 发送 PUT 请求
    Restangular.one('user/register_request').customPUT(requestData).then(function() {
      var title = $translate.instant('提交申请');
      var msg = $translate.instant('申请已发送');
      var btns = [{result: 'ok', label: $translate.instant('ok'), cssClass: 'btn-primary'}];
      $dialog.messageBox(title, msg, btns).then(function() {
        $state.go('login');
      });
    }, function(e) {
      if (e.data.type === 'AlreadyExistingUsername') {
        var title = $translate.instant('Error');
        var msg = $translate.instant('用户名已存在');
        var btns = [{result: 'ok', label: $translate.instant('ok'), cssClass: 'btn-primary'}];
        $dialog.messageBox(title, msg, btns);
      } else {
        var title = $translate.instant('Error');
        var msg = $translate.instant('register.error_message');
        var btns = [{result: 'ok', label: $translate.instant('ok'), cssClass: 'btn-primary'}];
        $dialog.messageBox(title, msg, btns);
      }
    });
  };
}); 