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

        $scope.authoriseVariantPathogenicity = function(pathogenicityNodeId, addOrRemove){
            $http.post('/api/variantdatabase/admin/authevent',
                {
                    eventNodeId : pathogenicityNodeId,
                    userNodeId : $rootScope.user.userNodeId,
                    addOrRemove : addOrRemove
                })
                .then(function(response) {
                    Notification('Operation successful');
                    getNewPathogenicitiesForAuthorisation();
                }, function(response) {
                    Notification.error(response);
                    console.log("ERROR: " + response);
                });
        };

        //load widgets on page load
        getNewPathogenicitiesForAuthorisation();

    }]);