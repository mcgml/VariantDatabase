'use strict';

angular.module('variantdb.manage', ['ngRoute', 'ui.bootstrap', 'ui-notification'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/manage', {
            templateUrl: 'manage/manage.html',
            controller: 'ManageCtrl'
        });
    }])

    .controller('ManageCtrl', ['$scope', '$http', 'Notification', function ($scope, $http, Notification) {

        $scope.getGenes = function() {
            $http.post('/api/seraph', {
                query:
                    "MATCH (v:VirtualPanel {PanelName:\"" + $scope.selectedPanel.PanelName + "\"})-[:CONTAINS_SYMBOL]->(s:Symbol) " +
                    "OPTIONAL MATCH (s)-[:HAS_ASSOCIATED_DISORDER]->(d:Disorder)" +
                    "RETURN s.SymbolId as Gene,d.Title as OMIM;",
                params: {}
            }).then(function(response) {
                $scope.genes = response.data;
            }, function(response) {
                console.log("ERROR: " + response);
            });
        };

        $scope.removeGeneFromPanel = function(symbolId){
            console.log("MATCH (v:VirtualPanel {PanelName:\"" + $scope.selectedPanel.PanelName + "\"})-[cs:CONTAINS_SYMBOL]->(s:Symbol {SymbolId:\"" + symbolId + "\"}) " + "DELETE cs;");
            $http.post('/api/seraph', {
                query:
                "MATCH (v:VirtualPanel {PanelName:\"" + $scope.selectedPanel.PanelName + "\"})-[cs:CONTAINS_SYMBOL]->(s:Symbol {SymbolId:\"" + symbolId + "\"}) " +
                "DELETE cs;",
                params: {}
            }).then(function(response) {
                $scope.getGenes();
            }, function(response) {
                console.log("ERROR: " + response);
            });
        };

        //get all panels
        $http.post('/api/seraph', { //todo: plugin
            query:
                "MATCH (v:VirtualPanel) RETURN v.PanelName as PanelName",
            params: {}
        }).then(function(response) {
            $scope.virtualPanels = response.data;
        }, function(response) {
            console.log("ERROR: " + response);
        });

    }]);