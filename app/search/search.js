'use strict';

//todo search sample
//todo search symbol
//todo search workflow

angular.module('variantdatabase.search', ['ngRoute', 'ui.bootstrap', 'ui-notification', 'nvd3'])

    .controller('SearchCtrl', ['$rootScope', '$scope', '$http', 'Notification', '$uibModal', '$window','framework', function ($rootScope, $scope, $http, Notification, $uibModal, $window, framework) {

        $scope.openEnsemblVariantLink = function(variant){
            $window.open(framework.getEnsemblRangeLink() + framework.convertVariantToRange(variant), '_blank');
        };
        $scope.openUCSCVariantLink = function(variant){
            $window.open(framework.getUCSCRangeLink() + framework.convertVariantToRange(variant), '_blank');
        };
        $scope.openExACVariantLink = function(variant){
            $window.open(framework.getExACVariantLink() + framework.convertVariantToExAC(variant), '_blank');
        };
        $scope.open1kgVariantLink = function(variant){
            $window.open(framework.get1kgRangeLink() + framework.convertVariantToRange(variant), '_blank');
        };

        $scope.getVirtualPanel = function() {

            //check panel exists
            if ($scope.selectedVirtualPanel.panelNodeId === undefined){
                openNewPanelModal($scope.selectedVirtualPanel);
                return;
            }

            $http.post('/api/variantdatabase/panels/info',
                {
                    panelNodeId : $scope.selectedVirtualPanel.panelNodeId
                })
                .then(function(response) {
                    $scope.virtualPanel = response.data;
                    Notification('Operation successful');
                }, function(response) {
                    Notification.error(response);
                    console.log("ERROR: " + response);
                });
        };

        function openNewPanelModal(virtualPanelName) {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: 'templates/NewPanelModal.html',
                controller: 'NewPanelCtrl',
                windowClass: 'app-modal-window',
                resolve: {
                    items: function () {
                        return virtualPanelName;
                    }
                }
            });
        }

        $scope.getFeature = function(){
            $http.post('/api/variantdatabase/feature/info',
                {
                    featureId : $scope.selectedFeature
                })
                .then(function(response) {
                    $scope.featureInformation = response.data;
                    Notification('Operation successful');
                }, function(response) {
                    Notification.error(response);
                    console.log("ERROR: " + response);
                });
        };

        $scope.getSymbol = function(){
            $http.post('/api/variantdatabase/symbol/info',
                {
                    symbolId : $scope.selectedSymbol
                })
                .then(function(response) {
                    $scope.symbolInformation = response.data;
                    Notification('Operation successful');
                }, function(response) {
                    Notification.error(response);
                    console.log("ERROR: " + response);
                });
        };

        $scope.getSample = function(){
            $http.post('/api/variantdatabase/sample/info',
                {
                    sampleId : $scope.selectedSample
                })
                .then(function(response) {
                    $scope.sampleInformation = response.data;
                    Notification('Operation successful');
                }, function(response) {
                    Notification.error(response);
                    console.log("ERROR: " + response);
                });
        };

        $scope.addFeaturePreference = function(){
            $http.post('/api/variantdatabase/feature/addpreference',
                {
                    featureNodeId : $scope.featureInformation.featureNodeId,
                    userNodeId : $rootScope.user.userNodeId,
                    featurePreference : $scope.selectedTranscriptPreference,
                    evidence : $scope.preferedTrancriptEvidenceText

                })
                .then(function(response) {
                    Notification('Feature preference successfully added');
                    $scope.getFeature();
                }, function(response) {
                    Notification.error(response.data);
                    console.log("ERROR: " + response);
                });
        };

        $scope.addVariantPathogenicity = function(){
            $http.post('/api/variantdatabase/variant/addpathogenicity',
                {
                    variantNodeId : $scope.variantInformation.variantNodeId,
                    userNodeId : $rootScope.user.userNodeId,
                    classification : $scope.selectedPathogenicity,
                    evidence : $scope.pathogenicityEvidenceText

                })
                .then(function(response) {
                    Notification($scope.selectedPathogenicity + ' classification successfully added');
                    $scope.getVariantInformation();
                }, function(response) {
                    Notification.error(response.data);
                    console.log("ERROR: " + response);
                });
        };

        $scope.getVariantInformation = function(){
            $http.post('/api/variantdatabase/variant/info',
                {
                    variantId : $scope.selectedVariant
                })
                .then(function(response) {
                    $scope.variantInformation = response.data;
                }, function(response) {
                    Notification.error(response);
                    console.log("ERROR: " + response);
                });
        };

        $scope.openVariantOccurrenceModal = function (variant) {
            var seen = {};

            $http.post('/api/variantdatabase/variant/counts',
                {
                    variantNodeId : variant.variantNodeId
                })
                .then(function(response) {
                    seen.occurrences = response.data;
                    Notification('Operation successful');
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

        $scope.openVariantAnnotationModal = function (variant) {
            $http.post('/api/variantdatabase/annotation/info',
                {
                    variantNodeId : variant.variantNodeId
                })
                .then(function(response) {
                    variant.annotation = response.data;
                    Notification('Operation successful');
                }, function(response) {
                    Notification.error(response);
                    console.log("ERROR: " + response);
                });

            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: 'templates/VariantAnnotationModal.html',
                controller: 'VariantAnnotationCtrl',
                windowClass: 'app-modal-window',
                size: 'lg',
                resolve: {
                    items: function () {
                        return variant;
                    }
                }
            });
        };

        function getAnalyses() {
            $http.get('/api/variantdatabase/analyses/list', {

            }).then(function(response) {
                $scope.analyses = response.data;
            }, function(response) {
                Notification.error(response);
                console.log("ERROR: " + response);
            })
        }

        function getPanels() {
            $http.get('/api/variantdatabase/panels/list', {

            }).then(function(response) {
                $scope.virtualPanels = response.data;
            }, function(response) {
                Notification.error(response);
                console.log("ERROR: " + response);
            });
        }

        //populate typeaheads on pageload
        getAnalyses();
        getPanels();

    }]);