'use strict';

angular.module('variantdatabase.admin', ['ngRoute', 'ui-notification'])

    .controller('AdminCtrl', ['$rootScope', '$scope', 'Notification', '$http', function ($rootScope, $scope, Notification, $http) {

        //new pathogenicities for authorisation
        function getNewPathogenicitiesForAuthorisation() {
            $http.get('/api/variantdatabase/getnewpathogenicitiesforauthorisation', {

            }).then(function(response) {
                $scope.pathogenicitiesForAuthorisation = response.data;
            }, function(response) {
                Notification.error(response);
                console.log("ERROR: " + response);
            })
        }

        $scope.authoriseVariantPathogenicity = function(pathogenicityNodeId, addOrRemove){
            $http.post('/api/variantdatabase/authorisevariantpathogenicity',
                {
                    'PathogenicityNodeId' : pathogenicityNodeId,
                    'UserNodeId' : $rootScope.user.UserNodeId,
                    'AddorRemove' : addOrRemove
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