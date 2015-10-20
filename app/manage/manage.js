'use strict';

angular.module('variantdb.manage', ['ngRoute', 'ui.bootstrap', 'ui-notification'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/manage', {
            templateUrl: 'manage/manage.html',
            controller: 'ManageCtrl'
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

    .controller('ManageCtrl', ['$scope', '$http', 'Notification', function ($scope, $http, Notification) {

        $scope.getGenes = function() {
            $http.post('/api/seraph', {
                query:
                    "MATCH (v:VirtualPanel {PanelName:\"" + $scope.selectedPanel.PanelName + "\"})-[:CONTAINS_SYMBOL]->(s:Symbol) " +
                    "RETURN s.SymbolId as Gene;",
                params: {}
            }).then(function(response) {
                $scope.genes = response.data;
            }, function(response) {
                console.log("ERROR: " + response);
            });
        };

        $scope.removeGeneFromPanel = function(symbolId){
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

        $scope.getVariantInfo = function(){
            $http.post('/api/seraph', {
                query:
                    "MATCH (v:Variant {VariantId:\"" + $scope.selectedVariant + "\"}) " +
                    "OPTIONAL MATCH (v)<-[p:HAS_ASSOCIATED_PATHOGENICITY]-(u:User) " +
                    "RETURN v.VariantId as Variant, ID(v) as VariantNodeId, v.Id as dbSNP, p.Class as Class, p.Comment as Comment, p.Time as Time, u.UserName as User;",
                params: {}
            }).then(function(response) {

                //check if variant was found
                if (response.data == '') {
                    Notification.error($scope.selectedVariant + ' Not Found');
                    return;
                }

                $scope.variantInfo = response.data;
                $scope.getVariantAnnotations();

            }, function(response) {
                console.log("ERROR: " + response);
            });
        };

        $scope.getVariantAnnotations = function(){
            $http.post('/api/variantdatabase/functionalannotation',
                {
                    'NodeId' : $scope.variantInfo.VariantNodeId
                }
            ).then(function(response) {
                    $scope.Annotations = response.data;
                }, function(response) {
                    console.log("ERROR: " + response);
                });
        };

        //get all panels
        $http.post('/api/seraph', { //todo: plugin
            query:
            "MATCH (v:VirtualPanel)-[rel:DESIGNED_BY]->(u:User) " +
            "RETURN v.PanelName as PanelName, ID(v) as PanelNodeId, rel.Date as Date, u.UserName as UserName;",
            params: {}
        }).then(function(response) {
            $scope.virtualPanels = response.data;
        }, function(response) {
            console.log("ERROR: " + response);
        });

    }]);