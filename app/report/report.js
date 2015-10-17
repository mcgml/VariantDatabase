'use strict';

angular.module('variantdb.report', ['ngRoute', 'ngAnimate', 'ngTouch', 'ui.bootstrap', 'ui-notification', 'nvd3'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/report', {
            templateUrl: 'report/report.html',
            controller: 'ReportCtrl'
        });
    }])

    .config(['$httpProvider', function($httpProvider) {
        $httpProvider.defaults.cache = true; // enable http caching
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
        var pathogenicityClasses = ["btn btn-default btn-xs noMargin", "btn btn-success btn-xs noMargin", "btn btn-warning btn-xs noMargin", "btn btn-danger btn-xs noMargin"];

        $scope.selectedVariantFilter = -1;

        //create pie navigation chart
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

        $scope.getPathogenicityClass = function(index){
            return pathogenicityClasses[index];
        };

        $scope.processReportRequest = function(){
            if ($scope.selectedAnalysis == '' || $scope.selectedAnalysis == undefined){
                Notification('Enter Sample');
                return;
            }
            if ($scope.selectedPanel == '' || $scope.selectedPanel == undefined){
                Notification('Enter Panel');
                return;
            }
            if ($scope.selectedWorkflow == '' || $scope.selectedWorkflow == undefined){
                Notification('Enter Workflow');
                return;
            }
            $scope.getFilteredVariants();
            $scope.getPanelCoverage();
            $scope.selectedVariantFilter = -1;
        };

        $scope.getFilteredVariants = function(){
            $http.post('/api/variantfilter',
                {
                    'SampleId' : $scope.selectedAnalysis.SampleId,
                    'RunId' : $scope.selectedAnalysis.RunId,
                    'LibraryId' : $scope.selectedAnalysis.LibraryId,
                    'PanelName' : $scope.selectedPanel.PanelName,
                    'WorkflowPath' : $scope.selectedWorkflow.Path
                }
            ).then(function(response) {
                    $scope.filteredVariants = response.data;
                    Notification('Operation successful');
                }, function(response) {
                    console.log("ERROR: " + response);
                });
        };

        $scope.getPanelCoverage = function(){ //todo
            $scope.coverageData = [{
                values: [
                    { "label" : "BRCA1" , "value" : Math.random() * 100 } , { "label" : "BRCA2" , "value" : Math.random() * 100 } , { "label" : "BRCA3" , "value" : Math.random() * 100 } , { "label" : "BRCA4" , "value" : Math.random() * 100 } , { "label" : "BRCA5" , "value" : Math.random() * 100 } , { "label" : "BRCA6" , "value" : Math.random() * 100 }
                ]
            }];
        };

        $scope.getAnnotations = function(variantId, status){

            if (!status){
                $scope.annotations = '';
                return;
            }

            $http.post('/api/variantfilter/functionalannotation',
                {
                    'VariantId' : variantId
                }
            ).then(function(response) {
                    $scope.annotations = response.data;
                    Notification('Operation successful');
                }, function(response) {
                    console.log("ERROR: " + response);
                });
        };

        $scope.getVariantPopulationFrequency = function(variantId){
            console.log("hi");
            return $http.post('/api/variantfilter/populationfrequency',
                {
                    'VariantId' : variantId
                }
            ).then(function(response) {
                    return response.data;
                }, function(response) {
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
                animation: true,
                templateUrl: 'myModalContent.html',
                controller: 'ModalInstanceCtrl',
                resolve: {
                    items: function () {
                        return items;
                    }
                }
            });

        };

        //get all analyses
        $http.post('/api/seraph', { //todo: plugin
            query:
            "MATCH (s:Sample)-[:HAS_ANALYSIS]->(r:RunInfo) " +
            "RETURN s.SampleId as SampleId,r.LibraryId as LibraryId, r.RunId as RunId",
            params: {}
        }).then(function(response) {
            $scope.analyses = response.data;
        }, function(response) {
            console.log("ERROR: " + response);
        });

        //get all panels
        $http.post('/api/seraph', { //todo: plugin
            query:
                "MATCH (v:VirtualPanel) RETURN v.PanelName as PanelName",
            params: {}
        }).then(function(response) {
            $scope.virtualPanels = response.data;
        }, function(response) {
            console.log("ERROR: " + response);
        });

        //get all workflows
        $http.get('/api/workflows')
            .then(function(response) { //todo: plugin
                $scope.workflows = response.data;
            }, function(response) {
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