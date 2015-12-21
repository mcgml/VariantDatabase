'use strict';

angular.module('variantdatabase.login', ['ngResource', 'ngRoute', 'ui-notification'])

    .controller('LoginCtrl', function($scope, $http, $location, Notification) {

        // Register the login() function
        $scope.login = function(){

            $http.post('/login', {
                    username: $scope.username.toLowerCase(),
                    password: $scope.password
                })
                .success(function(user){
                    Notification('Welcome ' + user.name);
                    $location.url('/report');
                })
                .error(function(){
                    Notification.error('Username or password incorrect');
                    $location.url('/login');
                });

        };

    });