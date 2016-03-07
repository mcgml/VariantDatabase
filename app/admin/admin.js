'use strict';

angular.module('variantdatabase.admin', ['ngRoute', 'ui-notification', 'ui.bootstrap'])

    .controller('AdminCtrl', ['$rootScope', '$scope', 'Notification', '$http', '$uibModal', function ($rootScope, $scope, Notification, $http, $uibModal) {

        //new pathogenicities for authorisation
        function getNewPathogenicitiesForAuthorisation() {
            $http.get('/api/variantdatabase/variant/pendingauth', {
            }).then(function(response) {
                $scope.pathogenicitiesForAuthorisation = response.data;
            }, function(response) {
                Notification.error(response);
                console.log("ERROR: " + response);
            })
        }

        function getNewTranscriptPreferencesForAuthorisation() {
            $http.get('/api/variantdatabase/feature/pendingauth', {
            }).then(function(response) {
                $scope.transcriptPreferencesForAuthorisation = response.data;
            }, function(response) {
                Notification.error(response);
                console.log("ERROR: " + response);
            })
        }

        function getNewAnalysesForAuthorisation() {
            $http.get('/api/variantdatabase/analyses/pendingauth', {
            }).then(function(response) {
                $scope.analysesForAuthorisation = response.data;
            }, function(response) {
                Notification.error(response);
                console.log("ERROR: " + response);
            })
        }

        $scope.authorise = function(eventNodeId, addOrRemove){

            if (!$rootScope.user.admin){
                Notification.error('Requires admin privileges.');
                return;
            }

            $http.post('/api/variantdatabase/admin/authevent',
                {
                    eventNodeId : eventNodeId,
                    userNodeId : $rootScope.user.userNodeId,
                    addOrRemove : addOrRemove
                })
                .then(function(response) {
                    Notification('Operation successful');
                    getNewPathogenicitiesForAuthorisation();
                    getNewTranscriptPreferencesForAuthorisation();
                    getNewAnalysesForAuthorisation();
                }, function(response) {
                    Notification.error(response);
                    console.log("ERROR: " + response);
                });
        };

        $scope.openVariantAnnotationModal = function (variant) {

            $http.post('/api/variantdatabase/annotation/info',
                {
                    'variantNodeId' : variant.variantNodeId
                })
                .then(function(response) {
                    variant.annotation = response.data;
                }, function(response) {
                    Notification.error(response);
                    console.log("ERROR: " + response);
                });

            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: 'templates/VariantAnnotationModal.html',
                controller: 'VariantAnnotationCtrl',
                windowClass: 'app-modal-window',
                resolve: {
                    items: function () {
                        return variant;
                    }
                }
            });
        };

        $scope.openVariantOccurrenceModal = function (variant) {
            var seen = {};

            $http.post('/api/variantdatabase/variant/counts',
                {
                    'variantNodeId' : variant.variantNodeId
                })
                .then(function(response) {
                    seen.occurrences = response.data;
                }, function(response) {
                    Notification.error(response);
                    console.log("ERROR: " + response);
                });

            seen.variantId = variant.variantId;

            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: 'templates/VariantOccurrenceModal.html',
                controller: 'VariantOccurrenceCtrl',
                windowClass: 'app-modal-window',
                resolve: {
                    items: function () {
                        return seen;
                    }
                }
            });

        };

        $scope.setSelected = function (idSelected) {
            $scope.idSelected = idSelected;
        };

        //load widgets on page load
        getNewPathogenicitiesForAuthorisation();
        getNewTranscriptPreferencesForAuthorisation();
        getNewAnalysesForAuthorisation();

    }]);