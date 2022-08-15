app.controller('moiTrenerzyCtrl', function ($scope, $rootScope, $http, $window, $mdDialog) {

    $scope.loaderDanych = false;

    $scope.lista = [];
    $scope.model = [];
    $scope.model.szukaj = '';

    $scope.pobierzListe = function () {
        $scope.loaderDanych = true;
        let url = 'core/http_moi_trenerzy.php?akcja=moiTrenerzy';
        $http.get(url).then(function (response) {
            //First function handles success
            if (response.data === "session timed out") {
                //$window.location = "#!login";
                $rootScope.kto = false;
            } else {
                if(response.data.odp !=='OK'){
                    alert(response.data);
                }else{
                    $scope.lista = response.data;
                    if($scope.model.szukaj.length > 2){
                        $scope.szukajTrenerow();
                    }
                }
                $scope.loaderDanych = false;
            }
        }, function (response) {
            //Second function handles error
            alert("Error loading trainers list in http...php");
        });
        //let elmnt = document.getElementById('gura');
        //elmnt.scrollIntoView({block: 'start'});
    };
    $scope.pobierzListe();
    
    $scope.szukajTrenerow = function () {

        $scope.loaderDanych = true;
        
        var fd = new FormData();
        fd.append('akcja', 'szukajTrenerow');
        fd.append('szukaj', $scope.model.szukaj);
        
        fd.append('lang',$rootScope.lang);
                                
        var response = $http({
            method: "POST",
            url: 'core/http_moi_trenerzy.php',
            data: fd,
            headers: {'Content-Type': undefined}
        }).then(function mySucces(response) {
            if(response.data.odp!=='OK') {
                alert(response.data);
                $scope.loaderDanych = false;
            }else{
                $scope.lista.znalezieniTrenerzy = response.data;
                $scope.loaderDanych = false;
            }
        }, function myError(response) {
            alert("Error: "+response.StatusText);
            $scope.loaderDanych = false;
        });
        
    }
    
    $scope.zaprosTrenera = function (ev,idTrenera,login) {
            $scope.loaderDanych = true;

            var confirm = $mdDialog.confirm()
                .title($rootScope.lang==='pl' ? 'Wysyłanie zaproszenia' : 'Sending Invitation')
                .textContent($rootScope.lang==='pl' ? 'Wysłać '+login+' zaproszenie?' : 'Send '+login+' an invitation?')
                .ariaLabel('...')
                .theme($rootScope.temat)
                .targetEvent(ev)
                .ok($rootScope.lang==='pl' ? 'Tak' : 'Yes')
                .cancel($rootScope.lang==='pl' ? 'Nie' : 'No');
                            
            $mdDialog.show(confirm).then(function(result){
                            
                var fd = new FormData();
                fd.append('akcja', 'zaprosTrenera');
                fd.append('id', idTrenera);
                                
                var response = $http({
                    method: "POST",
                    url: 'core/http_moi_trenerzy.php',
                    data: fd,
                    headers: {'Content-Type': undefined}
                }).then(function mySucces(response) {
                    if(response.data.odp!=='OK') {
                        alert(response.data);
                        $scope.loaderDanych = false;
                    }else{
                        $scope.pobierzListe();
                    }
                }, function myError(response) {
                    alert("Error: "+response.StatusText);
                    $scope.loaderDanych = false;
                });
            }, function(){ //rezygnacja
                $scope.pobierzListe();
            });
    }
    
    $scope.odrzucTrenera = function (ev,idCt,login) {

            $scope.loaderDanych = true;

            var confirm = $mdDialog.confirm()
                .title($rootScope.lang==='pl' ? 'Rezygnacja z Trenera' : 'Quit a Trainer')
                .textContent($rootScope.lang==='pl' ? 'Potwierdzasz odrzucenie '+login+'?' : 'Confirm quitting of '+login+'?')
                .ariaLabel('...')
                .theme($rootScope.temat)
                .targetEvent(ev)
                .ok($rootScope.lang==='pl' ? 'Tak' : 'Yes')
                .cancel($rootScope.lang==='pl' ? 'Nie' : 'No');
                            
            $mdDialog.show(confirm).then(function(result){
                            
                var fd = new FormData();
                fd.append('akcja', 'odrzucTrenera');
                fd.append('id', idCt);
                                
                var response = $http({
                    method: "POST",
                    url: 'core/http_moi_trenerzy.php',
                    data: fd,
                    headers: {'Content-Type': undefined}
                }).then(function mySucces(response) {
                    if(response.data.odp!=='OK') {
                        alert(response.data);
                        $scope.loaderDanych = false;
                    }else{
                        $scope.pobierzListe();
                        $rootScope.ilePotenjalnych();
                    }
                }, function myError(response) {
                    alert("Error: "+response.StatusText);
                    $scope.loaderDanych = false;
                });
            }, function(){ //rezygnacja
                $scope.pobierzListe();
            });
    }
    
});
