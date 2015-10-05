'use strict';

var app = angular.module('variantdb.query', ['ngRoute', 'ngAnimate', 'ngTouch', 'ui.grid', 'ui.grid.selection', 'ui.grid.exporter', 'ui.bootstrap', 'ui-notification'])

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

    .controller('QueryCtrl',  ['$scope', '$http', '$interval', 'uiGridConstants', '$modal', 'Notification', function ($scope, $http, $interval, uiGridConstants, $modal, Notification) {

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

        $scope.filterVariants = function(){
            $http.post('/api/variantfilter',
                {
                    SampleId : $scope.selectedAnalysis.SampleId,
                    RunId : $scope.selectedAnalysis.RunId,
                    LibraryId : $scope.selectedAnalysis.LibraryId,
                    PanelName : $scope.selectedPanel.PanelName,
                    WorkflowPath :  $scope.selectedWorkflow.Path
                }
            ).then(function(response) {
                    $scope.variants = response.data;
                    $scope.createBubbleChart();
                    Notification('Operation successful');
                }, function(response) {
                    Notification.error(response);
                });
        };

        /*$http.post('/api/seraph', {
            query:
            "MATCH (s:Sample)-[:HAS_ANALYSIS]->(r:RunInfo)-[i]->(v:Variant)-[:IN_SYMBOL]->(sy:Symbol)<-[:CONTAINS_SYMBOL]-(p:VirtualPanel) " +
            "WHERE s.SampleId = {SampleId} " +
            "AND r.RunId = {RunId} " +
            "AND r.LibraryId = {LibraryId} " +
            "AND i.Quality > 30 " +
            "AND p.PanelName = {PanelName} " +
            "OPTIONAL MATCH (v)-[c]->(a:Annotation)-[:IN_FEATURE]->(f:Feature)<-[b:HAS_PROTEIN_CODING_BIOTYPE]-(sy)-[:HAS_ASSOCIATED_DISORDER]->(d:Disorder) " +
            "RETURN v.VariantId as Variant,v.Id as Id," +
            "CASE type(i) WHEN 'HAS_HOM_VARIANT' THEN 'HOM' WHEN 'HAS_HET_VARIANT' THEN 'HET' END AS Inheritance,f.FeatureId as Transcript, a.Exon as Exon, a.Intron as Intron, type(c) as Consequence," +
            "a.HGVSc as HGVSc,a.HGVSp as HGVSp,a.Sift as SIFT,a.Polyphen as PolyPhen,sy.SymbolId as Symbol",
            params: {
                SampleId : "NA128778",
                RunId : "150716_D00501_0047_BHB092ADXX",
                LibraryId : "K15-0000",
                PanelName : "BreastCancer"
            }
        }).then(function(response) {
            $scope.test = response.data;
            Notification('Operation successful');
        }, function(response) {
            Notification.error(response);
        });*/

        //modal variant info
        $scope.fullVariantInfo = function (entity)  {
            var modalInstance = $modal.open({
                animation: true,
                templateUrl: 'myModalContent.html',
                controller: 'ModalInstanceCtrl',
                size: 'lg',
                resolve: {
                    items: function () {
                        return entity;
                    }
                }
            });
        };

        //make bubble chart
        $scope.createBubbleChart = function() {
            var bubbles = [];
            var n = 0;

            for (var key in $scope.variants[0]) {
                if ($scope.variants[0].hasOwnProperty(key)) {
                    n+=2;
                    bubbles.push({
                        x: n,
                        r: 20,
                        label: key
                    });
                }
            }

            $scope.bubbles = bubbles;
        };

        $scope.handleClick = function(d){
            $scope.selectedBubble = d.label;
        };

    }])

    .controller('ModalInstanceCtrl', function ($scope, $modalInstance, $window, items) {
        $scope.items = items;

        $scope.close = function () {
            $modalInstance.dismiss();
        };

    });

angular.d3KitAdapter.plug(app, 'bubbleChart', BubbleChart);