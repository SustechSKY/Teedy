'use strict';

/**
 * Register page controller.
 */
angular.module('docs').controller('Register', function($scope, $dialog, $state, Restangular, $translate) {
  // Initialize user object
  $scope.user = {};
  
  /**
   * Register a new user.
   */
  $scope.register = function() {
    var user = angular.copy($scope.user);
    
    Restangular.one('user').put(user).then(function() {
      $state.go('login');
    }, function(e) {
      if (e.data.type === 'AlreadyExistingUsername') {
        var title = $translate.instant('settings.user.edit.edit_user_failed_title');
        var msg = $translate.instant('settings.user.edit.edit_user_failed_message');
        var btns = [{result: 'ok', label: $translate.instant('ok'), cssClass: 'btn-primary'}];
        $dialog.messageBox(title, msg, btns);
      }
    });
  };
}); 