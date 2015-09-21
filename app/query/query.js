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

        $scope.workflows = [ "AllVariants", "AutosomalDomainant", "AutosomalRecessive", "X-Linked", "Y-Linked", "MT-Linked" ];

        $scope.gridOptions = {
            enableSorting: true,
            enableFiltering: true,
            enableRowSelection: true,
            enableSelectAll: true,
            enableRowHeaderSelection: true,
            enableGridMenu: true,
            exporterCsvFilename: 'data.csv',
            exporterMenuPdf: false,
            exporterCsvLinkElement: angular.element(document.querySelectorAll(".custom-csv-link-location")),
            onRegisterApi: function (gridApi){
                $scope.gridApi = gridApi;
            },
            appScopeProvider: {
                onDblClick : function(row) {
                    $scope.fullVariantInfo(row.entity);
                }
            },
            rowTemplate: "<div ng-dblclick=\"grid.appScope.onDblClick(row)\" ng-repeat=\"(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name\" class=\"ui-grid-cell\" ng-class=\"{ 'ui-grid-row-header-cell': col.isRowHeader }\" ui-grid-cell ></div>",
            columnDefs: [
                { name: "Variant", width: "10%" },
                { name: "Id", width: "10%" },
                { name: "Inheritance", width: "10%" },
                { name: "Symbol", width: "10%" },
                { name: "Transcript", width: "11.5%" },
                { name: "Consequence", width: "25%" },
                { name: "HGVSc", displayName: "HGVSc", width: "10%" },
                { name: "HGVSp", displayName: "HGVSp", width: "10%" }
            ]
        };

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
            if ($scope.selectWorkflow == "AllVariants"){
                $scope.filterUnknownInheritanceVariants();
            }
        };

        $scope.filterUnknownInheritanceVariants = function(){
            $http.post('/api/seraph', {
                query:
                "MATCH (s:Sample)-[:HAS_ANALYSIS]->(r:RunInfo)-[i]->(v:Variant)-[:IN_SYMBOL]->(sy:Symbol)<-[:CONTAINS_SYMBOL]-(p:VirtualPanel) " +
                "WHERE s.SampleId = {SampleId} " +
                "AND r.RunId = {RunId} " +
                "AND r.LibraryId = {LibraryId} " +
                "AND i.Quality > 30 " +
                "AND p.PanelName = {PanelName} " +
                "OPTIONAL MATCH (v)-[c]->(a:Annotation)-[:IN_FEATURE]->(f:Feature)<-[b:HAS_PROTEIN_CODING_TRANSCRIPT]-(sy)-[:HAS_ASSOCIATED_DISORDER]->(d:Disorder) " +
                "RETURN v.VariantId as Variant,v.Id as Id," +
                "CASE type(i) WHEN 'HAS_HOM_VARIANT' THEN 'HOM' WHEN 'HAS_HET_VARIANT' THEN 'HET' END AS Inheritance,f.FeatureId as Transcript, a.Exon as Exon, a.Intron as Intron, type(c) as Consequence," +
                "a.HGVSc as HGVSc,a.HGVSp as HGVSp,a.Sift as SIFT,a.Polyphen as PolyPhen,sy.SymbolId as Symbol",
                params: {
                    SampleId : $scope.selectedAnalysis.SampleId,
                    RunId : $scope.selectedAnalysis.RunId,
                    LibraryId : $scope.selectedAnalysis.LibraryId,
                    PanelName : $scope.selectedPanel.PanelName
                }
            }).then(function(response) {
                $scope.gridOptions.data = response.data;
                Notification('Operation successful');
            }, function(response) {
                Notification.error(response);
            });

        };

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

        //bubble chart
        $scope.generate = function(){
            // Generate random data
            var bubbles = [];

            var mult = 40;
            var add = 5;

            bubbles.push({
                x: 0,
                r: (0.01 * mult) + add,
                label: "filter0"
            });

            bubbles.push({
                x: 1,
                r: (0.1 * mult) + add,
                label: "filter1"
            });

            bubbles.push({
                x: 2,
                r: (1 * mult) + add,
                label: "filter2"
            });

            $scope.bubbles = bubbles;
        };

        $scope.generate();

        $scope.handleClick = function(d){
            alert(JSON.stringify(d));
        };

    }])

    .controller('ModalInstanceCtrl', function ($scope, $modalInstance, $window, items) {

        $scope.items = items;

        $scope.close = function () {
            $modalInstance.dismiss();
        };

    });

angular.d3KitAdapter.plug(app, 'bubbleChart', BubbleChart);