'use strict';

//todo search sample
//todo search symbol
//todo search workflow

angular.module('variantdatabase.search', ['ngRoute', 'ui.bootstrap', 'ui-notification', 'nvd3'])

    .controller('SearchCtrl', ['$scope', '$http', 'Notification', '$uibModal', '$window','framework', function ($scope, $http, Notification, $uibModal, $window, framework) {

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

        $scope.getVirtualPanelGenes = function() {

            //check panel exists
            if ($scope.selectedVirtualPanel.PanelNodeId === undefined){
                $scope.openNewPanelModal($scope.selectedVirtualPanel);
                return;
            }

            $http.post('/api/variantdatabase/getvirtualpanelgenes',
                {
                    PanelNodeId : $scope.selectedVirtualPanel.PanelNodeId
                })
                .then(function(response) {
                    $scope.genes = response.data;
                    Notification('Operation successful');
                }, function(response) {
                    Notification.error(response);
                    console.log("ERROR: " + response);
                });

        };

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
                    UserNodeId : 0,
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
                    UserNodeId : 0,
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
                    getVariantAnnotation($scope.variantInformation.VariantNodeId);

                }, function(response) {
                    Notification.error(response);
                    console.log("ERROR: " + response);
                });
        };

        function getVariantAnnotation(nodeId) {
            $http.post('/api/variantdatabase/functionalannotation',
                {
                    'VariantNodeId': nodeId
                })
                .then(function (response) {
                    $scope.Annotations = response.data;
                }, function (response) {
                    Notification.error(response);
                    console.log("ERROR: " + response);
                });
        }

        $scope.changeFeaturePreference = function(featureInformation){
            var query;

            if(featureInformation.Preferred){
                query = "MATCH (u:User {UserId:\"ml\"}) " +
                    "MATCH (f:Feature) where id(f) = " + $scope.featureInformation.FeatureNodeId + " " +
                    "MATCH (f)-[:HAS_FEATURE_PREFERENCE]->(fp:FeaturePreference) " +
                    "CREATE (fp)-[rel:REMOVED_BY {Date:" + new Date().getTime() + "}]->(u)";
                if ($scope.preferredFeatureEvidenceText != null && $scope.preferredFeatureEvidenceText != '') query += "SET rel.Evidence = \"" + $scope.preferredFeatureEvidenceText + "\"";

            } else {
                query = "MATCH (u:User {UserId:\"ml\"}) " +
                    "MATCH (f:Feature) where id(f) = " + $scope.featureInformation.FeatureNodeId + " " +
                    "CREATE (f)-[:HAS_FEATURE_PREFERENCE]->(fp:FeaturePreference)-[rel:ADDED_BY {Date:" + new Date().getTime() + "}]->(u) ";
                if ($scope.preferredFeatureEvidenceText != null && $scope.preferredFeatureEvidenceText != '') query += "SET rel.Evidence = \"" + $scope.preferredFeatureEvidenceText + "\"";
            }

            $http.post('/api/seraph',
                {
                    query: query,
                    params: {}
                })
                .then(function(response) {
                    $scope.getFeature();
                },
                function(response) {
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

        $scope.openNewPanelModal = function (virtualPanelName) {
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

        function getWorkflows() {
            $http.get('/api/variantdatabase/workflows', {

            }).then(function (response) {
                $scope.workflows = response.data;
            }, function (response) {
                Notification.error(response);
                console.log("ERROR: " + response);
            });
        }

        //populate typeaheads on pageload
        getAnalyses();
        getPanels();
        getWorkflows();

    }]);