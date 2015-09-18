'use strict';

angular.module('variantdb.query', ['ngRoute', 'ngAnimate', 'ngTouch', 'ui.grid', 'ui.grid.selection', 'ui.bootstrap'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/query', {
            templateUrl: 'query/query.html',
            controller: 'QueryCtrl'
        });
    }])

    .controller('QueryCtrl',  ['$scope', '$http', '$interval', 'uiGridConstants', '$modal', function ($scope, $http, $interval, uiGridConstants, $modal) {

        $scope.workflows = [ "AllVariants", "AutosomalDomainant", "AutosomalRecessive", "X-Linked", "Y-Linked", "MT-Linked" ];

        $scope.gridOptions = {
            enableRowSelection: true,
            enableRowHeaderSelection: false,
            enableFiltering: true,
            enableSorting: true,
            multiSelect : false,
            modifierKeysToMultiSelect : false,
            noUnselect : true,
            columnDefs: [
                { name: "Variant", width: "10%" },
                { name: "Id", width: "10%" },
                { name: "Inheritance", width: "10%" },
                { name: "Symbol", width: "10%" },
                { name: "Transcript", width: "12.5%" },
                { name: "Consequence", width: "27.25%" },
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
                // $interval whilst we wait for the grid to digest the data we just gave it
                $interval( function() {$scope.gridApi.selection.selectRow($scope.gridOptions.data[0]);}, 0, 1);
            }, function(response) {
                console.log("ERROR: " + response);
            });
        };

        //modal variant info
        $scope.items = ['item1', 'item2', 'item3'];
        $scope.fullVariantInfo = function () {

            var modalInstance = $modal.open({
                animation: true,
                templateUrl: 'myModalContent.html',
                controller: 'ModalInstanceCtrl',
                size: 'lg',
                resolve: {
                    items: function () {
                        return $scope.items;
                    }
                }
            });

            modalInstance.result.then(function (selectedItem) {
                $scope.selected = selectedItem;
            }, function () {
                console.log('Modal dismissed at: ' + new Date());
            });

        };

    }])

    .controller('ModalInstanceCtrl', function ($scope, $modalInstance, items) {

        $scope.items = items;
        $scope.selected = {
            item: $scope.items[0]
        };

        $scope.ok = function () {
            $modalInstance.close($scope.selected.item);
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };

    });