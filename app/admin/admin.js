'use strict';

angular.module('variantdatabase.admin', ['ngRoute', 'ui-notification'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/admin', {
            templateUrl: 'admin/admin.html',
            controller: 'AdminCtrl'
        });
    }])

    .controller('AdminCtrl', ['$scope', 'Notification', '$http', function ($scope, Notification, $http) {

        //get features for authorisation
        function getAddNewFeaturesForAuthorisation(){
            $http.post('/api/seraph',
                {
                    query:
                    "MATCH (f:Feature)-[:HAS_FEATURE_PREFERENCE]->(fp:FeaturePreference)-[rel:ADDED_BY]->(u:User) " +
                    "WHERE NOT (fp)-[:ADD_AUTHORISED_BY]->(:User) " +
                    "OPTIONAL MATCH (f)<-[:HAS_PROTEIN_CODING_BIOTYPE]-(s:Symbol) " +
                    "RETURN s.SymbolId as SymbolId, f.FeatureId as FeatureId, rel.Evidence as Evidence, " +
                    "rel.Date as Date, u.UserId as UserId, id(fp) as FeaturePreferenceNodeId;",
                    params: {}
                })
                .then(function(response) {
                    $scope.featuresForAuthorisation = '';
                    if (framework.isArray(response.data)){
                        $scope.featuresForAuthorisation = response.data;
                    } else if (response.data != '') {
                        $scope.featuresForAuthorisation = [];
                        $scope.featuresForAuthorisation.push(response.data);
                    }
                }, function(response) {
                    Notification.error(response);
                    console.log("ERROR: " + response);
                });
        }

        //get pathogenicities for authorisation
        function getAddNewPathogenicitiesForAuthorisation(){
            $http.post('/api/seraph',
                {
                    query:
                    "MATCH (v:Variant)-[:HAS_PATHOGENICITY]->(p:Pathogenicity)-[rel:ADDED_BY|:REMOVED_BY]->(u:User)" +
                    "WHERE NOT (p)-[:ADD_AUTHORISED_BY|:REMOVED_AUTHORISED_BY]->(:User) " +
                    "RETURN v,rel,u;",
                    params: {}
                })
                .then(function(response) {
                    $scope.featuresForAuthorisation = '';
                    if (framework.isArray(response.data)){
                        $scope.featuresForAuthorisation = response.data;
                    } else if (response.data != '') {
                        $scope.featuresForAuthorisation = [];
                        $scope.featuresForAuthorisation.push(response.data);
                    }
                }, function(response) {
                    Notification.error(response);
                    console.log("ERROR: " + response);
                });
        }

        $scope.acceptFeaturePreference = function(featurePreferenceNodeId){
            $http.post('/api/seraph',
                {
                    query:
                    "MATCH (u:User {UserId:\"ml\"}) " +
                    "MATCH (fp:FeaturePreference) WHERE id(fp) = " + featurePreferenceNodeId + " " +
                    "CREATE (fp)-[:ADD_AUTHORISED_BY {Date:" + new Date().getTime() + "}]->(u)",
                    params: {}
                })
                .then(function(response) {
                    getFeaturesForAuthorisation();
                    Notification('Operation successful');
                },
                function(response) {
                    Notification.error(response);
                    console.log("ERROR: " + response);
                });
        };

        $scope.rejectFeaturePreference = function(featurePreferenceNodeId){
            $http.post('/api/seraph',
                {
                    query:
                    "MATCH (f:Feature)-[rel1:HAS_FEATURE_PREFERENCE]->(fp:FeaturePreference)-[rel2:ADDED_BY]->(:User)" +
                    "WHERE id(fp) = " + featurePreferenceNodeId + " " +
                    "DELETE rel1, fp, rel2;",
                    params: {}
                })
                .then(function(response) {
                    getFeaturesForAuthorisation();
                    Notification('Operation successful');
                },
                function(response) {
                    Notification.error(response);
                    console.log("ERROR: " + response);
                });
        };

        //load widgets on page load
        getAddNewFeaturesForAuthorisation();
        getAddNewPathogenicitiesForAuthorisation();

    }]);