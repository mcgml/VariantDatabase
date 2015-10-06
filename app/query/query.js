'use strict';

var app = angular.module('variantdb.query', ['ngRoute', 'ui.bootstrap', 'ui-notification'])

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

    .controller('QueryCtrl', ['$scope', '$http', '$modal', 'Notification', function ($scope, $http, $modal, Notification) {

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
                    $scope.filteredVariants = response.data;
                    $scope.selectedFilter = $scope.filteredVariants.Filters.length - 1; //show pass variants on page load
                    $scope.createBubbleChart();
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
                animation: true,
                templateUrl: 'myModalContent.html',
                controller: 'ModalInstanceCtrl',
                size: 'lg',
                resolve: {
                    items: function () {
                        return variant;
                    }
                }
            });

        };

        //make bubble chart
        $scope.createBubbleChart = function() {
            var bubbles = [];

            //loop over filters
            for (var i = 0; i < $scope.filteredVariants.Filters.length; i++) {

                for (var key in $scope.filteredVariants.Filters[i])
                {
                    if ($scope.filteredVariants.Filters[i].hasOwnProperty(key)){

                        bubbles.push({
                            x: i,
                            r: $scope.filteredVariants.Filters[i][key] * 50,
                            label: key
                        });

                    }
                }

            }

            $scope.bubbles = bubbles;
        };

        $scope.handleClick = function(d){
            $scope.selectedFilter = d.x;
            $scope.$apply();
        };

    }])

    .controller('ModalInstanceCtrl', function ($scope, $modalInstance, $window, items) {
        $scope.items = items;

        $scope.close = function () {
            $modalInstance.dismiss();
        };

    });

angular.d3KitAdapter.plug(app, 'bubbleChart', BubbleChart);