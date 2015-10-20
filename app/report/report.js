'use strict';

angular.module('variantdatabase.report', ['ngRoute', 'ngAnimate', 'ngTouch', 'ui.bootstrap', 'ui-notification', 'nvd3'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/report', {
            templateUrl: 'report/report.html',
            controller: 'ReportCtrl'
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

    .filter('convertVariantToRange', function() {
        return function (input) {
            return input; //todo
        }
    })

    .filter('convertVariantToExAC', function() {
        return function (input) {
            return input; //todo
        }
    })

    .controller('ReportCtrl', ['$scope', '$http', 'Notification', '$uibModal', function ($scope, $http, Notification, $uibModal) {

        var cat20 = ["#1f77b4", "#aec7e8", "#ff7f0e", "#ffbb78", "#2ca02c", "#98df8a", "#d62728", "#ff9896"];

        $scope.selectedVariantFilter = -1;
        $scope.pathogenicityColours = ["white", "#43ac6a", "#e99002", "#f04124"];

        $scope.donutChartOptions = {
            chart: {
                type: 'pieChart',
                height: 250,
                noData: "",
                donut: true,
                color : function (d, i) { var key = i === undefined ? d : i; return d.color || cat20[key % cat20.length]; },
                x: function(d){return d.key;},
                y: function(d){return d.y;},
                showLabels: false,
                pie: {
                    dispatch: {
                        elementClick: function(e) {
                            $scope.selectedVariantFilter = e.index;
                            $scope.$apply();
                        }
                    }
                },
                transitionDuration: 500
            }
        };

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

        $scope.processWorkflowRequest = function(){
            if ($scope.selectedAnalysis == '' || $scope.selectedAnalysis == undefined){
                Notification.error('Enter Sample');
                return;
            }
            if ($scope.selectedPanel == '' || $scope.selectedPanel == undefined){
                Notification.error('Enter Panel');
                return;
            }
            if ($scope.selectedWorkflow == '' || $scope.selectedWorkflow == undefined){
                Notification.error('Enter Workflow');
                return;
            }
            $scope.selectedVariantFilter = -1;
            getFilteredVariants();
            getPanelCoverage();
        };

        function getFilteredVariants(){
            $http.post('/api/variantdatabase' + $scope.selectedWorkflow.Path,
                {
                    'RunInfoNodeId' : $scope.selectedAnalysis.RunInfoNodeId,
                    'PanelNodeId' : $scope.selectedPanel.PanelNodeId
                })
                .then(function(response) {
                    $scope.filteredVariants = response.data;
                    Notification('Operation successful');
                }, function(response) {
                    Notification.error(response);
                    console.log("ERROR: " + response);
                });
        }

        function getPanelCoverage(){ //todo
            $scope.coverageData = [{
                values: [
                    { "label" : "BRCA1" , "value" : Math.random() * 100 } , { "label" : "BRCA2" , "value" : Math.random() * 100 } , { "label" : "BRCA3" , "value" : Math.random() * 100 } , { "label" : "BRCA4" , "value" : Math.random() * 100 } , { "label" : "BRCA5" , "value" : Math.random() * 100 } , { "label" : "BRCA6" , "value" : Math.random() * 100 }
                ]
            }];
        }

        $scope.getAnnotations = function(variantNodeId, status){

            if (!status){
                $scope.annotations = '';
                return;
            }

            $http.post('/api/variantdatabase/functionalannotation',
                {
                    'NodeId' : variantNodeId
                })
                .then(function(response) {
                    $scope.annotations = response.data;
                    Notification('Operation successful');
                }, function(response) {
                    Notification.error(response);
                    console.log("ERROR: " + response);
                });
        };

        $scope.getVariantPopulationFrequency = function(variantNodeId){
            return $http.post('/api/variantdatabase/populationfrequency',
                {
                    'NodeId' : variantNodeId
                })
                .then(function(response) {
                    return response.data;
                }, function(response) {
                    Notification.error(response);
                    console.log("ERROR: " + response);
                });
        };

        $scope.exportVariants = function(){
            for (var key in $scope.filteredVariants.Variants) {
                if ($scope.filteredVariants.Variants.hasOwnProperty(key)) {
                    if ($scope.filteredVariants.Variants[key].Selected){
                        console.log($scope.filteredVariants.Variants[key].VariantId);
                    }
                }
            }
        };

        $scope.openPopulationFrequencyModal = function (items) {
            var modalInstance = $uibModal.open({
                animation: false,
                templateUrl: 'templates/populationFrequencyModal.html',
                controller: 'ModalInstanceCtrl',
                resolve: {
                    items: function () {
                        return items;
                    }
                }
            });
        };

        $http.get('/api/variantdatabase/analyses', {

        }).then(function(response) {
            $scope.analyses = response.data;
        }, function(response) {
            Notification.error(response);
            console.log("ERROR: " + response);
        });

        $http.get('/api/variantdatabase/panels', {

        }).then(function(response) {
            $scope.virtualPanels = response.data;
        }, function(response) {
            Notification.error(response);
            console.log("ERROR: " + response);
        });

        $http.get('/api/variantdatabase/workflows', {

        }).then(function(response) {
            $scope.workflows = response.data;
        }, function(response) {
            Notification.error(response);
            console.log("ERROR: " + response);
        });

    }])

    .controller('ModalInstanceCtrl', function ($scope, $modalInstance, items) {

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

        $scope.items = items;

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };

    });