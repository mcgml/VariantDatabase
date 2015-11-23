'use strict';

//todo add new gene panels
//todo add fields and output for SHIRE import
//todo center align population frequencies
//todo check af calculations
//todo update preferred transcript to Ensembl definition
//todo add gene expression data
//todo add mutation taster
//todo splicing

angular.module('variantdatabase.report', ['ngRoute', 'ui.bootstrap', 'ui-notification', 'nvd3'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/report', {
            templateUrl: 'report/report.html',
            controller: 'ReportCtrl'
        });
    }])

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
            }
        };
    })

    .filter('phylop2colour', function() {
        return function (input) {
            if (input == '' || input == undefined){
                return '#DCDCDC';
            }
        };
    })

    .filter('phastcons2colour', function() {
        return function (input) {
            if (input == '' || input == undefined){
                return '#DCDCDC';
            }
        };
    })

    .controller('ReportCtrl', ['$scope', '$window', '$http', 'Notification', '$uibModal', function ($scope, $window, $http, Notification, $uibModal) {

        var cat20 = ["#008cba", "#aec7e8", "#e99002", "#ffbb78", "#43ac6a", "#98df8a", "#d62728", "#ff9896"];
        $scope.items = ['item1', 'item2', 'item3'];
        $scope.selectedVariantFilter = -1;

        $scope.getGreenToRed = function(percent){
            r = percent<50 ? 255 : Math.floor(255-(percent*2-100)*255/100);
            g = percent>50 ? 255 : Math.floor((percent*2)*255/100);
            return 'rgb('+r+','+g+',0)';
        };

        $scope.donutChartOptions = {
            chart: {
                type: 'pieChart',
                height: 250,
                noData: "",
                donut: true,
                color : function (d, i) { var key = i === undefined ? d : i; return d.color || cat20[key % cat20.length]; },
                x: function(d){return d.key;},
                y: function(d){return d.y;},
                showLabels: false,
                pie: {
                    dispatch: {
                        elementClick: function(e) {
                            $scope.selectedVariantFilter = e.index;
                            $scope.$apply();
                        }
                    }
                },
                transitionDuration: 500
            }
        };

        function checkInput(field, value){
            if (value === '' || value === undefined){
                Notification.error('Check ' + field + ' input');
                return false;
            }
            return true;
        }

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

        $scope.open1kgLink = function(variantId){
            $window.open('http://browser.1000genomes.org/Homo_sapiens/Location/View?r=' + convertVariantToRangeFunction(variantId), '_blank');
        };

        $scope.openExACLink = function(variantId){

            var split1 = variantId.split(":");
            var split2 = split1[1].split(">");
            var startPosition = split2[0].replace(/\D/g, '');
            var refAllele = split2[0].replace(/\d/g, '');
            var altAllele = split2[1].replace(/\d/g, '');

            $window.open('http://exac.broadinstitute.org/variant/' + split1[0] + '-' + startPosition + '-' + refAllele + '-' + altAllele, '_blank');
        };

        $scope.openDbSnpLink = function(dbSNPId){
            $window.open('http://www.ncbi.nlm.nih.gov/projects/SNP/snp_ref.cgi?rs=' + dbSNPId, '_blank');
        };

        $scope.getFilteredVariants = function () {

            //reset piechart filter
            $scope.selectedVariantFilter = -1;

            //check input
            if (!checkInput("Sample", $scope.selectedAnalysis)) return;
            if (!checkInput("Panel", $scope.selectedVirtualPanel)) return;
            if (!checkInput("Workflow", $scope.selectedWorkflow)) return;

            $http.post('/api/variantdatabase' + $scope.selectedWorkflow.Path,
                {
                    'RunInfoNodeId' : $scope.selectedAnalysis.RunInfoNodeId,
                    'PanelNodeId' : $scope.selectedVirtualPanel.PanelNodeId
                })
                .then(function(response) {
                    $scope.filteredVariants = response.data;
                    Notification('Operation successful');
                }, function(response) {
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
                }, function(response) {
                    Notification.error(response);
                    console.log("ERROR: " + response);
                });

            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: 'templates/VariantAnnotationModal.html',
                controller: 'VariantAnnotationCtrl',
                windowClass: 'app-modal-window',
                resolve: {
                    items: function () {
                        return variant;
                    }
                }
            });
        };

        $scope.openVariantOccurrenceModal = function (variant) {
            var seen = {};

            $http.post('/api/variantdatabase/variantobservations',
                {
                    'NodeId' : variant.VariantNodeId
                })
                .then(function(response) {
                    seen.Occurrences = response.data;
                }, function(response) {
                    Notification.error(response);
                    console.log("ERROR: " + response);
                });

            seen.VariantId = variant.VariantId;

            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: 'templates/VariantOccurrenceModal.html',
                controller: 'VariantOccurrenceCtrl',
                windowClass: 'app-modal-window',
                resolve: {
                    items: function () {
                        return seen;
                    }
                }
            });
        };

        $scope.exportVariants = function(){
            var saved = [];

            //skip missing dataset
            if ($scope.filteredVariants === null) return;

            for (var key in $scope.filteredVariants.Variants) {
                if ($scope.filteredVariants.Variants.hasOwnProperty(key)) {
                    if ($scope.filteredVariants.Variants[key].Selected){

                        var tempObj = $scope.filteredVariants.Variants[key];
                        saved.push(tempObj);

                    }
                }
            }

            //write output file
            var blob = new Blob([JSON.stringify(saved)]);
            saveAs(blob, "export.json");

        };

        $scope.launchIGV = function (remoteBamFilePath, variantId){
            $window.open('http://localhost:60151/load?file=' + remoteBamFilePath + '&locus=' + convertVariantToRangeFunction(variantId) + '&genome=37', '_blank');
        };

        $http.get('/api/variantdatabase/analyses', {

        }).then(function(response) {
            $scope.analyses = response.data;
        }, function(response) {
            Notification.error(response);
            console.log("ERROR: " + response);
        });

        $http.get('/api/variantdatabase/panels', {

        }).then(function(response) {
            $scope.virtualPanels = response.data;
        }, function(response) {
            Notification.error(response);
            console.log("ERROR: " + response);
        });

        $http.get('/api/variantdatabase/workflows', {

        }).then(function(response) {
            $scope.workflows = response.data;
        }, function(response) {
            Notification.error(response);
            console.log("ERROR: " + response);
        });

    }]);