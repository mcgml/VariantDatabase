'use strict';

angular.module('variantdatabase.qc', ['ngResource', 'ngRoute', 'ui-notification', 'ui.bootstrap'])

    .controller('QcCtrl', ['$rootScope', '$scope', '$http', '$location', 'Notification', function($rootScope, $scope, $http, $location, Notification) {

        $scope.addQc = function(runInfoNodeId, passOrFail, evidence){

            $http.post('/api/variantdatabase/analyses/addqc',
                {
                    runInfoNodeId : runInfoNodeId,
                    userNodeId : $rootScope.user.userNodeId,
                    passOrFail : passOrFail,
                    evidence : evidence
                })
                .then(function(response) {
                    getPendingQc();
                    Notification('Operation successful');
                }, function(response) {
                    Notification.error(response);
                    console.log("ERROR: " + response);
                });
        };

        function getPendingQc(){

            $http.get('/api/variantdatabase/analyses/pendingqc', {})
                .then(function(response) {
                    $scope.analyses = response.data;
                }, function(response) {
                    Notification.error(response);
                    console.log("ERROR: " + response);
                });
        }

        getPendingQc();

    }]);