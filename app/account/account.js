'use strict';

angular.module('variantdatabase.account', ['ngRoute', 'ui-notification'])

    .controller('AccountCtrl', ['$rootScope', '$scope', '$http', 'Notification', function ($rootScope, $scope, $http, Notification) {
        $scope.userInformation = $rootScope.user;

        $scope.updatePassword = function(){
            $http.post('/api/variantdatabase/updateuserpassword',
                {
                    UserNodeId : $rootScope.user.UserNodeId,
                    Password : $scope.newPassword
                })
                .then(function(response) {
                    Notification('Operation successful');
                }, function(response) {
                    Notification.error(response);
                    console.log("ERROR: " + response);
                });
            $scope.newPassword = '';
        };

    }]);