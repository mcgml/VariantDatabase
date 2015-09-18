'use strict';

// Declare app level module which depends on views, and components
angular.module('variantdb', [ 'ngRoute', 'variantdb.query'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.otherwise({redirectTo: '/query'});
    }]);
