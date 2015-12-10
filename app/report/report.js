'use strict';

//todo add new gene panels
//todo add fields and output for SHIRE import
//todo center align population frequencies
//todo check af calculations
//todo add mutation taster
//todo splicing

angular.module('variantdatabase.report', ['ngRoute', 'ui.bootstrap', 'ui-notification', 'nvd3'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/report', {
            templateUrl: 'report/report.html',
            controller: 'ReportCtrl'
        });
    }])

    .controller('ReportCtrl', ['$scope', '$window', '$http', 'Notification', '$uibModal', 'framework', function ($scope, $window, $http, Notification, $uibModal, framework) {

        $scope.selectedVariantFilter = -1;
        $scope.donutChartOptions = {
            chart: {
                type: 'pieChart',
                height: 250,
                noData: "",
                donut: true,
                color : function (d, i) { var key = i === undefined ? d : i; return d.color || framework.getScaledCat20(key); },
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

        $scope.getFilteredVariants = function () {

            $scope.selectedVariantFilter = -1; //reset piechart filter

            //check input
            if (!framework.checkInput("Sample", $scope.selectedAnalysis)) return;
            if (!framework.checkInput("Panel", $scope.selectedVirtualPanel)) return;
            if (!framework.checkInput("Workflow", $scope.selectedWorkflow)) return;

            $http.post('/api/variantdatabase' + $scope.selectedWorkflow.Path,
                {
                    'RunInfoNodeId' : $scope.selectedAnalysis.RunInfoNodeId,
                    'PanelNodeId' : $scope.selectedVirtualPanel.PanelNodeId
                })
                .then(function(response) {
                    $scope.filteredVariants = response.data;
                    Notification('Operation successful');
                }, function(response) {
                    Notification.error(response);
                    console.log("ERROR: " + response);
                });

        };

        $scope.openVariantAnnotationModal = function (variant) {

            $http.post('/api/variantdatabase/functionalannotation',
                {
                    'VariantNodeId' : variant.VariantNodeId
                })
                .then(function(response) {
                    variant.Annotation = response.data;
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

        $scope.openVariantSubtractionModal = function () {

            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: 'templates/VariantSubtractionModal.html',
                controller: 'VariantSubtractionCtrl',
                resolve: {
                    items: function () {
                        return $scope.analyses;
                    }
                }
            });
        };

        $scope.exportVariants = function(){
            var saved = [];

            //skip missing dataset
            if ($scope.filteredVariants === null) return;

            for (var key in $scope.filteredVariants.Variants) {
                if ($scope.filteredVariants.Variants.hasOwnProperty(key)) {
                    if ($scope.filteredVariants.Variants[key].Selected){

                        var tempObj = $scope.filteredVariants.Variants[key];
                        saved.push(tempObj);

                    }
                }
            }

            //write output file
            var blob = new Blob([JSON.stringify(saved)]);
            saveAs(blob, "export.json");

        };

        $scope.openEnsemblVariantLink = function(variant){
            $window.open(framework.getEnsemblRangeLink() + framework.convertVariantToRange(variant), '_blank');
        };
        $scope.openUCSCVariantLink = function(variant){
            $window.open(framework.getUCSCRangeLink() + framework.convertVariantToRange(variant), '_blank');
        };
        $scope.openIGVLink = function(remoteBamPath, variant){
            $window.open(framework.getIGVLink(remoteBamPath, framework.convertVariantToRange(variant)), '_blank');
        };
        $scope.open1kgVariantLink = function(variant){
            $window.open(framework.get1kgRangeLink() + framework.convertVariantToRange(variant), '_blank');
        };
        $scope.openExACVariantLink = function(variant){
            $window.open(framework.getExACVariantLink() + framework.convertVariantToExAC(variant), '_blank');
        };
        $scope.openDbSNPIdVariantLink = function(dbSNPId){
            $window.open(framework.getDbSNPIdVariantLink() + dbSNPId, '_blank');
        };

        //populate typeaheads on pageload
        getAnalyses();
        getPanels();
        getWorkflows();

    }]);