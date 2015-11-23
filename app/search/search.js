'use strict';

angular.module('variantdatabase.search', ['ngRoute', 'ui.bootstrap', 'ui-notification', 'nvd3'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/search', {
            templateUrl: 'search/search.html',
            controller: 'SearchCtrl'
        });
    }])

    .controller('SearchCtrl', ['$scope', '$http', 'Notification', '$uibModal', '$window', function ($scope, $http, Notification, $uibModal, $window) {

        function convertVariantToRangeFunction(variantId){
            var split1 = variantId.split(":");
            var split2 = split1[1].split(">");

            var refLength = split2[0].match(/\D/g).length;
            var altLength = split2[1].match(/\D/g).length;

            var startPosition = split2[0].replace(/\D/g, '');
            var endPosition = (startPosition - refLength) + altLength;

            return split1[0] + ":" + startPosition + "-" + endPosition;
        }

        $scope.openEnsemblLink = function(variantId){
            $window.open('http://grch37.ensembl.org/Homo_sapiens/Location/View?r=' + convertVariantToRangeFunction(variantId), '_blank');
        };

        $scope.openUCSCLink = function(variantId){
            $window.open('http://genome.ucsc.edu/cgi-bin/hgTracks?org=human&db=hg19&position=chr' + convertVariantToRangeFunction(variantId), '_blank');
        };

        $scope.openExACLink = function(variantId){

            var split1 = variantId.split(":");
            var split2 = split1[1].split(">");
            var startPosition = split2[0].replace(/\D/g, '');
            var refAllele = split2[0].replace(/\d/g, '');
            var altAllele = split2[1].replace(/\d/g, '');

            $window.open('http://exac.broadinstitute.org/variant/' + split1[0] + '-' + startPosition + '-' + refAllele + '-' + altAllele, '_blank');
        };

        $scope.getVirtualPanelGenes = function() {
            $http.post('/api/seraph',
                {
                    query:
                    "MATCH (v:VirtualPanel) WHERE id(v) = " + $scope.selectedVirtualPanel.PanelNodeId + " " +
                    "MATCH (v)-[:CONTAINS_SYMBOL]->(s:Symbol) " +
                    "RETURN s.SymbolId as SymbolId, s.GeneId as GeneId;",
                    params: {}
                })
                .then(function(response) {
                    $scope.genes = response.data;
                }, function(response) {
                    Notification.error(response);
                    console.log("ERROR: " + response);
                });
        };

        $scope.getFeature = function(){
            $http.post('/api/variantdatabase/featureinformation',
                {
                    FeatureId : $scope.selectedFeature
                })
                .then(function(response) {
                    $scope.featureInformation = response.data;
                    Notification('Operation successful');
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

                }, function(response) {
                    Notification.error(response);
                    console.log("ERROR: " + response);
                });
        };

        function getVariantAnnotation(nodeId) {
            $http.post('/api/variantdatabase/functionalannotation',
                {
                    'NodeId': nodeId
                })
                .then(function (response) {
                    $scope.Annotations = response.data;
                }, function (response) {
                    Notification.error(response);
                    console.log("ERROR: " + response);
                });
        }

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

        $scope.changeFeaturePreference = function(featureInformation){
            var query;

            if(featureInformation.Preferred){
                query = "MATCH (u:User {UserId:\"ml\"}) " +
                    "MATCH (f:Feature) where id(f) = " + $scope.featureInformation.FeatureNodeId + " " +
                    "MATCH (f)-[:HAS_FEATURE_PREFERENCE]->(fp:FeaturePreference) " +
                    "CREATE (fp)-[rel:REMOVED_BY {Date:" + new Date().getTime() + "}]->(u)";
                if ($scope.preferredFeatureEvidenceText != null && $scope.preferredFeatureEvidenceText != '') query += "SET rel.Evidence = \"" + $scope.preferredFeatureEvidenceText + "\"";

            } else {
                query = "MATCH (u:User {UserId:\"ml\"}) " +
                    "MATCH (f:Feature) where id(f) = " + $scope.featureInformation.FeatureNodeId + " " +
                    "CREATE (f)-[:HAS_FEATURE_PREFERENCE]->(fp:FeaturePreference)-[rel:ADDED_BY {Date:" + new Date().getTime() + "}]->(u) ";
                if ($scope.preferredFeatureEvidenceText != null && $scope.preferredFeatureEvidenceText != '') query += "SET rel.Evidence = \"" + $scope.preferredFeatureEvidenceText + "\"";
            }

            $http.post('/api/seraph',
                {
                    query: query,
                    params: {}
                })
                .then(function(response) {
                    $scope.getFeature();
                },
                function(response) {
                    Notification.error(response);
                    console.log("ERROR: " + response);
                });
        };

        $scope.openVariantAnnotationModal = function (variant) {

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
                templateUrl: 'templates/VariantAnnotationModal.html',
                controller: 'VariantAnnotationCtrl',
                windowClass: 'app-modal-window',
                size: 'lg',
                resolve: {
                    items: function () {
                        return variant;
                    }
                }
            });

        };

        $http.get('/api/variantdatabase/panels', {})
            .then(function(response) {
                $scope.virtualPanels = response.data;
            }, function(response) {
                Notification.error(response);
                console.log("ERROR: " + response);
            });

    }]);