app.controller('moiKlienciCtrl', function ($scope, $rootScope, $http, $window, $mdDialog) {

    $scope.loaderDanych = false;

    $scope.lista = [];

    $scope.pobierzListe = function () {
        $scope.loaderDanych = true;
        let url = 'core/http_moi_klienci.php?akcja=moiKlienci';
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
            alert("Error loading clients list in http...php");
        });
        //let elmnt = document.getElementById('gura');
        //elmnt.scrollIntoView({block: 'start'});
    };
    $scope.pobierzListe();
    
    $scope.akceptujKlienta = function (ev,idCt,login) {
            $scope.loaderDanych = true;

            var confirm = $mdDialog.confirm()
                .title($rootScope.lang==='pl' ? 'Akceptacja nowego klienta' : 'Accept New Client')
                .textContent($rootScope.lang==='pl' ? 'Potwierdzasz '+login+' jako nowego klienta?' : 'Confirm '+login+' as new client?')
                .ariaLabel('...')
                .theme($rootScope.temat)
                .targetEvent(ev)
                .ok($rootScope.lang==='pl' ? 'Tak' : 'Yes')
                .cancel($rootScope.lang==='pl' ? 'Nie' : 'No');
                            
            $mdDialog.show(confirm).then(function(result){
                            
                var fd = new FormData();
                fd.append('akcja', 'akceptujKlienta');
                fd.append('id', idCt);
                                
                var response = $http({
                    method: "POST",
                    url: 'core/http_moi_klienci.php',
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
    
    $scope.odrzucKlienta = function (ev,idCt,login) {

            $scope.loaderDanych = true;

            var confirm = $mdDialog.confirm()
                .title($rootScope.lang==='pl' ? 'Odrzucenie klienta' : 'Reject New Client')
                .textContent($rootScope.lang==='pl' ? 'Potwierdzasz odrzucenie '+login+'?' : 'Confirm rejection of '+login+'?')
                .ariaLabel('...')
                .theme($rootScope.temat)
                .targetEvent(ev)
                .ok($rootScope.lang==='pl' ? 'Tak' : 'Yes')
                .cancel($rootScope.lang==='pl' ? 'Nie' : 'No');
                            
            $mdDialog.show(confirm).then(function(result){
                            
                var fd = new FormData();
                fd.append('akcja', 'odrzucKlienta');
                fd.append('id', idCt);
                                
                var response = $http({
                    method: "POST",
                    url: 'core/http_moi_klienci.php',
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
    
    $scope.usunKlienta = function (ev,idCt,login) {//to samo co odrzucenie

            $scope.loaderDanych = true;

            var confirm = $mdDialog.confirm()
                .title($rootScope.lang==='pl' ? 'Usunięcie z listy klientów' : 'Removing from client  list')
                .textContent($rootScope.lang==='pl' ? 'Potwierdzasz usunięcie '+login+'?' : 'Remove '+login+'?')
                .ariaLabel('...')
                .theme($rootScope.temat)
                .targetEvent(ev)
                .ok($rootScope.lang==='pl' ? 'Tak' : 'Yes')
                .cancel($rootScope.lang==='pl' ? 'Nie' : 'No');
                            
            $mdDialog.show(confirm).then(function(result){
                            
                var fd = new FormData();
                fd.append('akcja', 'odrzucKlienta');//to samo co odrzucenie
                fd.append('id', idCt);
                                
                var response = $http({
                    method: "POST",
                    url: 'core/http_moi_klienci.php',
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
