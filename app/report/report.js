'use strict';

//todo add fields and output for SHIRE import
//todo center align population frequencies
//todo check af calculations
//todo add mutation taster
//todo splicing

angular.module('variantdatabase.report', ['ngRoute', 'ngSanitize', 'ngCsv', 'ui.bootstrap', 'ui-notification', 'nvd3'])

    .controller('ReportCtrl', ['$scope', '$http', 'Notification', '$uibModal', '$window','framework', '$anchorScroll', function ($scope, $http, Notification, $uibModal, $window, framework, $anchorScroll) {

        $scope.selectedVariantFilter = -1;
        $scope.idSelected = null;
        $scope.itemsPerPage = 25;
        $scope.currentPage = 0;
        var savedVariantFilters = {};

        $scope.range = function() {
            var rangeSize = 10;
            var ret = [];
            var start;

            start = $scope.currentPage;
            if ( start > $scope.pageCount-rangeSize ) {
                start = $scope.pageCount-rangeSize+1;
            }

            for (var i=start; i<start+rangeSize; i++) {
                if (i >=0)
                    ret.push(i);
            }
            return ret;
        };

        $scope.setSelected = function (idSelected) {
            $scope.idSelected = idSelected;
        };

        $scope.setPage = function(n) {
            $scope.currentPage = n;
            $anchorScroll('donutChart');
        };

        $scope.prevPage = function() {
            if ($scope.currentPage > 0) {
                $scope.currentPage--;
                $anchorScroll('donutChart');
            }
        };

        $scope.prevPageDisabled = function() {
            return $scope.currentPage === 0 ? "disabled" : "";
        };

        $scope.nextPage = function() {
            if ($scope.currentPage < $scope.pageCount) {
                $scope.currentPage++;
                $anchorScroll('donutChart');
            }
        };

        $scope.nextPageDisabled = function() {
            return $scope.currentPage === $scope.pageCount ? "disabled" : "";
        };

        $scope.donutChartOptions = {
            chart: {
                type: 'pieChart',
                donut: true,
                height : 250,
                showLabels: false,
                color : function (d, i) { var key = i === undefined ? d : i; return d.color || framework.getScaledCat20(key); },
                x: function(d){return d.key;},
                y: function(d){return d.y;},
                pie: {
                    dispatch: {
                        elementClick: function(e) {
                            $scope.selectedVariantFilter = e.index;
                            $scope.currentPage = 0;
                            $scope.pageCount = Math.ceil($scope.filteredVariants.Filters[$scope.selectedVariantFilter]["y"] / $scope.itemsPerPage) - 1;
                            $scope.$apply();
                        }
                    }
                }
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

            if ($scope.selectedAnalysis === undefined){
                Notification.error("Select index dataset");
                return;
            }

            if ($scope.selectedWorkflow === undefined || $scope.selectedWorkflow === '' || $scope.selectedWorkflow === null){
                Notification.error("Select stratification workflow");
                return;
            }

            //define obj for sending to server
            savedVariantFilters.RunInfoNodeId = $scope.selectedAnalysis.RunInfoNodeId;
            savedVariantFilters.workflowName = $scope.selectedWorkflow.Name;

            if (!savedVariantFilters.hasOwnProperty('excludeRunInfoNodes')){
                savedVariantFilters.excludeRunInfoNodes = [];
            }
            if (!savedVariantFilters.hasOwnProperty('includePanelNodes')){
                savedVariantFilters.includePanelNodes = [];
            }

            $http.post('/api/variantdatabase/getfilteredvariants', savedVariantFilters)
                .then(function(response) {
                    $scope.filteredVariants = response.data;
                    $scope.donutChartOptions.chart.title = response.data.Total;
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

        $scope.openVariantSelectionModal = function () {

            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: 'templates/VariantSelectionModal.html',
                controller: 'VariantSelectionCtrl',
                size: 'lg',
                resolve: {
                    items: function () {
                        return $scope.analyses;
                    }
                }
            }).result.then(function(result) {
                savedVariantFilters = result;
            });

        };

        $scope.getCsvHeaders = function () {
            return ["SampleId", "SeqId", "WorklistId", "VariantId", "Inheritance"];
        };

        $scope.exportVariants = function(){
            var saved = [];

            //skip missing dataset
            if ($scope.filteredVariants === null) return;

            for (var key in $scope.filteredVariants.Variants) {
                if ($scope.filteredVariants.Variants.hasOwnProperty(key)) {
                    if ($scope.filteredVariants.Variants[key].Selected){

                        var tempObj = {};

                        tempObj.SampleId = $scope.selectedAnalysis["SampleId"];
                        tempObj.SeqId = $scope.selectedAnalysis["SeqId"];
                        tempObj.WorklistId = $scope.selectedAnalysis["WorklistId"];
                        tempObj.VariantId = $scope.filteredVariants.Variants[key]["VariantId"];
                        tempObj.Inheritance = $scope.filteredVariants.Variants[key]["Inheritance"];

                        saved.push(tempObj);

                    }
                }
            }

            return saved;
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
        getWorkflows();

    }]);