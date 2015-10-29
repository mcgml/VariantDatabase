'use strict';

//todo add new gene panels

angular.module('variantdatabase.manage', ['ngRoute', 'ngAnimate', 'ngTouch', 'ui.bootstrap', 'ui-notification', 'nvd3'])

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

    .filter('convertAnnotationToKeywordsSearch', function() {
        return function (input) {

            var allKeywords = [];
            var returnKeywords = '';
            var hash = {};

            for (var key in input) {
                if (input.hasOwnProperty(key)) {

                    if (input[key].hasOwnProperty('SymbolId')){
                        allKeywords.push(input[key].SymbolId);
                    }

                    if (input[key].hasOwnProperty('HGVSc')){
                        allKeywords.push(input[key].HGVSc);
                    }

                    if (input[key].hasOwnProperty('HGVSp')){
                        allKeywords.push(input[key].HGVSp);
                    }

                }
            }

            //make unique list
            for (var i = 0; i < allKeywords.length; i++){
                if (!(allKeywords[i] in hash)) { //it works with objects! in FF, at least
                    hash[allKeywords[i]] = true;
                    returnKeywords += "\"" + allKeywords[i] + "\" ";
                }
            }

            return returnKeywords;
        }
    })

    .controller('ManageCtrl', ['$scope', '$http', 'Notification', '$uibModal', function ($scope, $http, Notification, $uibModal) {

        var cat20 = ["#1f77b4", "#aec7e8", "#ff7f0e", "#ffbb78", "#2ca02c", "#98df8a", "#d62728", "#ff9896"];

        $scope.barChartOptions = {
            chart: {
                type: 'discreteBarChart',
                height: 250,
                noData: "",
                color : function (d, i) { var key = i === undefined ? d : i; return d.color || cat20[key % cat20.length]; },
                x: function(d){return d.label;},
                y: function(d){return d.value;},
                showValues: false,
                showXAxis: false,
                showYAxis: true,
                "yAxis": {
                    "axisLabel": "Percentage Coverage"
                },
                valueFormat: function(d){
                    return d3.format(',.4f')(d);
                },
                transitionDuration: 500
            }
        };

        $scope.getGenes = function() {
            $http.post('/api/seraph',
                {
                    query:
                    "MATCH (v:VirtualPanel) WHERE id(v) = " + $scope.selectedVirtualPanel.PanelNodeId + " " +
                    "MATCH (v)-[:CONTAINS_SYMBOL]->(s:Symbol) " +
                    "RETURN s.SymbolId as Gene;",
                    params: {}
                })
                .then(function(response) {
                    $scope.genes = response.data;
                }, function(response) {
                    Notification.error(response);
                    console.log("ERROR: " + response);
                });
        };

        $scope.getVariantInformation = function(){
            $http.post('/api/variantdatabase/variantinformation',
                {
                    VariantId : $scope.selectedVariant
                })
                .then(function(response) {

                    $scope.variantInformation = response.data;

                    getVariantAnnotation($scope.variantInformation.VariantNodeId);
                    getVariantPopulationFrequency($scope.variantInformation.VariantNodeId);

                }, function(response) {
                    Notification.error(response);
                    console.log("ERROR: " + response);
                });
        };

        $scope.addVariantComment = function(){

            if ($scope.newCommentText == null || $scope.newCommentText == ''){
                Notification.error("Enter comment");
                return;
            }

            $http.post('/api/seraph',
                {
                    query:
                    "MATCH (v:Variant) where id(v) = " + $scope.variantInformation.VariantNodeId + " " +
                    "MATCH (u:User {UserId:\"ml\"})" +
                    "CREATE (u)-[:HAS_USER_COMMENT {Comment:\"" + $scope.newCommentText + "\", Date:" + new Date().getTime() + "}]->(v)",
                    params: {}
                })
                .then(function(response) {
                    $scope.getVariantInformation();
                },
                function(response) {
                    Notification.error(response);
                    console.log("ERROR: " + response);
                });
        };

        $scope.setVariantPathogenicity = function(){

            if ($scope.selectedPathogenicity == null){
                Notification.error("Select pathogenicity");
                return;
            }

            var query = "MATCH (v:Variant) where id(v) = " + $scope.variantInformation.VariantNodeId + " " +
                "MATCH (u:User {UserId:\"ml\"})" +
                "CREATE (u)-[:HAS_ASSIGNED_PATHOGENICITY {Value:toInt(\"" + $scope.selectedPathogenicity + "\"), Date:" + new Date().getTime();
            if ($scope.pathogenicityEvidenceText != null && $scope.pathogenicityEvidenceText != '') query += ", Comment:\"" + $scope.pathogenicityEvidenceText + "\"";
            query += "}]->(v)";

            $http.post('/api/seraph',
                {
                    query: query,
                    params: {}
                })
                .then(function(response) {
                    $scope.getVariantInformation();
                },
                function(response) {
                    Notification.error(response);
                    console.log("ERROR: " + response);
                });
        };

        $scope.openVariantInformationModal = function (variant) {

            $http.post('/api/variantdatabase/populationfrequency',
                {
                    'NodeId' : variant.VariantNodeId
                })
                .then(function(response) {
                    variant.PopulationFrequency = response.data;
                }, function(response) {
                    Notification.error(response);
                    console.log("ERROR: " + response);
                });

            $http.post('/api/variantdatabase/functionalannotation',
                {
                    'NodeId' : variant.VariantNodeId
                })
                .then(function(response) {
                    variant.Annotation = response.data;
                    Notification('Operation successful');
                }, function(response) {
                    Notification.error(response);
                    console.log("ERROR: " + response);
                });

            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: 'templates/VariantInformationModal.html',
                controller: 'ModalInstanceCtrl',
                windowClass: 'app-modal-window',
                size: 'lg',
                resolve: {
                    items: function () {
                        return variant;
                    }
                }
            });
        };

        function getVariantPopulationFrequency(nodeId){
            $http.post('/api/variantdatabase/populationfrequency',
                {
                    'NodeId' : nodeId
                })
                .then(function(response) {
                    $scope.populationFrequency = response.data;
                }, function(response) {
                    Notification.error(response);
                    console.log("ERROR: " + response);
                });
        }

        function getVariantAnnotation(nodeId){
            $http.post('/api/variantdatabase/functionalannotation',
                {
                    'NodeId' : nodeId
                })
                .then(function(response) {
                    $scope.Annotations = response.data;
                }, function(response) {
                    Notification.error(response);
                    console.log("ERROR: " + response);
                });
        }

        $http.get('/api/variantdatabase/panels', {})
            .then(function(response) {
                $scope.virtualPanels = response.data;
            }, function(response) {
                Notification.error(response);
                console.log("ERROR: " + response);
            });

    }])

    .controller('ModalInstanceCtrl', function ($scope, $uibModalInstance, items) {
        var cat20 = ["#1f77b4", "#aec7e8", "#ff7f0e", "#ffbb78", "#2ca02c", "#98df8a", "#d62728", "#ff9896"];
        $scope.items = items;

        $scope.barChartOptions = {
            chart: {
                type: 'discreteBarChart',
                height: 250,
                noData: "",
                color : function (d, i) { var key = i === undefined ? d : i; return d.color || cat20[key % cat20.length]; },
                x: function(d){return d.label;},
                y: function(d){return d.value;},
                showValues: false,
                showXAxis: false,
                showYAxis: true,
                "yAxis": {
                    "axisLabel": "Percentage Coverage"
                },
                valueFormat: function(d){
                    return d3.format(',.4f')(d);
                },
                transitionDuration: 500
            }
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };

    });