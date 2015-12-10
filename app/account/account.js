'use strict';

angular.module('variantdatabase.account', ['ngRoute', 'ui-notification'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/account', {
            templateUrl: 'account/account.html',
            controller: 'AccountCtrl'
        });
    }])

    .controller('AccountCtrl', ['$scope', '$http', 'Notification', function ($scope, $http, Notification) {

        function getUserInformation() {
            $scope.getUserInformation = function(){
                $http.post('/api/variantdatabase/getuserinformation',
                    {
                        'UserNodeId' : 0
                    })
                    .then(function(response) {
                        $scope.userInformation = response.data;
                    }, function(response) {
                        Notification.error(response);
                        console.log("ERROR: " + response);
                    });
            };
        }
        getUserInformation();
    }]);