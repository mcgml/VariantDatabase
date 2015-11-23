'use strict';

angular.module('variantdatabase.about', ['ngRoute'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/about', {
            templateUrl: 'about/about.html',
            controller: 'AboutCtrl'
        });
    }])

    .controller('AboutCtrl', ['$scope', function ($scope) {

    }]);