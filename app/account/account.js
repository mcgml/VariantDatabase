'use strict';

angular.module('variantdatabase.account', ['ngRoute', 'ngAnimate', 'ngTouch', 'ui.bootstrap', 'ui-notification', 'nvd3'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/account', {
            templateUrl: 'account/account.html',
            controller: 'AccountCtrl'
        });
    }])

    .controller('AccountCtrl', ['$scope', '$http', 'Notification', '$uibModal', function ($scope, $http, Notification, $uibModal) {

        //get user account information
        $http.post('/api/seraph',
            {
                query:
                "MATCH (u:User) where u.UserId = \"ml\" RETURN u;",
                params: {}
            })
            .then(function(response) {
                $scope.userInfomation = response.data[0];
            },
            function(response) {
                Notification.error(response);
                console.log("ERROR: " + response);
            });

    }]);