app.controller('klientaTreningiCtrl', function ($scope, $rootScope, $http, $window, $mdDialog,$routeParams) {

    $scope.loaderDanych = false;
    $scope.idKlienta = $routeParams.idKlienta;

    $scope.lista = [];

    $scope.pobierzListe = function () {
        $scope.loaderDanych = true;
        let url = 'core/http_treningi.php?akcja=klientaTreningi&id_cwiklacza='+$scope.idKlienta;
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
            alert("Error loading trainings data in http...php");
        });
        //let elmnt = document.getElementById('gura');
        //elmnt.scrollIntoView({block: 'start'});
    };
    $scope.pobierzListe();
    
    
    $scope.dodajNowyTrening = function (ev) {
                var confirm = $mdDialog.prompt()
                .title($rootScope.lang==='pl' ? 'NOWY PLAN TRENINGOWY' : 'NEW TRAINING PROGRAM')
                .textContent($rootScope.lang==='pl' ? 'podaj nazwę' : 'enter name')
                .placeholder($rootScope.lang==='pl' ? 'nazwa planu' : 'program name')
                .ariaLabel($rootScope.lang==='pl' ? 'nazwa planu' : 'program name')
                .initialValue('')
                .targetEvent(ev)
                .required(true)
                .theme($rootScope.temat)
                .ok('OK')
                .cancel($rootScope.lang==='pl' ? 'Anuluj' : 'Cancel');

                $mdDialog.show(confirm).then(function (result) {
                    
                    var fd = new FormData();
                    fd.append('akcja', 'zapiszTrening');//zapiszTreningKlienta?
                    fd.append('nazwa', result);
                    fd.append('id', '0');
                    fd.append('id_cwiklacza', $scope.idKlienta);
                    
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
                            $scope.loaderDanych = false;
                            $window.location = "#!/"+$rootScope.lang+"/training/"+response.data.idTreningu;
                        }
                    }, function myError(response) {
                        alert("Error: "+response.StatusText);
                        $scope.loaderDanych = false;
                    });
                    
                    //console.log(result);
                }, function () {
                    //console.log('skancelowaues');
                });
    }
    
    $scope.usunTrening = function (ev,id,nazwa) {
        
        $scope.loaderDanych = true;
        
        var confirm = $mdDialog.confirm()
            .title($rootScope.lang==='pl' ? 'Usuwanie planu treningowego' : 'Removing a trainig plan')
            .textContent($rootScope.lang==='pl' ? 'Czy na pewno chcesz usunąć cały program '+nazwa+' ze wszystkimi sesjami i ćwiczeniami?' : 'Are you sure you want to completely remove the whole '+nazwa+' with all its sessions and exercises?')
            .ariaLabel('...')
            .theme($rootScope.temat)
            .targetEvent(ev)
            .ok($rootScope.lang==='pl' ? 'Tak' : 'Yes')
            .cancel($rootScope.lang==='pl' ? 'Nie': 'No');

        $mdDialog.show(confirm).then(function (result) {
                    
            var fd = new FormData();
            fd.append('akcja', 'usunTrening');
            fd.append('id', id);

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
                    $scope.loaderDanych = false;
                    $scope.pobierzListe();
                }
            }, function myError(response) {
                alert("Error: "+response.StatusText);
                $scope.loaderDanych = false;
            });
                    
            //console.log(result);
        }, function () {
            //console.log('skancelowaues');
            $scope.loaderDanych = false;
        });
    }
});
