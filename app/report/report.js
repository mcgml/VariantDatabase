'use strict';

//todo add fields and output for SHIRE import
//todo add mutation taster
//todo splicing

angular.module('variantdatabase.report', ['ngRoute', 'ngSanitize', 'ngAnimate', 'ui.bootstrap', 'ui-notification', 'nvd3' ,'ngFileSaver'])

    .controller('ReportCtrl', ['$rootScope', '$scope', '$http', 'Notification', '$uibModal', '$window','framework', '$anchorScroll','FileSaver', 'Blob', function ($rootScope, $scope, $http, Notification, $uibModal, $window, framework, $anchorScroll, FileSaver, Blob) {

        $scope.selectedVariantFilter = -1;
        $scope.idSelected = null;
        $scope.itemsPerPage = 25;
        $scope.currentPage = 0;
        var savedVariantFilters = {};

        $scope.variantPathogenicity = {
            templateUrl: 'templates/AddVariantPathogenicityPopover.html',
            add : function(nodeId,pathogenicity,evidence) {
                $http.post('/api/variantdatabase/variant/addpathogenicity',
                    {
                        variantNodeId: nodeId,
                        userNodeId: $rootScope.user.userNodeId,
                        classification: pathogenicity,
                        evidence: evidence
                    })
                    .then(function (response) {
                        Notification(pathogenicity + ' classification successfully added');
                    }, function (response) {
                        Notification.error(response.data);
                        console.log("ERROR: " + response);
                    });
            }
        };

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

        $scope.checkAll = function () {
            for (var key in $scope.filteredVariants.variants) {
                if ($scope.filteredVariants.variants.hasOwnProperty(key) && $scope.filteredVariants.variants[key].filter === $scope.selectedVariantFilter) {
                    $scope.filteredVariants.variants[key].selected = $scope.selectedAll;
                }
            }

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
                            $scope.selectedAll = false;
                            $scope.$apply();
                        }
                    }
                }
            }
        };

        function getAnalyses() {
            $http.get('/api/variantdatabase/analyses/list', {

            }).then(function(response) {
                $scope.analyses = response.data;
            }, function(response) {
                Notification.error(response);
                console.log("ERROR: " + response);
            })
        }

        function getWorkflows() {
            $http.get('/api/variantdatabase/workflows/list', {

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

            $http.post('/api/variantdatabase/variant/filter', savedVariantFilters)
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

            $http.post('/api/variantdatabase/annotation/info',
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

            $http.post('/api/variantdatabase/variant/counts',
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

        $scope.exportSelected = function (){
            var variantNodeIds = [];

            angular.forEach($scope.filteredVariants.variants, function(exportVariant) {
                if (exportVariant.selected){
                    variantNodeIds.push(exportVariant.variantNodeId);
                }
            });

            //get annotations
            $http.post('/api/variantdatabase/report', {

                userNodeId : $rootScope.user.userNodeId,
                runInfoNodeId : $scope.selectedAnalysis.runInfoNodeId,
                variantNodeIds : variantNodeIds,
                workflowName : $scope.selectedWorkflow.name

            }).then(function(response) {

                var data = new Blob([response.data], { type: 'text/plain;charset=utf-8' });
                FileSaver.saveAs(data, $scope.selectedAnalysis.sampleId + '_' + $scope.selectedAnalysis.worklistId + '.tsv');

            }, function(response) {
                Notification.error(response);
                console.log("ERROR: " + response);
            });

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