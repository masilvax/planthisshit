app.controller('treningCtrl', function ($scope, $rootScope, $http, $window, $mdDialog, $routeParams) {
    
    $scope.edycja = false;
    $scope.edycjaNazwyIno = false;
    
    $scope.wyswietlanyMiesiac = moment();//cala data jest przekazywana do php i tam sobie oblicza pierwszy i ostatni dzien danego miesiaca
    
    $scope.idTreningu = $routeParams.idTreningu;
    
    $scope.lista = [];
    $scope.loaderDanych = false;
    
    $scope.pobierzListe = function (idTreningu,data) {
        $scope.loaderDanych = true;
        //idTreningu i data zeby ladowal do widoku tylko czesc sesji a nie kilkaset
        $http.get('core/http_treningi.php?akcja=wyswietlTrening&id='+idTreningu+'&data='+data).then(function (response) {
            //First function handles success
            if (response.data === "session timed out") {
                //$window.location = "#!login";
                $rootScope.kto = false;
            } else {
                if(response.data.odp !=='OK'){
                    alert(response.data);
                }
                //alert(response.data);
                $scope.lista = response.data;
                $scope.loaderDanych = false;
                //console.log($scope.wyswietlanyMiesiac.format('YYYY-MM-DD')+"---"+data);
                //console.dir($scope.lista);
                //console.dir(response.data);
            }
        }, function (response) {
            //Second function handles error
            alert("error loading training in request");
        });
    };
    $scope.pobierzListe($scope.idTreningu,$scope.wyswietlanyMiesiac.format('YYYY-MM-DD'));
    
    $scope.zapiszTrening = function (ev) {
        
        $scope.loaderDanych = true;
        
        var confirm = $mdDialog.confirm()
            .title($rootScope.lang==='pl' ? 'Podstawowe dane treningu' : 'Training data')
            .textContent($rootScope.lang==='pl' ? 'Zapisać zmiany?' : 'Save changes?')
            .ariaLabel('...')
            .theme($rootScope.temat)
            .targetEvent(ev)
            .ok($rootScope.lang==='pl' ? 'Tak' : 'Yes')
            .cancel($rootScope.lang==='pl' ? 'Nie': 'No');
        
        $mdDialog.show(confirm).then(function(result){
        
            var fd = new FormData();
            fd.append('akcja', 'zapiszTrening');
            fd.append('id', $scope.lista.trening.id);
            fd.append('nazwa', $scope.lista.trening.nazwa);
            //fd.append('opis_1', d.getFullYear()+'-'+(d.getMonth()+1) +'-'+d.getDate());
            fd.append('edycja', $scope.lista.trening.edycja);
            fd.append('publiczny', $scope.lista.trening.publiczny);
            fd.append('aktywny', $scope.lista.trening.aktywny);
            //fd.append('id_trenera', $scope.lista.trening.kolejnosc);//to jest edycja wiec nie musi tu tego byc
            //fd.append('id_cwiklacza', $scope.lista.trening.widocznosc);
            
            fd.append('lang',$rootScope.lang);

            var response = $http({
                method: "POST",
                url: 'core/http_treningi.php',
                data: fd,
                headers: {'Content-Type': undefined}
            }).then(function mySucces(response) {
                if(response.data.odp!=='OK') {
                    alert(response.data);
                    $scope.loaderDanych = false;
                }else{
                    $scope.edycjaNazwyIno = false;
                    $scope.loaderDanych = false;
                    $window.location = "#!/"+$rootScope.lang+"/training/"+response.data.idTreningu;
                    //$scope.pobierzListe($scope.idTreningu,$scope.wyswietlanyMiesiac.format('YYYY-MM-DD'));
                }
            }, function myError(response) {
                 alert("Error: "+response.StatusText);
                 $scope.loaderDanych = false;
            });
        }, function(){ //rezygnacja
            //$scope.loaderDanych = false;
            $scope.edycjaNazwyIno = false;
            $scope.pobierzListe($scope.idTreningu,$scope.wyswietlanyMiesiac.format('YYYY-MM-DD'));
        });
    };
    
    $scope.wybraneDaty = [];
    $scope.wyborDnia = function (ev,day) {
        //console.log(day.date.year()+'-'+parseInt(day.date.month()+1)+'-'+day.date.date());
        if(!$scope.edycja){ 

            $scope.wybraneDaty.length = 0;
            if(day.id === '' || day.id==='undefined' || typeof day.id === 'undefined'){
                //console.log($rootScope.lang+"/newSession/"+$scope.idTreningu+"/"+day.date.year()+'-'+parseInt(day.date.month()+1)+'-'+day.date.date());
                
                var confirm = $mdDialog.prompt()
                .title($rootScope.lang==='pl' ? 'NOWA SESJA TRENINGOWA' : 'NEW TRAINING SESSION')
                .textContent(day.date.year()+'-'+parseInt(day.date.month()+1)+'-'+day.date.date())
                .placeholder($rootScope.lang==='pl' ? 'nazwa sesji' : 'session name')
                .ariaLabel($rootScope.lang==='pl' ? 'nazwa sesji' : 'session name')
                .initialValue('')
                .targetEvent(ev)
                .required(true)
                .theme($rootScope.temat)
                .ok('OK')
                .cancel($rootScope.lang==='pl' ? 'Anuluj' : 'Cancel');

                $mdDialog.show(confirm).then(function (result) {
                    
                    var fd = new FormData();
                    fd.append('akcja', 'dodajNowaSesje');
                    fd.append('id_treningu', $scope.lista.trening.id);
                    fd.append('nazwa', result);
                    fd.append('data', day.date.year()+'-'+parseInt(day.date.month()+1)+'-'+day.date.date());
                    
                    fd.append('lang',$rootScope.lang);

                    var response = $http({
                        method: "POST",
                        url: 'core/http_sesja.php',
                        data: fd,
                        headers: {'Content-Type': undefined}
                    }).then(function mySucces(response) {
                        if(response.data.odp!=='OK') {
                            alert(response.data);
                            $scope.loaderDanych = false;
                        }else{
                            $scope.edycja = false;
                            $scope.loaderDanych = false;
                            $window.location = "#!/"+$rootScope.lang+"/session/"+response.data.idSesji;
                        }
                    }, function myError(response) {
                        alert("Error: "+response.StatusText);
                        $scope.loaderDanych = false;
                    });
                    
                    //console.log(result);
                }, function () {
                    //console.log('skancelowaues');
                });
                    
                
            }else
                $scope.przejdzDo($rootScope.lang+"/session/"+day.id);
        }
    };
    
    $scope.idki = [];
    $scope.sprawdzWybraneDaty = function (ev) {
        if($scope.wybraneDaty.length < 1){
            
            $mdDialog.show(
            $mdDialog.alert()
                //.parent(angular.element(document.querySelector('#popupContainer')))
                .clickOutsideToClose(true)
                .title($rootScope.lang==='pl' ? 'Wybierz datę.' : 'Select a date.')
                .textContent($rootScope.lang==='pl' ? '(dozwolony wybór kilku dat).' : '(mutliselect allowed).')
                .ariaLabel('Alert Dialog')
                .theme($rootScope.temat)
                .ok('OK')
                .targetEvent(ev)
            );
            return false;
        }else{
            $scope.idki.length = 0;
            $scope.wybraneDaty.sort(function(a,b){
                return b - a;
            });
            //najpierw wybraneDaty,bo sa juz posortowane i potem idki zeby tez byly posrotowane po dacie i tylko w przesuwaniu na dzien wstecz trzeba odwrocic w phpie kolejnosc zeby nie sral ze duplikaty, bo nawet jak sie to robi jedna zapytak to i tak wywala ze duplikat (jak przesunie na dzien, ktory juz jest, bo jeszce tego dnia nie przesunal na inna date)
            angular.forEach($scope.wybraneDaty, function (vs,ks){
                angular.forEach($scope.lista.trening.sesje, function (v,k){
                    v.date = moment(v.date);
                    if(v.date.date()===vs.date() && v.date.month()===vs.month() && v.date.year()===vs.year()){
                        //console.log(v.id+": "+v.date.year()+"-"+(v.date.month()+1)+"-"+v.date.date()+"---"+vs);//tu bedzie ajax
                        $scope.idki.push(v.id);//i te idki jsonstringify i do phpa
                    }
                });
            });
            
            return true;
        }
    };
    
    $scope.kopiujNaNastepnyTydzien = function (ev) {

        if($scope.sprawdzWybraneDaty(ev)){

            //console.dir($scope.wybraneDaty);
            
            var start = moment($scope.wybraneDaty[0]);
            var end = moment($scope.wybraneDaty[$scope.wybraneDaty.length-1]);
            var duration = moment.duration(start.diff(end));
            var days = duration.asDays();
            //console.log(days);
            //let idki = [];//array id-ków sesji
            
            if(days<7){

                
                $scope.loaderDanych = true;
                            
                var confirm = $mdDialog.confirm()
                    .title($rootScope.lang==='pl' ? 'Kopiowanie sesji treningowych' : 'Copying training sessions')
                    .textContent($rootScope.lang==='pl' ? 'Skopiować wybrane sesje treningowe na następny tydzień?' : 'Copy selected training sessions for next week?')
                    .ariaLabel('...')
                    .theme($rootScope.temat)
                    .targetEvent(ev)
                    .ok($rootScope.lang==='pl' ? 'Tak' : 'Yes')
                    .cancel($rootScope.lang==='pl' ? 'Nie' : 'No');
                            
                $mdDialog.show(confirm).then(function(result){
                            
                    var fd = new FormData();
                    fd.append('akcja', 'kopiujSesje');
                    fd.append('idki', JSON.stringify($scope.idki));
                                
                    var response = $http({
                        method: "POST",
                        url: 'core/http_treningi.php',
                        data: fd,
                        headers: {'Content-Type': undefined}
                    }).then(function mySucces(response) {
                        if(response.data.odp!=='OK') {
                            alert(response.data);
                            $scope.loaderDanych = false;
                        }else{
                            //$scope.edycja = false;
                            //console.dir($scope.idki);
                            $scope.loaderDanych = false;
                            $scope.pobierzListe($scope.idTreningu,$scope.wyswietlanyMiesiac.format('YYYY-MM-DD'));
                            $scope.wybraneDaty.length = 0;
                        }
                    }, function myError(response) {
                        alert("Error: "+response.StatusText);
                        $scope.loaderDanych = false;
                    });
                }, function(){ //rezygnacja
                    $scope.loaderDanych = false;
                    //$scope.edycja = false;
                });
            }else{
                $mdDialog.show(
                $mdDialog.alert()
                    //.parent(angular.element(document.querySelector('#popupContainer')))
                    .clickOutsideToClose(true)
                    .title($rootScope.lang==='pl' ? 'Wybierz zakres maksymalnie tygodnia.' : 'Select maximum one week spread.')
                    .textContent($rootScope.lang==='pl' ? '(np. od poniedziałku do niedzieli lub od czwartku do środy).' : '(eg. from monday to sunday or from thursday to wednesday).')
                    .ariaLabel('Alert Dialog')
                    .theme($rootScope.temat)
                    .ok('OK')
                    .targetEvent(ev)
                );
            }
        }
    };
    
    $scope.przesunSesjeDoPrzodu = function (ev) {
        
        if($scope.sprawdzWybraneDaty(ev)){
        
            $scope.loaderDanych = true;
                            
            var confirm = $mdDialog.confirm()
                .title($rootScope.lang==='pl' ? 'Przesuwanie sesji treningowych' : 'Moving training sessions')
                .textContent($rootScope.lang==='pl' ? 'Przesunąć wybrane sesje na następny dzień?' : 'Move selected sessions for next days?')
                .ariaLabel('...')
                .theme($rootScope.temat)
                .targetEvent(ev)
                .ok($rootScope.lang==='pl' ? 'Tak' : 'Yes')
                .cancel($rootScope.lang==='pl' ? 'Nie' : 'No');
                            
            $mdDialog.show(confirm).then(function(result){
                            
                var fd = new FormData();
                fd.append('akcja', 'przesunSesjeDoPrzodu');
                fd.append('idki', JSON.stringify($scope.idki));
                                
                var response = $http({
                    method: "POST",
                    url: 'core/http_treningi.php',
                    data: fd,
                    headers: {'Content-Type': undefined}
                }).then(function mySucces(response) {
                    if(response.data.odp!=='OK') {
                        alert(response.data);
                        $scope.loaderDanych = false;
                    }else{
                        //$scope.edycja = false;
                        $scope.loaderDanych = false;
                        $scope.pobierzListe($scope.idTreningu,$scope.wyswietlanyMiesiac.format('YYYY-MM-DD'));
                        $scope.wybraneDaty.length = 0;
                    }
                }, function myError(response) {
                    alert("Error: "+response.StatusText);
                    $scope.loaderDanych = false;
                });
            }, function(){ //rezygnacja
                $scope.loaderDanych = false;
                //$scope.edycja = false;
            });
        }
    };
    
    $scope.przesunSesjeDoTylu = function (ev) {
        
        if($scope.sprawdzWybraneDaty(ev)){
        
            $scope.loaderDanych = true;
                            
            var confirm = $mdDialog.confirm()
                .title($rootScope.lang==='pl' ? 'Przesuwanie sesji treningowych' : 'Moving training sessions')
                .textContent($rootScope.lang==='pl' ? 'Przesunąć wybrane sesje na poprzedni dzień?' : 'Move selected sessions for previous days?')
                .ariaLabel('...')
                .theme($rootScope.temat)
                .targetEvent(ev)
                .ok($rootScope.lang==='pl' ? 'Tak' : 'Yes')
                .cancel($rootScope.lang==='pl' ? 'Nie' : 'No');
                            
            $mdDialog.show(confirm).then(function(result){
                            
                var fd = new FormData();
                fd.append('akcja', 'przesunSesjeDoTylu');
                fd.append('idki', JSON.stringify($scope.idki));
                                
                var response = $http({
                    method: "POST",
                    url: 'core/http_treningi.php',
                    data: fd,
                    headers: {'Content-Type': undefined}
                }).then(function mySucces(response) {
                    if(response.data.odp!=='OK') {
                        alert(response.data);
                        $scope.loaderDanych = false;
                    }else{
                        //$scope.edycja = false;
                        $scope.loaderDanych = false;
                        $scope.pobierzListe($scope.idTreningu,$scope.wyswietlanyMiesiac.format('YYYY-MM-DD'));
                        $scope.wybraneDaty.length = 0;
                    }
                }, function myError(response) {
                    alert("Error: "+response.StatusText);
                    $scope.loaderDanych = false;
                });
            }, function(){ //rezygnacja
                $scope.loaderDanych = false;
                //$scope.edycja = false;
            });
        }
    };
    
    $scope.usunSesje = function (ev) {
            
        if($scope.sprawdzWybraneDaty(ev)){
        
            $scope.loaderDanych = true;
                            
            var confirm = $mdDialog.confirm()
                .title($rootScope.lang==='pl' ? 'Usuwanie sesji treningowych' : 'Removing training sessions')
                .textContent($rootScope.lang==='pl' ? 'Usunąć wybrane sesje?' : 'Delete selected sessions?')
                .ariaLabel('...')
                .theme($rootScope.temat)
                .targetEvent(ev)
                .ok($rootScope.lang==='pl' ? 'Tak' : 'Yes')
                .cancel($rootScope.lang==='pl' ? 'Nie' : 'No');
                            
            $mdDialog.show(confirm).then(function(result){
                            
                var fd = new FormData();
                fd.append('akcja', 'usunSesje');
                fd.append('idki', JSON.stringify($scope.idki));
                                
                var response = $http({
                    method: "POST",
                    url: 'core/http_treningi.php',
                    data: fd,
                    headers: {'Content-Type': undefined}
                }).then(function mySucces(response) {
                    if(response.data.odp!=='OK') {
                        alert(response.data);
                        $scope.loaderDanych = false;
                    }else{
                        //$scope.edycja = false;
                        $scope.loaderDanych = false;
                        $scope.pobierzListe($scope.idTreningu,$scope.wyswietlanyMiesiac.format('YYYY-MM-DD'));
                        $scope.wybraneDaty.length = 0;
                    }
                }, function myError(response) {
                    alert("Error: "+response.StatusText);
                    $scope.loaderDanych = false;
                });
            }, function(){ //rezygnacja
                $scope.loaderDanych = false;
                //$scope.edycja = false;
            });
        }
    };
    
    $scope.zmianaMiesiaca = function (ev,month) {
        //console.log($scope.wyswietlanyMiesiac.month());
        console.log('przed: '+$scope.wyswietlanyMiesiac.format('YYYY-MM-DD'));
        $scope.wyswietlanyMiesiac = month;
        console.log('po: '+$scope.wyswietlanyMiesiac.format('YYYY-MM-DD'));
        $scope.pobierzListe($scope.idTreningu,$scope.wyswietlanyMiesiac.format('YYYY-MM-DD'));
        $scope.wybraneDaty.length = 0;
        $scope.idki.length = 0;
    };
    
    $scope.toggleEdycja = function () {
        $scope.edycja = !$scope.edycja;
    };
    $scope.toggleEdycjaNazwyIno = function () {
        $scope.edycjaNazwyIno = !$scope.edycjaNazwyIno;
    };
    
});
