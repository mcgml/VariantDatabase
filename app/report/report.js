'use strict';

//todo add fields and output for SHIRE import
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
                            $scope.pageCount = Math.ceil($scope.filteredVariants.filters[$scope.selectedVariantFilter]["y"] / $scope.itemsPerPage) - 1;
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

            if ($scope.selectedAnalysis === undefined || $scope.selectedAnalysis.runInfoNodeId === undefined){
                Notification.error("Select index dataset");
                return;
            }

            if ($scope.selectedWorkflow === undefined || $scope.selectedWorkflow === '' || $scope.selectedWorkflow === null){
                Notification.error("Select stratification workflow");
                return;
            }

            //define obj for sending to server
            savedVariantFilters.runInfoNodeId = $scope.selectedAnalysis.runInfoNodeId;
            savedVariantFilters.workflowName = $scope.selectedWorkflow.name;

            if (!savedVariantFilters.hasOwnProperty('excludeRunInfoNodes')){
                savedVariantFilters.excludeRunInfoNodes = [];
            }
            if (!savedVariantFilters.hasOwnProperty('includePanelNodes')){
                savedVariantFilters.includePanelNodes = [];
            }

            $http.post('/api/variantdatabase/getfilteredvariants', savedVariantFilters)
                .then(function(response) {
                    $scope.filteredVariants = response.data;
                    $scope.donutChartOptions.chart.title = response.data.total;
                    Notification('Operation successful');
                }, function(response) {
                    Notification.error(response);
                    console.log("ERROR: " + response);
                });
        };

        $scope.openVariantAnnotationModal = function (variant) {

            $http.post('/api/variantdatabase/functionalannotation',
                {
                    'variantNodeId' : variant.variantNodeId
                })
                .then(function(response) {
                    variant.annotation = response.data;
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
                    'variantNodeId' : variant.variantNodeId
                })
                .then(function(response) {
                    seen.occurrences = response.data;
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

            for (var key in $scope.filteredVariants.variants) {
                if ($scope.filteredVariants.variants.hasOwnProperty(key)) {
                    if ($scope.filteredVariants.variants[key].selected){

                        var tempObj = {};

                        tempObj.sampleId = $scope.selectedAnalysis["sampleId"];
                        tempObj.seqId = $scope.selectedAnalysis["seqId"];
                        tempObj.worklistId = $scope.selectedAnalysis["worklistId"];
                        tempObj.variantId = $scope.filteredVariants.variants[key]["variantId"];
                        tempObj.inheritance = $scope.filteredVariants.variants[key]["inheritance"];

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
        $scope.openDbSNPIdVariantLink = function(dbSnpId){
            $window.open(framework.getDbSNPIdVariantLink() + dbSnpId, '_blank');
        };

        //populate typeaheads on pageload
        getAnalyses();
        getWorkflows();

    }]);