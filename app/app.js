'use strict';

// Declare app level module which depends on views, and components
angular.module('variantdb', [ 'ngRoute', 'variantdb.login', 'variantdb.report', 'variantdb.manage'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.otherwise(
            {
                redirectTo: '/login'
            });
    }]);
