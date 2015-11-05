'use strict';

angular.module('variantdatabase.login', ['ngRoute', 'ui-notification'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/login', {
            templateUrl: 'login/login.html',
            controller: 'LoginCtrl'
        });
    }])

    .controller('LoginCtrl', ['$scope', 'Notification', '$http', function ($scope, Notification, $http) {

        //get features for authorisation
        function getFeaturesForAuthorisation(){
            $http.post('/api/seraph',
                {
                    query:
                    "MATCH (f:Feature)-[:HAS_FEATURE_PREFERENCE]->(fp:FeaturePreference)-[rel:ADDED_BY]->(u:User) " +
                    "WHERE NOT (fp)-[:AUTHORISED_BY]->(:User)" +
                    "OPTIONAL MATCH (f)<-[:HAS_PROTEIN_CODING_BIOTYPE]-(s:Symbol) " +
                    "RETURN s.SymbolId as SymbolId, f.FeatureId as FeatureId, fp.Evidence as Evidence, " +
                    "rel.Date as Date, u.UserId as UserId, id(fp) as FeaturePreferenceNodeId;",
                    params: {}
                })
                .then(function(response) {
                    $scope.featuresForAuthorisation = '';
                    if (response.data.isArray){
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
                    "CREATE (fp)-[:AUTHORISED_BY {Date:" + new Date().getTime() + "}]->(u)",
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
        getFeaturesForAuthorisation();

    }]);