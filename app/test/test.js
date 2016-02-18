'use strict';

angular.module('variantdatabase.test', ['ngRoute', 'ngSanitize', 'ngAnimate', 'ui.bootstrap', 'ui-notification', 'nvd3' ,'ngFileSaver'])

    .controller('TestCtrl', ['$rootScope', '$scope', '$http', 'Notification', '$uibModal', '$window','framework', '$anchorScroll','FileSaver', 'Blob', function ($rootScope, $scope, $http, Notification, $uibModal, $window, framework, $anchorScroll, FileSaver, Blob) {

        $scope.variantPathogenicity = {
            templateUrl: 'templates/AddVariantPathogenicityPopover.html',
            isOpen: false,
            open : function() {
                $scope.variantPathogenicity.isOpen = true;
            },
            close : function() {
                $scope.variantPathogenicity.isOpen = false;
            },
            add : function(nodeId) {
                $http.post('/api/variantdatabase/diagnostic/return',
                    {
                        variantNodeId: nodeId,
                        userNodeId: $rootScope.user.userNodeId,
                        classification: $scope.pathogenicity,
                        evidence: $scope.evidence

                    })
                    .then(function (response) {
                        Notification(pathogenicity + ' classification successfully added');
                        $scope.variantPathogenicity.close();
                    }, function (response) {
                        Notification.error(response.data);
                        console.log("ERROR: " + response);
                    });
            }
        };


    }]);