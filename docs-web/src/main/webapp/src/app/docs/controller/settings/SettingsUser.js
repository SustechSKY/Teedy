'use strict';

/**
 * Settings user page controller.
 */
angular.module('docs').controller('SettingsUser', function($scope, $state, Restangular, $dialog, $translate) {
  /**
   * Load users from server.
   */
  $scope.loadUsers = function() {
    Restangular.one('user/list').get({
      sort_column: 1,
      asc: true
    }).then(function(data) {
      $scope.users = data.users;
    });
  };
  
  /**
   * Load registration requests.
   */
  $scope.loadRegistrationRequests = function() {
    Restangular.one('user/register_requests').get().then(function(data) {
      $scope.registrationRequests = data.requests;
    });
  };
  
  $scope.loadUsers();
  $scope.loadRegistrationRequests();
  
  /**
   * Edit a user.
   */
  $scope.editUser = function(user) {
    $state.go('settings.user.edit', { username: user.username });
  };

  /**
   * Approve registration request.
   */
  $scope.approveRequest = function(request) {
    var title = $translate.instant('通过申请');
    var msg = $translate.instant('申请已通过', { username: request.username });
    var btns = [
      { result: 'cancel', label: $translate.instant('cancel') },
      { result: 'ok', label: $translate.instant('ok'), cssClass: 'btn-primary' }
    ];

    $dialog.messageBox(title, msg, btns, function(result) {
      if (result === 'ok') {
        Restangular.one('user/register_request', request.id).post('approve').then(function() {
          $scope.loadRegistrationRequests();
          $scope.loadUsers();
        });
      }
    });
  };

  /**
   * Reject registration request.
   */
  $scope.rejectRequest = function(request) {
    var title = $translate.instant('注册申请');
    var msg = $translate.instant('申请已拒绝', { username: request.username });
    var btns = [
      { result: 'cancel', label: $translate.instant('cancel') },
      { result: 'ok', label: $translate.instant('ok'), cssClass: 'btn-primary' }
    ];

    $dialog.messageBox(title, msg, btns, function(result) {
      if (result === 'ok') {
        Restangular.one('user/register_request', request.id).post('reject').then(function() {
          $scope.loadRegistrationRequests();
        });
      }
    });
  };

  $scope.register = function() {
    var requestData = {
        username: $scope.user.username,
        email: $scope.user.email,
        password: $scope.user.password
    };

    Restangular.all('user/register_request').put(requestData).then(function() {
        // 注册成功
        $dialog.messageBox(
            $translate.instant('register.success_title'),
            $translate.instant('register.success_message'),
            [{
                result: 'ok',
                label: $translate.instant('ok'),
                cssClass: 'btn-primary'
            }],
            function() {
                $state.go('login');
            }
        );
    }, function(response) {
        if (response.data.type === 'AlreadyExistingUsername') {
            $dialog.messageBox(
                $translate.instant('register.error_title'),
                $translate.instant('register.error_username_exists'),
                [{
                    result: 'ok',
                    label: $translate.instant('ok'),
                    cssClass: 'btn-primary'
                }]
            );
        } else {
            $dialog.messageBox(
                $translate.instant('register.error_title'),
                $translate.instant('register.error_message'),
                [{
                    result: 'ok',
                    label: $translate.instant('ok'),
                    cssClass: 'btn-primary'
                }]
            );
        }
    });
  };
});