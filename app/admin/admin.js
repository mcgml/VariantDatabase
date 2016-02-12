'use strict';

angular.module('variantdatabase.admin', ['ngRoute', 'ui-notification'])

    .controller('AdminCtrl', ['$rootScope', '$scope', 'Notification', '$http', function ($rootScope, $scope, Notification, $http) {

        //new pathogenicities for authorisation
        function getNewPathogenicitiesForAuthorisation() {
            $http.get('/api/variantdatabase/variant/pendingauth', {
            }).then(function(response) {
                $scope.pathogenicitiesForAuthorisation = response.data;
            }, function(response) {
                Notification.error(response);
                console.log("ERROR: " + response);
            })
        }

        function getNewTranscriptPreferencesForAuthorisation() {
            $http.get('/api/variantdatabase/feature/pendingauth', {
            }).then(function(response) {
                $scope.transcriptPreferencesForAuthorisation = response.data;
            }, function(response) {
                Notification.error(response);
                console.log("ERROR: " + response);
            })
        }

        $scope.authorise = function(eventNodeId, addOrRemove){
            $http.post('/api/variantdatabase/admin/authevent',
                {
                    eventNodeId : eventNodeId,
                    userNodeId : $rootScope.user.userNodeId,
                    addOrRemove : addOrRemove
                })
                .then(function(response) {
                    Notification('Operation successful');
                    getNewPathogenicitiesForAuthorisation();
                    getNewTranscriptPreferencesForAuthorisation();
                }, function(response) {
                    Notification.error(response);
                    console.log("ERROR: " + response);
                });
        };

        //load widgets on page load
        getNewPathogenicitiesForAuthorisation();
        getNewTranscriptPreferencesForAuthorisation();

    }]);