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
            if ($scope.selectedVirtualPanel.PanelNodeId === undefined){
                openNewPanelModal($scope.selectedVirtualPanel);
                return;
            }

            $http.post('/api/variantdatabase/getvirtualpanel',
                {
                    PanelNodeId : $scope.selectedVirtualPanel.PanelNodeId
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
            $http.post('/api/variantdatabase/featureinformation',
                {
                    FeatureId : $scope.selectedFeature
                })
                .then(function(response) {
                    $scope.featureInformation = response.data;
                    Notification('Operation successful');
                }, function(response) {
                    Notification.error(response);
                    console.log("ERROR: " + response);
                });
        };

        $scope.addVariantPathogenicity = function(){
            $http.post('/api/variantdatabase/addvariantpathogenicity',
                {
                    VariantNodeId : $scope.variantInformation.VariantNodeId,
                    UserNodeId : $rootScope.user.UserNodeId,
                    Classification : $scope.selectedPathogenicity,
                    Evidence : $scope.pathogenicityEvidenceText

                })
                .then(function(response) {
                    Notification($scope.selectedPathogenicity + ' classification successfully added');
                    $scope.getVariantInformation();
                }, function(response) {
                    Notification.error(response);
                    console.log("ERROR: " + response);
                });
        };

        $scope.removeVariantPathogenicity = function(){
            $http.post('/api/variantdatabase/removevariantpathogenicity',
                {
                    PathogenicityNodeId : $scope.variantInformation.PathogenicityNodeId,
                    UserNodeId : $rootScope.user.UserNodeId,
                    Evidence : $scope.pathogenicityEvidenceText
                })
                .then(function(response) {
                    Notification('Operation successful');
                    $scope.getVariantInformation();
                }, function(response) {
                    Notification.error(response);
                    console.log("ERROR: " + response);
                });
        };

        $scope.getVariantInformation = function(){
            $http.post('/api/variantdatabase/variantinformation',
                {
                    VariantId : $scope.selectedVariant
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

            $http.post('/api/variantdatabase/variantobservations',
                {
                    'VariantNodeId' : variant.VariantNodeId
                })
                .then(function(response) {
                    seen.Occurrences = response.data;
                    Notification('Operation successful');
                }, function(response) {
                    Notification.error(response);
                    console.log("ERROR: " + response);
                });

            seen.VariantId = variant.VariantId;

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
            $http.post('/api/variantdatabase/functionalannotation',
                {
                    'VariantNodeId' : variant.VariantNodeId
                })
                .then(function(response) {
                    variant.Annotation = response.data;
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
            $http.get('/api/variantdatabase/analyses', {

            }).then(function(response) {
                $scope.analyses = response.data;
            }, function(response) {
                Notification.error(response);
                console.log("ERROR: " + response);
            })
        }

        function getPanels() {
            $http.get('/api/variantdatabase/panels', {

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