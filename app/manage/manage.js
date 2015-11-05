'use strict';

angular.module('variantdatabase.manage', ['ngRoute', 'ngAnimate', 'ngTouch', 'ui.bootstrap', 'ui-notification', 'nvd3'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/manage', {
            templateUrl: 'manage/manage.html',
            controller: 'ManageCtrl'
        });
    }])

    .controller('ManageCtrl', ['$scope', '$http', 'Notification', '$uibModal', '$window', function ($scope, $http, Notification, $uibModal, $window) {
        var cat20 = ["#1f77b4", "#aec7e8", "#ff7f0e", "#ffbb78", "#2ca02c", "#98df8a", "#d62728", "#ff9896"];

        $scope.barChartOptions = {
            chart: {
                type: 'discreteBarChart',
                height: 250,
                noData: "",
                color : function (d, i) { var key = i === undefined ? d : i; return d.color || cat20[key % cat20.length]; },
                x: function(d){return d.label;},
                y: function(d){return d.value;},
                showValues: false,
                showXAxis: false,
                showYAxis: true,
                "yAxis": {
                    "axisLabel": "Percentage Coverage"
                },
                valueFormat: function(d){
                    return d3.format(',.4f')(d);
                },
                transitionDuration: 500
            }
        };

        $scope.getVirtualPanelGenes = function() {
            $http.post('/api/seraph',
                {
                    query:
                    "MATCH (v:VirtualPanel) WHERE id(v) = " + $scope.selectedVirtualPanel.PanelNodeId + " " +
                    "MATCH (v)-[:CONTAINS_SYMBOL]->(s:Symbol) " +
                    "RETURN s.SymbolId as SymbolId, s.GeneId as GeneId;",
                    params: {}
                })
                .then(function(response) {
                    $scope.genes = response.data;
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

        $scope.getVariantInformation = function(){
            $http.post('/api/variantdatabase/variantinformation',
                {
                    VariantId : $scope.selectedVariant
                })
                .then(function(response) {

                    $scope.variantInformation = response.data;

                    getVariantAnnotation($scope.variantInformation.VariantNodeId);
                    getVariantPopulationFrequency($scope.variantInformation.VariantNodeId);

                }, function(response) {
                    Notification.error(response);
                    console.log("ERROR: " + response);
                });
        };

        function getVariantPopulationFrequency(nodeId){
            $http.post('/api/variantdatabase/populationfrequency',
                {
                    'NodeId' : nodeId
                })
                .then(function(response) {
                    $scope.populationFrequency = response.data;
                }, function(response) {
                    Notification.error(response);
                    console.log("ERROR: " + response);
                });
        }

        function getVariantAnnotation(nodeId) {
            $http.post('/api/variantdatabase/functionalannotation',
                {
                    'NodeId': nodeId
                })
                .then(function (response) {
                    $scope.Annotations = response.data;
                }, function (response) {
                    Notification.error(response);
                    console.log("ERROR: " + response);
                });
        }

        $scope.setVariantPathogenicity = function(){

            if ($scope.selectedPathogenicity == null){
                Notification.error("Select pathogenicity");
                return;
            }

            var query = "MATCH (v:Variant) where id(v) = " + $scope.variantInformation.VariantNodeId + " " +
                "MATCH (u:User {UserId:\"ml\"})" +
                "CREATE (u)-[:HAS_ASSIGNED_PATHOGENICITY {Value:toInt(\"" + $scope.selectedPathogenicity + "\"), Date:" + new Date().getTime();
            if ($scope.pathogenicityEvidenceText != null && $scope.pathogenicityEvidenceText != '') query += ", Comment:\"" + $scope.pathogenicityEvidenceText + "\"";
            query += "}]->(v)";

            $http.post('/api/seraph',
                {
                    query: query,
                    params: {}
                })
                .then(function(response) {
                    $scope.getVariantInformation();
                },
                function(response) {
                    Notification.error(response);
                    console.log("ERROR: " + response);
                });
        };

        $scope.setFeaturePreference = function(){
            var query = "MATCH (u:User {UserId:\"ml\"}) " +
                "MATCH (f:Feature) where id(f) = " + $scope.featureInformation.FeatureNodeId + " " +
                "CREATE (f)-[:HAS_FEATURE_PREFERENCE]->(fp:FeaturePreference)-[:ADDED_BY {Date:" + new Date().getTime() + "}]->(u) ";
            if ($scope.preferredFeatureEvidenceText != null && $scope.preferredFeatureEvidenceText != '') query += "SET fp.Evidence = \"" + $scope.preferredFeatureEvidenceText + "\"";

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

        $scope.openVariantInformationModal = function (variant) {

            $http.post('/api/variantdatabase/populationfrequency',
                {
                    'NodeId' : variant.VariantNodeId
                })
                .then(function(response) {
                    variant.PopulationFrequency = response.data;
                }, function(response) {
                    Notification.error(response);
                    console.log("ERROR: " + response);
                });

            $http.post('/api/variantdatabase/functionalannotation',
                {
                    'NodeId' : variant.VariantNodeId
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
                templateUrl: 'templates/VariantInformationModal.html',
                controller: 'VariantInformationCtrl',
                windowClass: 'app-modal-window',
                size: 'lg',
                resolve: {
                    items: function () {
                        return variant;
                    }
                }
            });

        };

        $http.get('/api/variantdatabase/panels', {})
            .then(function(response) {
                $scope.virtualPanels = response.data;
            }, function(response) {
                Notification.error(response);
                console.log("ERROR: " + response);
            });

    }]);