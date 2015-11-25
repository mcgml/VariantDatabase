'use strict';

// Declare app level module which depends on views, and components
angular.module('variantdatabase', [ 'ngRoute', 'variantdatabase.login', 'variantdatabase.report', 'variantdatabase.search', 'variantdatabase.account', 'variantdatabase.admin', 'variantdatabase.about'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.otherwise(
            {
                redirectTo: '/login'
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
            } else if (input <= 0.01) {
                return '#d62728';
            } else if (input > 0.01 && input <= 0.05) {
                return '#e99002';
            } else if (input > 0.05) {
                return '#43ac6a';
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
            checkInput: function(field, value){
                if (value === '' || value === undefined){
                    Notification.error('Check ' + field + ' input');
                    return false;
                }
                return true;
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
                return 'http://localhost:60151/load?file=' + remoteBamPath + '&locus=' + locus + '&genome=37';
            },
            isArray: function(it) {
                return Object.prototype.toString.call(it) === '[object Array]';
            },
            keywordSearchFromAnnotationObject: function(annotation){
                var keywords = '';

                if (annotation.hasOwnProperty('SymbolId')){
                    keywords += " \"";
                    keywords += annotation.SymbolId;
                    keywords += "\"";
                }

                if (annotation.hasOwnProperty('HGVSc')){
                    keywords += " \"";
                    keywords += annotation.HGVSc.substring(2);
                    keywords += "\"";
                }

                if (annotation.hasOwnProperty('HGVSp')){
                    if (annotation.HGVSp !== "p.="){
                        keywords += " \"";
                        keywords += annotation.HGVSp.substring(2);
                        keywords += "\"";
                    }
                }

                return keywords;
            }
        };

    })

    .controller('VariantOccurrenceCtrl', function ($scope, $uibModalInstance, items, $window, framework) {
        $scope.items = items;

        $scope.openIGVLink = function(remoteBamPath, variant){
            $window.open(framework.getIGVLink(remoteBamPath, framework.convertVariantToRange(variant)), '_blank');
        };
        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    })

    .controller('VariantAnnotationCtrl', function ($scope, $uibModalInstance, items, $window, framework) {
        $scope.items = items;

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

    });
