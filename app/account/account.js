'use strict';

angular.module('variantdatabase.account', ['ngRoute', 'ui-notification'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/account', {
            templateUrl: 'account/account.html',
            controller: 'AccountCtrl'
        });
    }])

    .controller('AccountCtrl', ['$scope', '$http', 'Notification', function ($scope, $http, Notification) {

        //get user account information
        $http.post('/api/seraph',
            {
                query:
                "MATCH (u:User) where u.UserId = \"ml\" RETURN u;",
                params: {}
            })
            .then(function(response) {
                $scope.userInformation = response.data[0];
            },
            function(response) {
                Notification.error(response);
                console.log("ERROR: " + response);
            });

    }]);