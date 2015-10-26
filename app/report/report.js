'use strict';

//todo turn off up/downstream effects + intergenic effects
//todo add validated transcript fields
//todo fix exac conversion
//todo add population frequency modal to report page
//todo fix igv link
//todo fix dropdown link out menu

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

            var split1 = input.split(":");
            var split2 = split1[1].split(">");

            var refLength = split2[0].match(/\D/g).length;
            var altLength = split2[1].match(/\D/g).length;

            var startPosition = split2[0].replace(/\D/g, '');
            var endPosition = (startPosition - refLength) + altLength;

            return split1[0] + ":" + startPosition + "-" + endPosition;
        }
    })

    .filter('convertVariantToClinvar', function(){
       return function (input){
           return "(15[Chromosome]) AND 48411007[Base Position for GRCh37]";
       }
    })

    .filter('convertVariantToExAC', function() {
        return function (input) {
            return input;
        }
    })

    .filter('convertAnnotationToKeywordsSearch', function() {
        return function (input) {

            var allKeywords = [];
            var returnKeywords = '';
            var hash = {};

            for (var key in input) {
                if (input.hasOwnProperty(key)) {

                    if (input[key].hasOwnProperty('Symbol')){
                        allKeywords.push(input[key].Symbol);
                    }

                    if (input[key].hasOwnProperty('HGVSc')){
                        allKeywords.push(input[key].HGVSc);
                    }

                    if (input[key].hasOwnProperty('HGVSp')){
                        allKeywords.push(input[key].HGVSp);
                    }

                }
            }

            //make unique list
            for (var i = 0; i < allKeywords.length; i++){
                if (!(allKeywords[i] in hash)) { //it works with objects! in FF, at least
                    hash[allKeywords[i]] = true;
                    returnKeywords += "\"" + allKeywords[i] + "\" ";
                }
            }

            return returnKeywords;
        }
    })

    .controller('ReportCtrl', ['$scope', '$window', '$http', 'Notification', '$uibModal', function ($scope, $window, $http, Notification, $uibModal) {
        var cat20 = ["#1f77b4", "#aec7e8", "#ff7f0e", "#ffbb78", "#2ca02c", "#98df8a", "#d62728", "#ff9896"];

        $scope.items = ['item1', 'item2', 'item3'];

        $scope.selectedVariantFilter = -1;

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

        $scope.exportVariants = function(){

            var saved = [];

            //skip missing dataset
            if ($scope.filteredVariants == null) return;

            for (var key in $scope.filteredVariants.Variants) {
                if ($scope.filteredVariants.Variants.hasOwnProperty(key)) {
                    if ($scope.filteredVariants.Variants[key].Selected){

                        //todo add fields and output for SHIRE import
                        var tempObj = $scope.filteredVariants.Variants[key];

                        saved.push(tempObj);
                    }
                }
            }

            //write output file
            var blob = new Blob([JSON.stringify(saved)]);
            saveAs(blob, "export.json");

        };

        $scope.launchIGV = function (remoteBamFilePath, variantId){
            $window.open('http://localhost:60151/load?file=' + remoteBamFilePath + '&locus=' + variantId + '&genome=GRCh37.75', '_blank');
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
                templateUrl: 'templates/variantInformation.html',
                controller: 'ModalInstanceCtrl',
                windowClass: 'app-modal-window',
                size: 'lg',
                resolve: {
                    items: function () {
                        return variant;
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
        $scope.items = items;

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

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };

    });