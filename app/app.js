'use strict';

// Declare app level module which depends on views, and components
angular.module('variantdatabase', [ 'ngResource', 'ngRoute', 'variantdatabase.login', 'variantdatabase.report', 'variantdatabase.search', 'variantdatabase.account', 'variantdatabase.admin', 'variantdatabase.about', 'variantdatabase.qc', 'variantdatabase.test'])

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

    .config(function($routeProvider, $locationProvider, $httpProvider) {
        //================================================
        // Check if the user is connected
        //================================================
        var checkLoggedin = function($q, $timeout, $http, $location, $rootScope){
            // Initialize a new promise
            var deferred = $q.defer();

            // Make an AJAX call to check if the user is logged in
            $http.get('/loggedin').success(function(user){

                // Authenticated
                if (user !== '0'){
                    $rootScope.user = user;
                    deferred.resolve();
                } else {
                    // Not Authenticated
                    $rootScope.message = 'You need to log in.';
                    deferred.reject();
                    $location.url('/login');
                }

            });

            return deferred.promise;
        };
        //================================================

        //================================================
        // Add an interceptor for AJAX errors
        //================================================
        $httpProvider.interceptors.push(function($q, $location) {
            return {
                response: function(response) {
                    // do something on success
                    return response;
                },
                responseError: function(response) {
                    if (response.status === 401)
                        $location.url('/login');
                    return $q.reject(response);
                }
            };
        });
        //================================================

        //================================================
        // Define all the routes
        //================================================
        $routeProvider
            .when('/about', {
                templateUrl: 'about/about.html',
                controller: 'AboutCtrl',
                resolve: {
                    loggedin: checkLoggedin
                }
            })
            .when('/account', {
                templateUrl: 'account/account.html',
                controller: 'AccountCtrl',
                resolve: {
                    loggedin: checkLoggedin
                }
            })
            .when('/admin', {
                templateUrl: 'admin/admin.html',
                controller: 'AdminCtrl',
                resolve: {
                    loggedin: checkLoggedin
                }
            })
            .when('/login', {
                templateUrl: 'login/login.html',
                controller: 'LoginCtrl'
            })
            .when('/report', {
                templateUrl: 'report/report.html',
                controller: 'ReportCtrl',
                resolve: {
                    loggedin: checkLoggedin
                }
            })
            .when('/search', {
                templateUrl: 'search/search.html',
                controller: 'SearchCtrl',
                resolve: {
                    loggedin: checkLoggedin
                }
            })
            .when('/qc', {
                templateUrl: 'qc/qc.html',
                controller: 'QcCtrl',
                resolve: {
                    loggedin: checkLoggedin
                }
            })
            .when('/test', {
                templateUrl: 'test/test.html',
                controller: 'TestCtrl',
                resolve: {
                    loggedin: checkLoggedin
                }
            })
            .otherwise({
                templateUrl: 'login/login.html',
                controller: 'LoginCtrl'
            });
        //================================================

    }) // end of config()
    .run(function($rootScope, $http){

        // Logout function is available in any pages
        $rootScope.logout = function(){
            $rootScope.message = 'Logged out.';
            $http.post('/logout');
        };

    })

    .filter('offset', function() {
        return function(input, start) {
            if (input === undefined) return;
            start = parseInt(start, 10);
            return input.slice(start);
        };
    })

    .filter('afpct2colour', function() {
        return function (input) {
            if (input == '' || input == undefined){
                return '#DCDCDC';
            } else if (input <= 1){
                return '#d62728';
            } else if (input > 1 && input <= 10 ){
                return '#e99002';
            } else if (input > 10) {
                return '#43ac6a';
            }
        };
    })

    .filter('gerp2colour', function() {
        return function (input) {
            if (input == '' || input == undefined){
                return '#DCDCDC';
            } else if (input >= 2){
                return '#d62728';
            } else if (input >= 0 && input < 2){
                return '#e99002';
            } else if (input < 0) {
                return '#43ac6a';
            }
        };
    })

    .filter('phylop2colour', function() {
        return function (input) {
            if (input == '' || input == undefined) {
                return '#DCDCDC';
            } else if (input >= 0) {
                return '#d62728';
            } else if (input < 0 && input >= -4) {
                return '#e99002';
            } else if (input < -4) {
                return '#43ac6a';
            }
        };
    })

    .filter('phastcons2colour', function() {
        return function (input) {

            if (input == '' || input == undefined) {
                return '#DCDCDC';
            }

            //reverse prob score
            var probConserved = 1 - input;
            if (probConserved <= 0.01) {
                return '#d62728';
            } else if (probConserved > 0.01 && probConserved <= 0.05) {
                return '#e99002';
            } else if (probConserved > 0.05) {
                return '#43ac6a';
            }

        };
    })

    .filter('yesNoFilter', function() {
        return function (input) {
            if (input){
                return "Yes";
            } else {
                return "No";
            }
        };
    })

    .filter('passOrFailFilter', function() {
        return function (input) {
            if (input){
                return "PASS";
            } else {
                return "FAIL";
            }
        };
    })

    .filter('naFilter', function() {
        return function (input) {
            if (input == undefined){
                return "N/A";
            }
        };
    })

    .factory('framework', function() {
        var cat20 = ["#008cba", "#aec7e8", "#e99002", "#ffbb78", "#43ac6a", "#98df8a", "#d62728", "#ff9896"];

        return {
            convertVariantToRange: function(variantId) {

                var split1 = variantId.split(":");
                var split2 = split1[1].split(">");

                var refLength = split2[0].match(/\D/g).length;
                var altLength = split2[1].match(/\D/g).length;

                var startPosition = split2[0].replace(/\D/g, '');
                var endPosition = (startPosition - refLength) + altLength;

                return split1[0] + ":" + startPosition + "-" + endPosition;

            },
            convertVariantToExAC: function(variantId) {

                var split1 = variantId.split(":");
                var split2 = split1[1].split(">");
                var startPosition = split2[0].replace(/\D/g, '');
                var refAllele = split2[0].replace(/\d/g, '');
                var altAllele = split2[1].replace(/\d/g, '');

                return split1[0] + '-' + startPosition + '-' + refAllele + '-' + altAllele;

            },
            getCat20: function() {
                return cat20;
            },
            getScaledCat20: function(num) {
                return cat20[num % cat20.length];
            },
            getGreenToRed: function(percent){
                var r = percent<50 ? 255 : Math.floor(255-(percent*2-100)*255/100);
                var g = percent>50 ? 255 : Math.floor((percent*2)*255/100);
                return 'rgb('+r+','+g+',0)';
            },
            getEnsemblRangeLink: function(){
                return 'http://grch37.ensembl.org/Homo_sapiens/Location/View?r=';
            },
            getUCSCRangeLink: function(){
                return 'http://genome.ucsc.edu/cgi-bin/hgTracks?org=human&db=hg19&position=chr';
            },
            get1kgRangeLink: function(){
                return 'http://browser.1000genomes.org/Homo_sapiens/Location/View?r=';
            },
            getExACVariantLink: function(){
                return 'http://exac.broadinstitute.org/variant/';
            },
            getGoogleScholarLink: function(){
                return 'https://scholar.google.co.uk/scholar?q=';
            },
            getClinVarLink: function(){
                return 'http://www.ncbi.nlm.nih.gov/clinvar/?term=';
            },
            getHPALink: function(){
                return 'http://www.proteinatlas.org/search/';
            },
            getEAtlasLink: function(){
                return 'http://sep2015.archive.ensembl.org/Homo_sapiens/Gene/ExpressionAtlas?g=';
            },
            getPfamLink: function(){
                return 'http://pfam.xfam.org/family/';
            },
            getPantherLink: function(){
                return 'http://www.pantherdb.org/panther/family.do?clsAccession=';
            },
            getDbSNPIdVariantLink: function(){
                return 'http://www.ncbi.nlm.nih.gov/projects/SNP/snp_ref.cgi?rs=';
            },
            getPrositeLink: function(){
                return 'http://prosite.expasy.org/';
            },
            getSuperfamilyLink: function(){
                return 'http://supfam.org/SUPERFAMILY/cgi-bin/scop.cgi?sunid=';
            },
            getIGVLink: function(remoteBamPath, locus){
                return 'http://localhost:60151/load?file=' + remoteBamPath + '&locus=' + locus + '&genome=GRCh37.75&merge=false';
            },
            isArray: function(it) {
                return Object.prototype.toString.call(it) === '[object Array]';
            },
            keywordSearchFromAnnotationObject: function(annotation){
                var keywords = '';

                if (annotation.hasOwnProperty('symbolId')){
                    keywords += " \"";
                    keywords += annotation.symbolId;
                    keywords += "\"";
                }

                if (annotation.hasOwnProperty('hgvsc')){
                    keywords += " \"";
                    keywords += annotation.hgvsc.substring(2);
                    keywords += "\"";
                }

                if (annotation.hasOwnProperty('hgvsp')){
                    if (annotation.hgvsp !== "p.="){
                        keywords += " \"";
                        keywords += annotation.hgvsp.substring(2);
                        keywords += "\"";
                    }
                }

                return keywords;
            }
        };

    })

    .controller('NewPanelCtrl', ['$rootScope', '$scope', '$uibModalInstance', 'items', 'framework', '$http', 'Notification', function ($rootScope, $scope, $uibModalInstance, items, framework, $http, Notification) {
        $scope.items = items;
        $scope.savedGenes = [];

        $scope.checkHGNC = function(){
            $http({
                method: 'GET',
                url: 'http://rest.genenames.org/fetch/symbol/' + $scope.search
            }).then(function successCallback(response) {
                $scope.searchedGenes = response.data.response.docs;
                Notification('Operation successful');
            }, function errorCallback(response) {
                Notification.error(response);
                console.log("ERROR: " + response);
            });
        };

        $scope.addGene = function(gene){
            if (gene.status !== "Approved"){
                Notification.error("Cannot add unapproved gene");
                return;
            }

            //check gene is not already in list
            for (var key in $scope.savedGenes) {
                if ($scope.savedGenes.hasOwnProperty(key)) {
                    if ($scope.savedGenes[key] === gene){
                        Notification.error("Gene already added to list");
                        return;
                    }
                }
            }

            $scope.savedGenes.push(gene);
        };

        $scope.removeGene = function(i){
            $scope.savedGenes.splice(i, 1);
        };

        $scope.saveGenes = function(){

            var upload = [];

            for (var key in $scope.savedGenes) {
                if ($scope.savedGenes.hasOwnProperty(key)) {
                    upload.push($scope.savedGenes[key].symbol);
                }
            }

            if (upload.length == 0) return;

            $http.post('/api/variantdatabase/panels/add',
                {
                    userNodeId : $rootScope.user.userNodeId,
                    virtualPanelName : $scope.items,
                    virtualPanelList : upload
                })
                .then(function(response) {
                    Notification('Operation successful');
                }, function(response) {
                    Notification.error(response);
                    console.log("ERROR: " + response);
                });
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };

    }])

    .controller('VariantSelectionCtrl', ['$scope', '$uibModalInstance', 'items', 'Notification', '$http', function ($scope, $uibModalInstance, items, Notification, $http) {
        $scope.analyses = items;
        $scope.savedExcludedDatasets = [];
        $scope.savedVirtualPanels = [];

        $http.get('/api/variantdatabase/panels/list', {}
        ).then(function(response) {
            $scope.virtualPanels = response.data;
        }, function(response) {
            Notification.error(response);
            console.log("ERROR: " + response);
        });

        $scope.addExcludedDataset = function(){

            if ($scope.excludedDataset === undefined || $scope.excludedDataset === '' || !$scope.excludedDataset.hasOwnProperty("runInfoNodeId")){
                Notification.error("Select sample");
                return;
            }

            var found = false;
            for(var i = 0; i < $scope.savedExcludedDatasets.length; i++) {
                if ($scope.savedExcludedDatasets[i].runInfoNodeId == $scope.excludedDataset.runInfoNodeId) {
                    found = true;
                    break;
                }
            }

            if (found){
                Notification.error("Already present in the list");
                return;
            }

            $scope.savedExcludedDatasets.push($scope.excludedDataset);
        };

        $scope.addVirtualPanel = function(){

            if ($scope.selectedVirtualPanel === undefined || $scope.selectedVirtualPanel === '' || !$scope.selectedVirtualPanel.hasOwnProperty("panelNodeId")){
                Notification.error("Select panel");
                return;
            }

            var found = false;
            for(var i = 0; i < $scope.savedVirtualPanels.length; i++) {
                if ($scope.savedVirtualPanels[i].panelNodeId == $scope.selectedVirtualPanel.panelNodeId) {
                    found = true;
                    break;
                }
            }

            if (found){
                Notification.error("Already present in the list");
                return;
            }

            $scope.savedVirtualPanels.push($scope.selectedVirtualPanel);
        };

        $scope.removeExcludedDataset = function(i){
            $scope.savedExcludedDatasets.splice(i, 1);
        };

        $scope.removeVirtualPanel = function(i){
            $scope.savedVirtualPanels.splice(i, 1);
        };

        $scope.returnSelections = function(){

            var i = 0;
            var retObj = {};
            retObj.excludeRunInfoNodes = [];
            retObj.includePanelNodes = [];

            //bank exclusion run node Ids
            for (i = 0; i < $scope.savedExcludedDatasets.length; i++) {
                retObj.excludeRunInfoNodes.push($scope.savedExcludedDatasets[i].runInfoNodeId);
            }

            //bank gene panel run Ids
            for (i = 0; i < $scope.savedVirtualPanels.length; i++) {
                retObj.includePanelNodes.push($scope.savedVirtualPanels[i].panelNodeId);
            }

            $uibModalInstance.close(retObj);
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };

    }])

    .controller('VariantOccurrenceCtrl', ['$scope', '$uibModalInstance', 'items', '$window', 'framework', function ($scope, $uibModalInstance, items, $window, framework) {
        $scope.items = items;

        $scope.openIGVLink = function(remoteBamPath, variant){
            $window.open(framework.getIGVLink(remoteBamPath, framework.convertVariantToRange(variant)), '_blank');
        };
        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };

    }])

    .controller('VariantAnnotationCtrl', ['$scope', '$uibModalInstance', 'items', '$window', 'framework', '$http', function ($scope, $uibModalInstance, items, $window, framework, $http) {
        $scope.items = items;
        $scope.idSelected = null;

        $scope.setSelected = function (idSelected) {
            $scope.idSelected = idSelected;
        };
        $scope.openGoogleScholarLink = function(annotation){
            var search = framework.keywordSearchFromAnnotationObject(annotation);
            if(search === undefined || search === ''){
                return;
            }
            $window.open(framework.getGoogleScholarLink() + search, '_blank');
        };
        $scope.openClinVarLink = function(annotation){
            var search = framework.keywordSearchFromAnnotationObject(annotation);
            if(search === undefined || search === ''){
                return;
            }
            $window.open(framework.getClinVarLink() + search, '_blank');
        };
        $scope.openHPALink = function(accession){
            $window.open(framework.getHPALink() + accession, '_blank');
        };
        $scope.openEAtlasLink = function(accession){
            $window.open(framework.getEAtlasLink() + accession, '_blank');
        };
        $scope.openPfamLink = function(accessions){
            var arrayLength = accessions.length;
            for (var i = 0; i < arrayLength; i++) {
                $window.open(framework.getPfamLink() + accessions[i], '_blank');
            }
        };
        $scope.openPantherLink = function(accessions){
            var arrayLength = accessions.length;
            for (var i = 0; i < arrayLength; i++) {
                $window.open(framework.getPantherLink() + accessions[i], '_blank');
            }
        };
        $scope.openPrositeLink = function(accessions){
            var arrayLength = accessions.length;
            for (var i = 0; i < arrayLength; i++) {
                $window.open(framework.getPrositeLink() + accessions[i], '_blank');
            }
        };
        $scope.openSuperfamilyLink = function(accessions){
            var arrayLength = accessions.length;
            for (var i = 0; i < arrayLength; i++) {
                $window.open(framework.getSuperfamilyLink() + accessions[i].replace('SSF', ''), '_blank');
            }
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };

    }]);
