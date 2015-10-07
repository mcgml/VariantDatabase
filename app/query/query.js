'use strict';

angular.module('variantdb.query', ['ngRoute', 'ngAnimate', 'ngTouch', 'ui.bootstrap', 'ui-notification', 'nvd3', 'ui.grid'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/query', {
            templateUrl: 'query/query.html',
            controller: 'QueryCtrl'
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

    .controller('QueryCtrl', ['$scope', '$http', '$modal', 'Notification', '$log', '$timeout', 'uiGridConstants', function ($scope, $http, $modal, Notification, $log, $timeout, uiGridConstants) {

        //define grid ui options
        $scope.gridOptions = {
            enableSorting: true,
            enableFiltering: true,
            enableColumnMenus: true,
            enableRowSelection : true,
            multiSelect : true,
            enableRowHeaderSelection : true,
            showGridFooter:true,
            onRegisterApi : function(gridApi) {

                $scope.gridApi = gridApi;

                gridApi.selection.on.rowSelectionChanged($scope, function (row) {
                    var msg = 'row selected ' + row.isSelected;
                    console.log(msg);
                });

                gridApi.selection.on.rowSelectionChangedBatch($scope, function (rows) {
                    var msg = 'rows changed ' + rows.length;
                    console.log(msg);
                });
            }
        };

        //define grid ui columns
        $scope.gridOptions.columnDefs = [
            { field: 'VariantId', displayName: "VariantId", width: '40%' },
            { field: 'Id', displayName: "Id", width: '20%' },
            { field: 'Inheritance', displayName: "Inheritance", width: '20%' },
            { field: 'Filter', displayName: "Filter", width: '20%', visible: false,
                filter: {
                    noTerm: true,
                    condition: function(searchTerm, cellValue) {
                        return cellValue == $scope.selectedFilter;
                    }
                }
            }
        ];

        //get available filtering workflows
        $http.get('/api/workflows').then(function(response) {
            $scope.workflows = response.data;
        }, function(response) {
            console.log("ERROR: " + response);
        });

        //get all analyses
        $http.post('/api/seraph', {
            query:
            "MATCH (s:Sample)-[:HAS_ANALYSIS]->(r:RunInfo) " +
            "RETURN s.SampleId as SampleId,r.LibraryId as LibraryId, r.RunId as RunId",
            params: {}
        }).then(function(response) {
            $scope.analyses = response.data;
        }, function(response) {
            console.log("ERROR: " + response);
        });

        //get all virtual panels
        $http.post('/api/seraph', {
            query:
                "MATCH (v:VirtualPanel) RETURN v.PanelName as PanelName",
            params: {}
        }).then(function(response) {
            $scope.virtualPanels = response.data;
        }, function(response) {
            console.log("ERROR: " + response);
        });

        //stratify variants
        $scope.filterVariants = function(){
            $http.post('/api/variantfilter',
                {
                    SampleId : $scope.selectedAnalysis.SampleId,
                    RunId : $scope.selectedAnalysis.RunId,
                    LibraryId : $scope.selectedAnalysis.LibraryId,
                    PanelName : $scope.selectedPanel.PanelName,
                    WorkflowPath : $scope.selectedWorkflow.Path
                }
            ).then(function(response) {
                    $scope.gridOptions.data = response.data.Variants;
                    $scope.variantFilters = response.data.Filters;
                    Notification('Operation successful');
                }, function(response) {
                    Notification.error(response);
                });
        };

        //get variant annotations
        $scope.getFunctionalAnnotations = function(variantId){
            $http.post('/api/seraph', {
                query:
                "OPTIONAL MATCH (v:Variant {VariantId:\"" + variantId + "\"})-[c]-(a:Annotation)-[]-(f:Feature)-[b:HAS_PROTEIN_CODING_BIOTYPE]-(sy:Symbol) " +
                "RETURN f.FeatureId as Feature,a.Exon as Exon, a.Intron as Intron,type(c) as Consequence,a.HGVSc as HGVSc,a.HGVSp as HGVSp,a.Sift as SIFT,a.Polyphen as PolyPhen,sy.SymbolId as Symbol",
                params: {}
            }).then(function(response) {
                $scope.annotation = response.data;
            }, function(response) {
                console.log("ERROR: " + response);
            });
        };

        //show population frequencies
        $scope.fullVariantInfo = function (variant)  {
            var modalInstance = $modal.open({
                animation: false,
                templateUrl: 'myModalContent.html',
                controller: 'ModalInstanceCtrl',
                resolve: {
                    items: function () {
                        return variant;
                    }
                }
            });
        };

        //create pie navigation chart
        $scope.donutChartOptions = {
            chart: {
                type: 'pieChart',
                height: 400,
                donut: true,
                x: function(d){return d.key;},
                y: function(d){return d.y;},
                showLabels: false,
                pie: {
                    startAngle: function(d) { return d.startAngle/2 -Math.PI/2 },
                    endAngle: function(d) { return d.endAngle/2 -Math.PI/2 },
                    dispatch: {
                        elementClick: function(e) {
                            $scope.selectedFilter = e.index;
                            $scope.gridApi.grid.refresh();
                        }
                    }
                },
                transitionDuration: 500
            }
        };

        /*make bubble chart
        $scope.createBubbleChart = function() {
            var bubbles = [];

            //loop over filters
            for (var i = 0; i < $scope.filteredVariants.Filters.length; i++) {

                for (var key in $scope.filteredVariants.Filters[i])
                {
                    if ($scope.filteredVariants.Filters[i].hasOwnProperty(key)){

                        bubbles.push({
                            x: i,
                            r: $scope.filteredVariants.Filters[i][key] * 40 + 4,
                            label: key
                        });

                    }
                }

            }

            $scope.bubbles = bubbles;
        };

        $scope.handleBubbleChartClick = function(d){
            $scope.selectedFilter = d.x;
            //$scope.$apply();
        };*/

    }])

    .controller('ModalInstanceCtrl', function ($scope, $modalInstance, $window, items) {

        $scope.items = items;

        $scope.close = function () {
            $modalInstance.dismiss();
        };

    });