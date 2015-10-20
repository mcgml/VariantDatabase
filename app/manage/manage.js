'use strict';

angular.module('variantdatabase.manage', ['ngRoute', 'ngAnimate', 'ngTouch', 'ui.bootstrap', 'ui-notification', 'nvd3'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/manage', {
            templateUrl: 'manage/manage.html',
            controller: 'ManageCtrl'
        });
    }])

    .config(function(NotificationProvider) {
        NotificationProvider.setOptions(
            {
                delay: 2500,
                startTop: 20,
                startRight: 10,
                verticalSpacing: 20,
                horizontalSpacing: 20,
                positionX: 'right',
                positionY: 'bottom'
            }
        )
    })

    .controller('ManageCtrl', ['$scope', '$http', 'Notification', '$uibModal', function ($scope, $http, Notification, $uibModal) {

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

        $scope.getGenes = function() {
            $http.post('/api/seraph',
                {
                    query:
                    "MATCH (v:VirtualPanel) WHERE id(v) = " + $scope.selectedPanel.PanelNodeId + " " +
                    "MATCH (v)-[:CONTAINS_SYMBOL]->(s:Symbol) " +
                    "RETURN s.SymbolId as Gene;",
                    params: {}
                })
                .then(function(response) {
                    $scope.genes = response.data;
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

        $scope.openNewCommentModal = function (items) {
            var modalInstance = $uibModal.open({
                animation: false,
                templateUrl: 'templates/addCommentModal.html',
                controller: 'ModalInstanceCtrl',
                resolve: {
                    items: function () {
                        return items;
                    }
                }
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

        function getVariantAnnotation(nodeId){
            $http.post('/api/variantdatabase/functionalannotation',
                {
                    'NodeId' : nodeId
                })
                .then(function(response) {
                    $scope.Annotations = response.data;
                }, function(response) {
                    Notification.error(response);
                    console.log("ERROR: " + response);
                });
        }

        $http.get('/api/variantdatabase/panels', {})
            .then(function(response) {
                $scope.virtualPanels = response.data;
            }, function(response) {
                Notification.error(response);
                console.log("ERROR: " + response);
            });

    }])

    .controller('ModalInstanceCtrl', function ($scope, $modalInstance, items) {
        $scope.items = items;

        $scope.save = function () {
            console.log($scope.comment);
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    });