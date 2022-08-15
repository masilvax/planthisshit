app.controller('sesjaCtrl', function ($scope, $rootScope, $http, $window, $mdDialog, $routeParams, $interval) {
    
    $scope.edycja = false;
    $scope.alarm = false;
    $scope.pozostalyCzas = 100;
    $scope.pozostalyCzasProcenty = 100;
    
    $scope.idSesji = $routeParams.idSesji;
    
    $scope.lista = [];
    $scope.loaderDanych = false;
    
    $scope.edytowaneCwiczenie = [];
    $scope.odliczanaSeria = [];
    
    //alert('działa?');
    
    $scope.pobierzListe = function (idSesji) {
        $scope.loaderDanych = true;

        $http.get('core/http_sesja.php?akcja=wyswietlSesje&id='+idSesji).then(function (response) {
            //First function handles success
            if (response.data === "session timed out") {
                //$window.location = "#!login";
                $rootScope.kto = false;
            } else {
                if(response.data.odp !=='OK'){
                    alert(response.data);
                }
                
                $scope.lista = response.data;

                //w przypadku gdy nie ma jeszcze zadnej serii zrobionej, to pole ZROBIONE w bazie jest puste 
                if($scope.lista.sesja.cwiczenia){
                    
                    angular.forEach($scope.lista.sesja.cwiczenia, function (v,k){
                        
                        if(v.zrobione.length>0){
                            v.zrobione = JSON.parse(v.zrobione);
                            //console.log('serie: '+v.serie+' zrobione: '+v.zrobione.length);
                            if(v.serie != v.zrobione.length){
                                console.log('l serii sie nie zgadza (zrobione): '+v.nazwa +" - serie: "+v.serie+", dlugosc: "+v.zrobione.length);
                            }
                        }else{
                            let zrobioneArr = [];
                            for(let i=0;i<v.serie;i++){
                                zrobioneArr.push(0);
                            }
                            v.zrobione = zrobioneArr;
                        }
                        
                        
                        if(v.powt.length>0){
                            v.powt = JSON.parse(v.powt);
                            //console.log('serie: '+v.serie+' powt: '+v.powt.length);
                            if(v.serie != v.powt.length){
                                console.log('l serii sie nie zgadza (powtorzenia): '+v.nazwa +" - serie: "+v.serie+", dlugosc: "+v.powt.length);
                            }
                        }else{
                            let powtArr = [];
                            for(let i=0;i<v.serie;i++){
                                powtArr.push(0);
                            }
                            v.powt = powtArr;
                        }
                        
                        
                        if(v.ciezar.length>0){
                            v.ciezar = JSON.parse(v.ciezar);
                            //console.log('serie: '+v.serie+' ciezar: '+v.ciezar.length);
                            if(v.serie != v.ciezar.length){
                                console.log('l serii sie nie zgadza (ciezar): '+v.nazwa +" - serie: "+v.serie+", dlugosc: "+v.ciezar.length);
                            }
                        }else{
                            let ciezarArr = [];
                            for(let i=0;i<v.serie;i++){
                                ciezarArr.push(0);
                            }
                            v.ciezar = ciezarArr;
                        }

                        /*v.zrobione = JSON.parse(v.zrobione);
                        if(v.serie != v.zrobione.length){
                            let zrobioneArr = [];
                            for(let i=0;i<v.serie;i++){
                                zrobioneArr.push(0);
                            }
                            v.zrobione = zrobioneArr
                        }*/
                    });

                }

                $scope.loaderDanych = false;
            }
        }, function (response) {
            //Second function handles error
            alert("error loading training session in request");
        });
    };
    $scope.pobierzListe($scope.idSesji);
    
    $scope.toggleEdycja = function () {//edycja sesji, czyli daty i nazwy tylko
        $scope.edycja = !$scope.edycja;
    };
    
    $scope.toggleAlarm = function () {
        $scope.alarm = !$scope.alarm;
    };
    
    
             //Initiate the Timer object.
            $scope.Timer = null;
            $scope.tajmerZaczymany = false;
 
            //Timer start function.
            $scope.StartTimer = function () {

                $scope.StopTimer();
                let pozostalyCzasPierwotny = $scope.pozostalyCzas;// no tylko jak ktos nadusi pauze i wznowi to ten pozostaly czas bedzie czasem pierwotnym, czyli kółko sie zapełni z powrotem całe
                $scope.pozostalyCzasProcenty = 100;// bo przez sekunde bedzie tyle ile bylo w poprzednim odliczaniu

                //Initialize the Timer to run every 1000 milliseconds i.e. one second.
                $scope.Timer = $interval(function () {
                    
                    $scope.tajmerZaczymany = false;
                    
                    if($scope.pozostalyCzas > 0){
                        $scope.pozostalyCzas--;
                        if($scope.pozostalyCzas==0){
                            var audio = new Audio('gfx/alarm1.mp3');//szfarcwalt-czopa.mp3
                            //audio.volume = 0.1;
                            audio.play();
                        }
                        
                        //TUTAJ $scope.pozostalyCzas zamienic na procenty
                        $scope.pozostalyCzasProcenty = (100 * $scope.pozostalyCzas) / pozostalyCzasPierwotny;
                        
                    }else{
                        $scope.StopTimer();
                    }
                }, 1000);
            };
 
            //Timer stop function.
            $scope.StopTimer = function () {
 
                //Cancel the Timer.
                if (angular.isDefined($scope.Timer)) {
                    $interval.cancel($scope.Timer);
                }
                
                $scope.tajmerZaczymany = true;
            };
    
    
    $scope.sprawdzPoprzednieSupersetyWstawDoOdliczania = function (cwiczenieIndex, seriaIndex) {//nastepna seria, czyli sprawdza poprzednie cwiczenie i potem jeszcze raz sie wywoluje (REKÓRĘTSJA)
        if(cwiczenieIndex > 0){// nie pierwszy
            
            if($scope.lista.sesja.cwiczenia[cwiczenieIndex - 1].superset == '1'){

                if($scope.lista.sesja.cwiczenia[cwiczenieIndex - 1].jedn_intens=='BW'){
                    
                    $scope.odliczanaSeria.push({'nazwaKrotka':$scope.lista.sesja.cwiczenia[cwiczenieIndex - 1].nazwa_krotka,'powtCiezar':$scope.lista.sesja.cwiczenia[cwiczenieIndex - 1].powt[seriaIndex]+'x'+$scope.lista.sesja.cwiczenia[cwiczenieIndex - 1].jedn_intens});

                }else{
                    
                    $scope.odliczanaSeria.push({'nazwaKrotka':$scope.lista.sesja.cwiczenia[cwiczenieIndex - 1].nazwa_krotka,'powtCiezar':$scope.lista.sesja.cwiczenia[cwiczenieIndex - 1].powt[seriaIndex]+'x'+$scope.lista.sesja.cwiczenia[cwiczenieIndex - 1].ciezar[seriaIndex]+$scope.lista.sesja.cwiczenia[cwiczenieIndex - 1].jedn_intens});

                }
                    
                $scope.sprawdzPoprzednieSupersetyWstawDoOdliczania(cwiczenieIndex - 1,seriaIndex);
            }else{
                return false;
            }

        }
        return false;
    }
    
    $scope.sprawdzNastepneSupersetyWstawDoOdliczania = function (cwiczenieIndex) {// nastepne cwiczenie
        //czyli sprawdza nastepne cwiczenie i potem jeszcze raz sie wywoluje (REKÓRĘTSJA)
        // seria zawsze pierwsza,bo to sie wywoluje tylko w ostatniej serii danego cwiczenia
        //UWAGA!!! bo chodzi o KOLEJNE cwiczenie KOLEJNEGO cwiczenia czy ma superseta
        
        if(cwiczenieIndex < $scope.lista.sesja.cwiczenia.length - 1){// nie ostatni
            
            if($scope.lista.sesja.cwiczenia[cwiczenieIndex].superset == '1'){//cwiczenieIndex - kolejny i tego sprawdzamy, a potem cwiczenieIndex + 1, czyli nastepniejszy bo z nim jest zsupersetowany

                if($scope.lista.sesja.cwiczenia[cwiczenieIndex + 1].jedn_intens=='BW'){
                    
                    $scope.odliczanaSeria.push({'nazwaKrotka':$scope.lista.sesja.cwiczenia[cwiczenieIndex + 1].nazwa_krotka,'powtCiezar':$scope.lista.sesja.cwiczenia[cwiczenieIndex + 1].powt[0]+'x'+$scope.lista.sesja.cwiczenia[cwiczenieIndex + 1].jedn_intens});

                }else{
                    
                    $scope.odliczanaSeria.push({'nazwaKrotka':$scope.lista.sesja.cwiczenia[cwiczenieIndex + 1].nazwa_krotka,'powtCiezar':$scope.lista.sesja.cwiczenia[cwiczenieIndex + 1].powt[0]+'x'+$scope.lista.sesja.cwiczenia[cwiczenieIndex + 1].ciezar[0]+$scope.lista.sesja.cwiczenia[cwiczenieIndex + 1].jedn_intens});

                }
                    
                $scope.sprawdzNastepneSupersetyWstawDoOdliczania(cwiczenieIndex + 1);
            }else{
                return false;
            }

        }
        return false;
    }
            
    $scope.doneUndone = function (ev,index,cwiczenieIndex,idCwiczenia,wartosc) {//index-ktora seria, cwiczenieIndex-ktore cwiczenie,idCwiczenia-id w bazie [idCwiczenia chyba mozna wywalic]

        //console.log('index: '+index+', cwiczenieIndex: '+cwiczenieIndex);
        
        $scope.lista.sesja.cwiczenia[cwiczenieIndex].zrobione[index] = wartosc;
        $scope.loaderDanych = true;
        
        var fd = new FormData();
        fd.append('akcja', 'zrobione');
        fd.append('id', $scope.lista.sesja.cwiczenia[cwiczenieIndex].id);
        fd.append('zrobione',JSON.stringify($scope.lista.sesja.cwiczenia[cwiczenieIndex].zrobione));

        var response = $http({
            method: "POST",
            url: 'core/http_sesja.php',
            data: fd,
            headers: {'Content-Type': undefined}
        }).then(function mySucces(response) {
            if(response.data.odp!=='OK') {
                alert(response.data);
            }
            $scope.pobierzListe($scope.idSesji);
            //TUDU: if(wartosc == 1 && $scope.alarm) to odliczanie sekund do nastepnego cwiczenia progres circularem procentowo i na koncu odliczania odtworzyc dzwiek 
                //var audio = new Audio('https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3');
                //audio.play();
            
            if(wartosc == 1 && $scope.alarm){
                
                let dalej = true;
                $scope.odliczanaSeria = [];
                $scope.odliczanaSeria.length = 0;
                
                if(index < $scope.lista.sesja.cwiczenia[cwiczenieIndex].zrobione.length - 1){// nastepna seria
                    //console.log('index: '+index+', lserii: '+$scope.lista.sesja.cwiczenia[cwiczenieIndex].zrobione.length+', przerwyserie: '+$scope.lista.sesja.cwiczenia[cwiczenieIndex].przerwy_serie);
                    
                    $scope.pozostalyCzas = $scope.lista.sesja.cwiczenia[cwiczenieIndex].przerwy_serie;
                    
                    if($scope.lista.sesja.cwiczenia[cwiczenieIndex].jedn_intens=='BW'){
                        
                        $scope.odliczanaSeria.push({'nazwaKrotka':$scope.lista.sesja.cwiczenia[cwiczenieIndex].nazwa_krotka,'powtCiezar':$scope.lista.sesja.cwiczenia[cwiczenieIndex].powt[index+1]+'x'+$scope.lista.sesja.cwiczenia[cwiczenieIndex].jedn_intens});

                    }else{
                        
                        $scope.odliczanaSeria.push({'nazwaKrotka':$scope.lista.sesja.cwiczenia[cwiczenieIndex].nazwa_krotka,'powtCiezar':$scope.lista.sesja.cwiczenia[cwiczenieIndex].powt[index+1]+'x'+$scope.lista.sesja.cwiczenia[cwiczenieIndex].ciezar[index+1]+$scope.lista.sesja.cwiczenia[cwiczenieIndex].jedn_intens});

                    }                    
                    //wypełnilimy odliczanaSerie ale jak sa supersety to polaczone serie trza dolozyc
                    $scope.sprawdzPoprzednieSupersetyWstawDoOdliczania(cwiczenieIndex,index+1);
                    $scope.odliczanaSeria = $scope.odliczanaSeria.slice().reverse();
                                        
                }else if(cwiczenieIndex < $scope.lista.sesja.cwiczenia.length -1){// nastepne cwiczenie
                    //console.log('cwiczenieIndex: '+cwiczenieIndex+', lcwiczen: '+$scope.lista.sesja.cwiczenia.length+', przerwa_po: '+$scope.lista.sesja.cwiczenia[cwiczenieIndex].przerwa_po);
                    
                    $scope.pozostalyCzas = $scope.lista.sesja.cwiczenia[cwiczenieIndex].przerwa_po;
                    
                    if($scope.lista.sesja.cwiczenia[cwiczenieIndex + 1].jedn_intens=='BW'){
                        
                        $scope.odliczanaSeria.push({'nazwaKrotka':$scope.lista.sesja.cwiczenia[cwiczenieIndex + 1].nazwa_krotka,'powtCiezar':$scope.lista.sesja.cwiczenia[cwiczenieIndex + 1].powt[0]+'x'+$scope.lista.sesja.cwiczenia[cwiczenieIndex + 1].jedn_intens});

                    }else{
                        
                        $scope.odliczanaSeria.push({'nazwaKrotka':$scope.lista.sesja.cwiczenia[cwiczenieIndex + 1].nazwa_krotka,'powtCiezar':$scope.lista.sesja.cwiczenia[cwiczenieIndex + 1].powt[0]+'x'+$scope.lista.sesja.cwiczenia[cwiczenieIndex + 1].ciezar[0]+$scope.lista.sesja.cwiczenia[cwiczenieIndex + 1].jedn_intens});

                    }     
                    //wypełnilimy odliczanaSerie ale jak sa supersety to polaczone serie trza dolozyc
                    $scope.sprawdzNastepneSupersetyWstawDoOdliczania(cwiczenieIndex + 1);
                }else{
                    dalej = false;//KONIEC TRENINGU
                }
                
                if(dalej){
                    $scope.StartTimer();
                    
                    $mdDialog.show({
                        controller: DialogController,
                        templateUrl: 'templates/dialogOdliczanie.htm',
                        targetEvent: ev,
                        theme: $rootScope.temat,
                        clickOutsideToClose:false,
                        scope: $scope,
                        preserveScope: true,//wazne jak uzywamy scope'a!
                        fullscreen: false//!$scope.duze // Only for -xs, -sm breakpoints.
                    })
                    .then(function() {//OK, czyli hide()

                    }, function() {//CANCEL
                        $scope.loaderDialoga = false;
                    });
                }else{
                    $mdDialog.show(
                    $mdDialog.alert()
                        .clickOutsideToClose(true)
                        .theme($rootScope.temat)
                        .title($rootScope.lang==='pl' ? 'Przetrwałeś sesję treningową!' : 'You survived this training session!')
                        .textContent($rootScope.lang==='pl' ? 'Łel dan kurwa, łel dan!' : 'Well done my friend! You shall be greatly rewarded in gains!')
                        .ariaLabel('Alert Dialog Demo')
                        .ok($rootScope.lang==='pl' ? 'Tera do chaty!' : 'Go home now!')
                        .targetEvent(ev)
                    );
                }
            }
            
        }, function myError(response) {
            alert("Error: "+response.StatusText);
            $scope.loaderDanych = false;
        });
    }

    $scope.zapiszSesje = function (ev) {
            $scope.loaderDanych = true;
                            
            var confirm = $mdDialog.confirm()
                .title($rootScope.lang==='pl' ? 'Zmiana danych sesji' : 'Edit session data')
                .textContent($rootScope.lang==='pl' ? 'Na pewno?' : 'Are you sure?')
                .ariaLabel('...')
                .theme($rootScope.temat)
                .targetEvent(ev)
                .ok($rootScope.lang==='pl' ? 'Tak' : 'Yes')
                .cancel($rootScope.lang==='pl' ? 'Nie' : 'No');
                            
            $mdDialog.show(confirm).then(function(result){
                            
                var fd = new FormData();
                fd.append('akcja', 'zapiszSesje');
                fd.append('id_sesji', $scope.lista.sesja.id);
                fd.append('nazwa', $scope.lista.sesja.nazwa);
                if(typeof $scope.lista.sesja.data==='object')
                    fd.append('data', $scope.lista.sesja.data.getFullYear()+'-'+parseInt($scope.lista.sesja.data.getMonth()+1)+'-'+$scope.lista.sesja.data.getDate());
                if(typeof $scope.lista.sesja.data==='string')
                    fd.append('data', $scope.lista.sesja.data);
                
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
                        $scope.pobierzListe($scope.idSesji);
                        $scope.edycja = false;
                    }
                }, function myError(response) {
                    alert("Error: "+response.StatusText);
                    $scope.loaderDanych = false;
                    $scope.edycja = false;
                });
            }, function(){ //rezygnacja
                $scope.pobierzListe($scope.idSesji);
                $scope.edycja = false;
            });
    }
    
    $scope.supersetujCwiczenie = function (ev,idCwiczenia,co) {
            $scope.loaderDanych = true;
            let struna = '';
            if(co==='odsupersetujCwiczenie'){
                struna = ($rootScope.lang==='pl' ? 'Rozłącz z poniższym' : 'Un-superset with below');
            }else{
                struna = ($rootScope.lang==='pl' ? 'Superseria z poniższym' : 'Superset with below');
            }
            var confirm = $mdDialog.confirm()
                .title(struna)
                .textContent($rootScope.lang==='pl' ? 'Na pewno?' : 'Are you sure?')
                .ariaLabel('...')
                .theme($rootScope.temat)
                .targetEvent(ev)
                .ok($rootScope.lang==='pl' ? 'Tak' : 'Yes')
                .cancel($rootScope.lang==='pl' ? 'Nie' : 'No');
                            
            $mdDialog.show(confirm).then(function(result){
                            
                var fd = new FormData();
                fd.append('akcja', co);
                fd.append('id', idCwiczenia);
                                
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
                        $scope.pobierzListe($scope.idSesji);
                    }
                }, function myError(response) {
                    alert("Error: "+response.StatusText);
                    $scope.loaderDanych = false;
                });
            }, function(){ //rezygnacja
                $scope.pobierzListe($scope.idSesji);
            });
    }
    
    $scope.usunCwiczenie = function (ev,idCwiczenia) {
            $scope.loaderDanych = true;

            var confirm = $mdDialog.confirm()
                .title($rootScope.lang==='pl' ? 'Usuwanie ćwiczenia' : 'Deleting excercise?')
                .textContent($rootScope.lang==='pl' ? 'Na pewno?' : 'Are you sure?')
                .ariaLabel('...')
                .theme($rootScope.temat)
                .targetEvent(ev)
                .ok($rootScope.lang==='pl' ? 'Tak' : 'Yes')
                .cancel($rootScope.lang==='pl' ? 'Nie' : 'No');
                            
            $mdDialog.show(confirm).then(function(result){
                            
                var fd = new FormData();
                fd.append('akcja', 'usunCwiczenie');
                fd.append('id', idCwiczenia);
                fd.append('id_sesji',$scope.idSesji);
                                
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
                        $scope.pobierzListe($scope.idSesji);
                    }
                }, function myError(response) {
                    alert("Error: "+response.StatusText);
                    $scope.loaderDanych = false;
                });
            }, function(){ //rezygnacja
                $scope.pobierzListe($scope.idSesji);
            });
    }
    
    $scope.przesunDoGory = function (ev,idCwiczenia) {

            $scope.loaderDanych = true;

            var confirm = $mdDialog.confirm()
                .title($rootScope.lang==='pl' ? 'Przesuń ćwiczenie wyżej?' : 'Move the exercise up?')
                .textContent($rootScope.lang==='pl' ? 'Superserie zamienianych kolejnością ćwiczeń zostaną zamienione' : 'Supersets will be switched between moving exercises')
                .ariaLabel('...')
                .theme($rootScope.temat)
                .targetEvent(ev)
                .ok($rootScope.lang==='pl' ? 'Tak' : 'Yes')
                .cancel($rootScope.lang==='pl' ? 'Nie' : 'No');
                            
            $mdDialog.show(confirm).then(function(result){
                            
                var fd = new FormData();
                fd.append('akcja', 'przesunDoGory');
                fd.append('id', idCwiczenia);
                                
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
                        $scope.pobierzListe($scope.idSesji);
                    }
                }, function myError(response) {
                    alert("Error: "+response.StatusText);
                    $scope.loaderDanych = false;
                });
            }, function(){ //rezygnacja
                $scope.pobierzListe($scope.idSesji);
            });
    }
    
    $scope.przesunNaDol = function (ev,idCwiczenia) {
        
            $scope.loaderDanych = true;

            var confirm = $mdDialog.confirm()
                .title($rootScope.lang==='pl' ? 'Przesuń ćwiczenie niżej?' : 'Move the exercise down?')
                .textContent($rootScope.lang==='pl' ? 'Superserie zamienianych kolejnością ćwiczeń zostaną zamienione' : 'Supersets will be switched between moving exercises')
                .ariaLabel('...')
                .theme($rootScope.temat)
                .targetEvent(ev)
                .ok($rootScope.lang==='pl' ? 'Tak' : 'Yes')
                .cancel($rootScope.lang==='pl' ? 'Nie' : 'No');
                            
            $mdDialog.show(confirm).then(function(result){
                            
                var fd = new FormData();
                fd.append('akcja', 'przesunNaDol');
                fd.append('id', idCwiczenia);
                                
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
                        $scope.pobierzListe($scope.idSesji);
                    }
                }, function myError(response) {
                    alert("Error: "+response.StatusText);
                    $scope.loaderDanych = false;
                });
            }, function(){ //rezygnacja
                $scope.pobierzListe($scope.idSesji);
            });
    }
    
    $scope.edycjaCwiczenia = function (ev,idCwiczenia) {
        if(idCwiczenia===0){
            $scope.edytowaneCwiczenie = [];
            $scope.edytowaneCwiczenie.length = 0;
            $scope.edytowaneCwiczenie.id = 0;
            
            $scope.edytowaneCwiczenie.nazwa = '';
            $scope.edytowaneCwiczenie.nazwa_krotka = '';
            
            $scope.edytowaneCwiczenie.serie = 1;
            $scope.edytowaneCwiczenie.ciezar = [];
            $scope.edytowaneCwiczenie.powt = [];
            $scope.edytowaneCwiczenie.zrobione = [];
            $scope.edytowaneCwiczenie.ciezar.push(1);
            $scope.edytowaneCwiczenie.powt.push(1);
            $scope.edytowaneCwiczenie.zrobione.push(0);
        }else{
            angular.forEach($scope.lista.sesja.cwiczenia, function (v,k){
                if(v.id===idCwiczenia){
                    $scope.edytowaneCwiczenie = v;
                }
            });
        }
        
        $mdDialog.show({
            controller: DialogController,
            templateUrl: 'templates/dialogCwiczenie.htm',
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
    
    $scope.cwiczenieInfo = function (ev,opis) {
        $mdDialog.show(
        $mdDialog.alert()
            .clickOutsideToClose(true)
            .theme($rootScope.temat)
            .title($rootScope.lang==='pl' ? 'Opis ćwiczenia' : 'Exercise description')
            .textContent(opis)
            .ariaLabel('Exercise description')
            .ok($rootScope.lang==='pl' ? 'zamknij' : 'close')
            .targetEvent(ev)
        );
    }
    
    function DialogController($scope, $mdDialog) {
            
        $scope.zapiszCwiczenie = function() {
            
            $scope.loaderDanychDialog = true;
            
            var fd = new FormData();
                fd.append('akcja', 'zapiszCwiczenie');
                fd.append('id',$scope.edytowaneCwiczenie.id);
                fd.append('id_sesji',$scope.idSesji);
                fd.append('nazwa',$scope.edytowaneCwiczenie.nazwa);
                fd.append('nazwa_krotka',$scope.edytowaneCwiczenie.nazwa_krotka);
                fd.append('jedn_intens',$scope.edytowaneCwiczenie.jedn_intens);
                fd.append('przerwy_serie',$scope.edytowaneCwiczenie.przerwy_serie);
                fd.append('przerwa_po',$scope.edytowaneCwiczenie.przerwa_po);
                fd.append('serie',$scope.edytowaneCwiczenie.serie);
                //fd.append('superset',$scope.edytowaneCwiczenie.superset);
                //fd.append('kolejnosc',$scope.edytowaneCwiczenie.kolejnosc);
                
                fd.append('zrobione',JSON.stringify($scope.edytowaneCwiczenie.zrobione));
                fd.append('ciezar',JSON.stringify($scope.edytowaneCwiczenie.ciezar));
                fd.append('powt',JSON.stringify($scope.edytowaneCwiczenie.powt));
                
                fd.append('lang',$rootScope.lang);

            var response = $http({
                method: "POST",
                url: 'core/http_sesja.php',
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
        
        $scope.zmniejszSerie = function () {
            if($scope.edytowaneCwiczenie.serie>1){
                
                if(!Array.isArray($scope.edytowaneCwiczenie.ciezar) || !Array.isArray($scope.edytowaneCwiczenie.powt) || !Array.isArray($scope.edytowaneCwiczenie.zrobione)){
                    $scope.edytowaneCwiczenie.serie = 1;
                    $scope.edytowaneCwiczenie.ciezar = [];
                    $scope.edytowaneCwiczenie.powt = [];
                    $scope.edytowaneCwiczenie.zrobione = [];
                    $scope.edytowaneCwiczenie.ciezar.push(1);
                    $scope.edytowaneCwiczenie.powt.push(1);
                    $scope.edytowaneCwiczenie.zrobione.push(0);
                }else{
                    $scope.edytowaneCwiczenie.powt.pop();
                    $scope.edytowaneCwiczenie.ciezar.pop();
                    $scope.edytowaneCwiczenie.zrobione.pop();
                    $scope.edytowaneCwiczenie.serie--;
                }
            }
        };
        
        $scope.zwiekszSerie = function () {
            if($scope.edytowaneCwiczenie.serie<99){
                
                if(!Array.isArray($scope.edytowaneCwiczenie.ciezar) || !Array.isArray($scope.edytowaneCwiczenie.powt) || !Array.isArray($scope.edytowaneCwiczenie.zrobione)){
                    $scope.edytowaneCwiczenie.serie = 1;
                    $scope.edytowaneCwiczenie.ciezar = [];
                    $scope.edytowaneCwiczenie.powt = [];
                    $scope.edytowaneCwiczenie.zrobione = [];
                    $scope.edytowaneCwiczenie.ciezar.push(1);
                    $scope.edytowaneCwiczenie.powt.push(1);
                    $scope.edytowaneCwiczenie.zrobione.push(0);
                }else{
                    $scope.edytowaneCwiczenie.serie++;
                    $scope.edytowaneCwiczenie.ciezar.push($scope.edytowaneCwiczenie.ciezar[$scope.edytowaneCwiczenie.ciezar.length - 1]);
                    $scope.edytowaneCwiczenie.powt.push($scope.edytowaneCwiczenie.powt[$scope.edytowaneCwiczenie.powt.length - 1]);
                    $scope.edytowaneCwiczenie.zrobione.push(0);
                }
                
            }else{
                alert('bez jaj człowieku! 99 serii to max!');
            }
        };
        
        $scope.zmniejszPowtorzenia = function (index) {
            if(Array.isArray($scope.edytowaneCwiczenie.powt) && $scope.edytowaneCwiczenie.powt[index]>1){
                
                $scope.edytowaneCwiczenie.powt[index]--;
                
            }
        };
        
        $scope.zwiekszPowtorzenia = function (index) {
            if(Array.isArray($scope.edytowaneCwiczenie.powt) && $scope.edytowaneCwiczenie.powt[index]<1000){
                
                $scope.edytowaneCwiczenie.powt[index]++;
                
            }
        };
        
        $scope.zmniejszCiezar = function (index) {
            if(Array.isArray($scope.edytowaneCwiczenie.ciezar) && $scope.edytowaneCwiczenie.ciezar[index]>1){
                
                $scope.edytowaneCwiczenie.ciezar[index] = $scope.edytowaneCwiczenie.ciezar[index] - 0.25;
                
            }
        };
        
        $scope.zwiekszCiezar = function (index) {
            if(Array.isArray($scope.edytowaneCwiczenie.ciezar) && $scope.edytowaneCwiczenie.ciezar[index]<1000){
                
                $scope.edytowaneCwiczenie.ciezar[index] = $scope.edytowaneCwiczenie.ciezar[index] + 0.25;
                
            }
        };

        $scope.cancel = function() {
            $mdDialog.cancel();
            $scope.pobierzListe($scope.idSesji);
            $scope.edytowaneCwiczenie = [];
            $scope.edytowaneCwiczenie.length = 0;
        };
        
        $scope.hide = function() {
            $mdDialog.hide();
            $scope.pobierzListe($scope.idSesji);
            $scope.edytowaneCwiczenie = [];
            $scope.edytowaneCwiczenie.length = 0;
        };

    };
    
});
