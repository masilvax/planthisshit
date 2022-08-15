app.controller('mojeKontoCtrl', function ($scope, $rootScope, $http, $window, $mdDialog) {

    $scope.edycja = false;
    $scope.zmHasla = false;
    $scope.loaderDanych = false;

    $scope.lista = [];

    $scope.pobierzListe = function () {
        $scope.loaderDanych = true;
        let url = 'core/http_moje_konto.php?akcja=mojeKonto';
        $http.get(url).then(function (response) {
            //First function handles success
            if (response.data === "session timed out") {
                //$window.location = "#!login";
                $rootScope.kto = false;
            } else {
                if(response.data.odp !=='OK'){
                    alert(response.data);
                }
                $scope.lista = response.data;
                $scope.loaderDanych = false;
            }
        }, function (response) {
            //Second function handles error
            alert("Error loading user data in http...php");
        });
        //let elmnt = document.getElementById('gura');
        //elmnt.scrollIntoView({block: 'start'});
    };
    $scope.pobierzListe();
    
    $scope.zapiszUzytkownika = function (ev) {
        
        $scope.loaderDanych = true;
        
        var confirm = $mdDialog.confirm()
            .title($rootScope.lang==='pl' ? "Zmiana danych użytkownika" : "Change user data")
            .textContent($rootScope.lang==='pl' ? 'Potwierdź zmianę danych' : 'Confirm user data changes?')
            .ariaLabel('...')
            .theme($rootScope.temat)
            .targetEvent(ev)
            .ok($rootScope.lang==='pl' ? 'Tak':'Yes')
            .cancel($rootScope.lang==='pl' ? 'Nie':'No');
        
        $mdDialog.show(confirm).then(function(result){
        
            var formData = {
                'akcja' : 'zapiszUzytkownika',
                'id' : $scope.lista.uzytkownik.id,
                'login' : $scope.lista.uzytkownik.login,
                'email' : $scope.lista.uzytkownik.email,
                'typ' : $scope.lista.uzytkownik.typ,
                'lang' : $scope.lista.uzytkownik.lang,
                'temat' : $scope.lista.uzytkownik.temat
            };
            var response = $http({
                method: "POST",
                url: 'core/http_moje_konto.php',
                params: formData,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).then(function mySucces(response) {
                if(response.data.odp!=='OK') {
                    alert(response.data);
                    $scope.loaderDanych = false;
                }else{
                    let staryLang = $rootScope.lang;
                    $rootScope.lang = response.data.uzytkownik.lang;
                    $rootScope.temat = response.data.uzytkownik.temat;
                    moment.locale($rootScope.lang);
                    if(staryLang!==$rootScope.lang){
                        $window.location = "#!"+$rootScope.lang+"/myAccount";
                    }
                    $rootScope.kto = response.data.uzytkownik;
                    $scope.pobierzListe();
                    $scope.loaderDanych = false;
                    $scope.edycja = false;
                    $scope.zmHasla = false;
                }

            }, function myError(response) {
                 alert("Error saving user data: "+response.StatusText);
            });
            
        }, function(){ //rezygnacja
            $scope.loaderDanych = false;
            $scope.edycja = false;
        });
    };

    $scope.toggleEdycja = function () {
        $scope.edycja = !$scope.edycja;
    };
    
    
    $scope.zmienHasloDialog = function (ev) {

        $scope.zmiana_hasla_stare = '';
        $scope.zmiana_hasla_nowe = '';
        $scope.zmiana_hasla_nowe_potw = '';
        
        $mdDialog.show({
            controller: DialogController,
            templateUrl: 'templates/dialogZmianaHasla.htm',
            targetEvent: ev,
            clickOutsideToClose:false,
            scope: $scope,
            preserveScope: true,//wazne jak uzywamy scope'a!
            fullscreen: false//!$scope.duze // Only for -xs, -sm breakpoints.
        })
        .then(function() {//OK, czyli hide()

        }, function() {//CANCEL
            $scope.loaderDialoga = false;
        });
    };
    
    function DialogController($scope, $mdDialog) {
            
        $scope.zmienHaslo = function() {
            
            $scope.loaderDanychDialog = true;
            
            var fd = new FormData();
                fd.append('akcja', 'zmienHaslo');
                fd.append('zmiana_hasla_stare',$scope.zmiana_hasla_stare);
                fd.append('zmiana_hasla_nowe',$scope.zmiana_hasla_nowe);
                
                if($scope.widoczneHasloZmianaNowe)
                    fd.append('zmiana_hasla_nowe_potw',$scope.zmiana_hasla_nowe);
                else
                    fd.append('zmiana_hasla_nowe_potw',$scope.zmiana_hasla_nowe_potw);
                
                fd.append('lang',$rootScope.lang);

            var response = $http({
                method: "POST",
                url: 'core/http_moje_konto.php',
                data: fd,
                headers: {'Content-Type': undefined}
            }).then(function mySucces(response) {
                if(response.data.odp!=='OK') {
                    alert(response.data);
                }else{
                    $scope.pobierzListe($scope.idSesji);
                    $mdDialog.hide();
                }
                $scope.loaderDanychDialog = false;
            }, function myError(response) {
                alert("Error: "+response.StatusText);
                $scope.loaderDanychDialog = false;
            });
                
        };
        
        $scope.cancel = function() {
            $mdDialog.cancel();
            $scope.pobierzListe();
        };
        
        $scope.hide = function() {
            $mdDialog.hide();
            $scope.pobierzListe();
        };
        
        $scope.widoczneHasloZmianaStare = false;
        $scope.toggleWidoczneHasloZmianaStare = function () {
            $scope.widoczneHasloZmianaStare = !$scope.widoczneHasloZmianaStare;
        }
        
        $scope.widoczneHasloZmianaNowe = false;
        $scope.toggleWidoczneHasloZmianaNowe = function () {
            $scope.widoczneHasloZmianaNowe = !$scope.widoczneHasloZmianaNowe;
        }

    };

});
