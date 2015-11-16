'use strict';

angular.module('variantdatabase.login', ['ngRoute', 'ui-notification'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/login', {
            templateUrl: 'login/login.html',
            controller: 'LoginCtrl'
        });
    }])

    .controller('LoginCtrl', ['$scope', 'Notification', '$http', function ($scope, Notification, $http) {

    }]);