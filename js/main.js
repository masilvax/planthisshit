// Script.js

var app = angular.module('trenuj', ['ngRoute', 'ngAnimate','ngMaterial','multipleDatePicker']);
  /*  .run( ['$rootScope', function( $rootScope )  {
    }]
);*/
app.config(['$routeProvider', '$interpolateProvider', '$mdThemingProvider', '$mdIconProvider', '$mdGestureProvider','$mdDateLocaleProvider', function ($routeProvider, $interpolateProvider, $mdThemingProvider, $mdIconProvider,$mdGestureProvider,$mdDateLocaleProvider) {
    
    $mdDateLocaleProvider.formatDate = function (date){
        return moment(date).format('YYYY-MM-DD');
    };
    
    //to izej to chyba nic nie robi
    /*$mdDateLocaleProvider.parseDate = function (dateString) {
            var m = moment(dateString, 'YYYY-MM-DD', true);
            return m.isValid() ? m.toDate() : new Date(NaN);
    };*/

    // Polnische localization.
    $mdDateLocaleProvider.months = ['styczeń', 'luty', 'marzec', 'kwiecień', 'maj', 'czerwiec', 'lipiec', 'sierpnień', 'wrzesień', 'październik', 'listopad', 'grudzień'];
    $mdDateLocaleProvider.shortMonths = ['sty', 'lut', 'mar', 'kwi', 'maj', 'cze', 'lip', 'sie', 'wrz', 'paź', 'lis', 'gru'];
    $mdDateLocaleProvider.days = ['niedziela', 'poniedziałe', 'wtorek', 'środa', 'czwartek', 'piątek', 'sobota'];
    $mdDateLocaleProvider.shortDays = ['Nd', 'Pn', 'Wt', 'Śr', 'Czw', 'Pt', 'So'];

    // Can change week display to start on Monday.
    $mdDateLocaleProvider.firstDayOfWeek = 1;
    
    $mdGestureProvider.skipClickHijack();//zeby na mobilnych inputy nie zostawały sfocusowane po kliknięciu poza nie

    /*$mdThemingProvider.theme('forest')
      .primaryPalette('purple')
      .accentPalette('teal');*/
      
    $mdThemingProvider.theme('default')
      .primaryPalette('cyan')
      .accentPalette('purple');
      
    $mdThemingProvider.theme('ciemny')
      .primaryPalette('cyan')
      .accentPalette('purple')
      .dark();
      
    $mdThemingProvider.enableBrowserColor({
        theme: 'ciemny', // Default is 'default'
        palette: 'primary', // Default is 'primary', any basic material palette and extended palettes are available
        hue: '500' // Default is '800'
          
    });
     
    $mdIconProvider.defaultIconSet('img/icons/sets/social-icons.svg', 24);//???i tak to robię fontami
    
    $routeProvider
     /*.when("/pl", {//ABSOLUTNIE NIE-E!!! zapętla się i wyjebuje stronę
        templateUrl : "index.html",
        controller : "mainCtrl"
    })*/
     .when("/pl/training/:idTreningu", {
        templateUrl : "templates/pl_trening.htm",
        controller : "treningCtrl"
    })
     .when("/en/training/:idTreningu", {
        templateUrl : "templates/en_trening.htm",
        controller : "treningCtrl"
    })
     .when("/en/myAccount", {
        templateUrl : "templates/en_mojeKonto.htm",
        controller : "mojeKontoCtrl"
    })
     .when("/pl/myAccount", {
        templateUrl : "templates/pl_mojeKonto.htm",
        controller : "mojeKontoCtrl"
    })
     .when("/en/myTrainings", {
        templateUrl : "templates/en_mojeTreningi.htm",
        controller : "mojeTreningiCtrl"
    })
     .when("/pl/myTrainings", {
        templateUrl : "templates/pl_mojeTreningi.htm",
        controller : "mojeTreningiCtrl"
    })
     .when("/en/session/:idSesji", {
        templateUrl : "templates/en_sesja.htm",
        controller : "sesjaCtrl"
    })
     .when("/pl/session/:idSesji", {
        templateUrl : "templates/pl_sesja.htm",
        controller : "sesjaCtrl"
    })

     .when("/en/myClients", {
        templateUrl : "templates/en_moiKlienci.htm",
        controller : "moiKlienciCtrl"
    })
     .when("/pl/myClients", {
        templateUrl : "templates/pl_moiKlienci.htm",
        controller : "moiKlienciCtrl"
    })
     
     .when("/en/clientTrainings/:idKlienta", {
        templateUrl : "templates/en_klientaTreningi.htm",
        controller : "klientaTreningiCtrl"
    })
     .when("/pl/clientTrainings/:idKlienta", {
        templateUrl : "templates/pl_klientaTreningi.htm",
        controller : "klientaTreningiCtrl"
    })
     
     .when("/en/myTrainers", {
        templateUrl : "templates/en_moiTrenerzy.htm",
        controller : "moiTrenerzyCtrl"
    })
     .when("/pl/myTrainers", {
        templateUrl : "templates/pl_moiTrenerzy.htm",
        controller : "moiTrenerzyCtrl"
    })
     
    .when("/en/home", {
        templateUrl : "templates/en_home.htm",
        controller : "mainCtrl"
    })
    .when("/pl/home", {
        templateUrl : "templates/pl_home.htm",
        controller : "mainCtrl"
    })
    /*.when("/cookies", {
        templateUrl : "templates/ciasteczka.htm",
        controller : "ciasteczkaCtrl"
    })
    .when("/terms", {
        templateUrl : "templates/warunki.htm",
        controller : "warunkiCtrl"
    })
    .when("/privacy", {
        templateUrl : "templates/prywatnosc.htm",
        controller : "prywatnoscCtrl"
    })*/
    .otherwise({
        redirectTo: '/en/home'
    });
    
}]);

app.directive('numberMaker', function () {
        return {
            link: function(scope, element, attrs) {
                element.on('keyup', function (e) {
                    e.target.value=e.target.value.replace(/\D/g, '');
                })
            }
        }
});
app.directive('amountMaker', function () {
        return {
            link: function(scope, element, attrs) {
                element.on('keyup', function (e) {
                    e.target.value=e.target.value.replace(/[^0-9\.]/, '');
                    e.target.value=e.target.value.replace("..", '');
                })
            }
        }
});

app.directive('ngFiles',['$parse', function ($parse) {
    function fn_link(scope, element, attrs) {
        var onChange = $parse(attrs.ngFiles);
        element.on('change', function (event) {
            onChange(scope, { $files: event.target.files })
        });
    };
    return { link: fn_link }
} ]);

app.directive("scroll", function ($window) {
    return function(scope, element, attrs) {
        angular.element($window).bind("scroll", function() {
            console.log(this.pageYOffset); 
            if (this.pageYOffset >= 30) {
                 scope.menuShowSwitch = true;
                 //console.log('Scrolled below header.');
             } else {
                 scope.menuShowSwitch = false;
                 //console.log('Header is in view.');
             }
            scope.$apply();
        });
    };
});

app.controller('ciasteczkaCtrl', function ($scope) {
    let elmnt = document.getElementById('gura');
    elmnt.scrollIntoView({block: 'start'});
});
app.controller('warunkiCtrl', function ($scope) {
    let elmnt = document.getElementById('gura');
    elmnt.scrollIntoView({block: 'start'});
});
app.controller('prywatnoscCtrl', function ($scope) {
    let elmnt = document.getElementById('gura');
    elmnt.scrollIntoView({block: 'start'});
});

app.controller('loginCtrl', function ($scope, $http, $window, $rootScope, $location, $mdDialog) {  
    
    $rootScope.lang = 'en';//wszedzie indziej ma byc taki jak domyslny uzytkownika (przedzalogowaniemmoze se zmienic)
    
    $scope.rejestracja = false;
    $scope.rejestracjaToggle = function () {
        $scope.rejestracja = !$scope.rejestracja;
        //console.log($scope.rejestracja);
    }
    
    $scope.widoczneHasloRejestracja = false;
    $scope.toggleWidoczneHasloRejestracja = function () {
        $scope.widoczneHasloRejestracja = !$scope.widoczneHasloRejestracja;
    }
    
    $scope.widoczneHasloLogowanie = false;
    $scope.toggleWidoczneHasloLogowanie = function () {
        $scope.widoczneHasloLogowanie = !$scope.widoczneHasloLogowanie;
    }
    
    $scope.loader = false;
    
    $scope.zaloguj = function () {
        $scope.loader = true;
        var formDataKlient = {
            'akcja_s' : 'login',
            'login' : $scope.login,
            'haslo' : $scope.haslo,
            'lang' : $rootScope.lang
        };
        var response = $http({
            method: "POST",
            url: 'core/session.php',
            params: formDataKlient,
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function mySucces(response) {
            if (angular.isUndefined(response.data.login)) {
                alert(response.data);
            } else {
                $rootScope.kto = response.data;
                $rootScope.lang = response.data.lang;
                $rootScope.temat = response.data.temat;
                $window.location = "#!"+$rootScope.lang+"/home";//"#!"+$location.path();
            }
            $scope.loader = false;
            
        }, function myError(response) {
             alert("Error during log in: "+response.StatusText);
             $scope.loader = false;
        });
        
    };
    
    $scope.rej_email = '';// bo nie musi go byc i nie jest walidowany w phpie, wiec zeby undefined tam nie wrzucal
    
    $scope.zarejestruj = function () {
        $scope.loader = true;
        
        var fd = new FormData();
        fd.append('akcja_s','zarejestruj');
        fd.append('login',$scope.rej_login);
        fd.append('haslo',$scope.rej_haslo);
        
        if($scope.widoczneHasloRejestracja)
            fd.append('potw_haslo',$scope.rej_haslo);
        else
            fd.append('potw_haslo',$scope.rej_potw_haslo);
        
        fd.append('email',$scope.rej_email);
        fd.append('lang',$rootScope.lang);
        
        var response = $http({
            method: "POST",
            url: 'core/session.php',
            data: fd,
            headers: {'Content-Type': undefined}
        }).then(function mySucces(response) {
            if (angular.isUndefined(response.data.login)) {
                alert(response.data);
            } else {
                $rootScope.kto = response.data;
                $window.location = "#!"+$rootScope.lang+"/myAccount";
            }
            $scope.loader = false;
            
        }, function myError(response) {
             alert("Error during registration: " + response.StatusText);
             $scope.loader = false;
        });
    };
    
    $scope.odzyskajHasloDialog = function (ev) {

        $scope.odzysk_login = '';
        $scope.odzysk_email = '';
        
        $mdDialog.show({
            controller: DialogController,
            templateUrl: 'templates/dialogOdzyskHasla.htm',
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
            
        $scope.odzyskajHaslo = function (ev) {
            $scope.loaderDanychDialog = true;

            var fd = new FormData();
            fd.append('akcja_s','odzyskajHaslo');
            fd.append('login',$scope.odzysk_login);
            fd.append('email',$scope.odzysk_email);
            fd.append('lang',$rootScope.lang);
            
            var response = $http({
                method: "POST",
                url: 'core/session.php',
                data: fd,
                headers: {'Content-Type': undefined}
            }).then(function mySucces(response) {
                if(response.data.odp!=='OK') {
                    alert(response.data);
                } else {
                    $mdDialog.hide();
                    
                    $mdDialog.show(
                    $mdDialog.alert()
                        .clickOutsideToClose(true)
                        .title($rootScope.lang==='pl' ? "Sprawdź e-mail" : "Check your e-mail.")
                        .textContent($rootScope.lang==='pl' ? "Na podany adres wysłano e-mail z wygenerowanym nowym hasłem. Po zalogowaniu prosimy o zmianę hasła w sekcji 'Moje konto'." : "Message containing new generated password has been sent to given e-mail address. Please change your password in 'My Account' section after you log in.")
                        .ariaLabel('alert')
                        .ok($rootScope.lang==='pl' ? 'zamknij' : 'close')
                        .targetEvent(ev)
                    );
                    $scope.loaderDanychDialog = true;
                }
                $scope.loaderDanychDialog = false;
                
            }, function myError(response) {
                alert("Error during registration: " + response.StatusText);
                $scope.loaderDanychDialog = false;
            });
        };
        
        $scope.cancel = function() {
            $mdDialog.cancel();
        };
        
        $scope.hide = function() {
            $mdDialog.hide();
        };

    };

});

    
app.controller('mainCtrl', function ($scope, $http, $window, $mdSidenav, $rootScope, $mdToast, $mdTheming, $location, $mdMedia, $interval) {  

    $rootScope.langZmiana = function (lang) {
        $rootScope.lang = lang;
    }
    
    if (angular.isUndefined($rootScope.temat)) {
        $rootScope.temat='ciemny';//deafult i ciemny
    }
    $rootScope.zmienTemat = function (str) {
        $rootScope.temat=str;
    };
    
    $scope.ekranGtSm = $mdMedia('gt-sm');
    $scope.aktualnyUrl = $location.path();
    
    /*$scope.toggleRight = buildToggler('right');*/
    $rootScope.pokaMenuTelefonowe = false;
    $scope.toggleRight = function () {
        //console.log('przed: '+$rootScope.pokaMenuTelefonowe);
        $rootScope.pokaMenuTelefonowe = !$rootScope.pokaMenuTelefonowe;
        //console.log('poooo: '+$rootScope.pokaMenuTelefonowe);
    }
    
    $scope.toggleLeft = buildToggler('left');

    function buildToggler(componentId) {
      return function() {
        $mdSidenav(componentId).toggle();
      };
    }
    
    $scope.closeRight = function () {
        $mdSidenav('right').close();
    }
    
    $scope.przejdzDo = function(url){
        //$mdSidenav('right').close();
        $rootScope.pokaMenuTelefonowe = false;
        $window.location = "#!"+url;
    }
    $scope.przejdzDoNormalnie = function(url){
        $window.location = "#!"+url;
    }
    $scope.przejdzDoNajnormalniej = function(url){
        $window.location = url;
    }
 //to w run jest i wtedy działa, ale tu tez musi byc bo po przelogowaniu nie widac w menu
    if($rootScope.kto && $rootScope.kto.typ == 1){
        $rootScope.linki = [
            {'nazwa_pl':'Moje konto', 'nazwa_en':'My Account','link':'myAccount','ikona':'face'},
            {'nazwa_pl':'Moje plany treningowe', 'nazwa_en':'My Training Plans','link':'myTrainings','ikona':'fitness_center'},
            {'nazwa_pl':'Moi trenerzy', 'nazwa_en':'My Trainers','link':'myTrainers','ikona':'supervisor_account'},
            {'nazwa_pl':'Moi klienci', 'nazwa_en':'My Clients','link':'myClients','ikona':'groups'}
        ];
    }else{
        $rootScope.linki = [
            {'nazwa_pl':'Moje konto', 'nazwa_en':'My Account','link':'myAccount','ikona':'face'},
            {'nazwa_pl':'Moje plany treningowe', 'nazwa_en':'My Training Plans','link':'myTrainings','ikona':'fitness_center'},
            {'nazwa_pl':'Moi trenerzy', 'nazwa_en':'My Trainers','link':'myTrainers','ikona':'supervisor_account'}
        ];
    }
    
    $scope.$watch(function() { return $mdMedia('gt-sm'); }, function(big) {
        $scope.ekranGtSm = big;
    });
    //$scope.aktualnyUrl = $location.path();
    $scope.$watch(function() { return $location.path(); }, function(url) {
        $scope.aktualnyUrl = url;
    });
    
    $scope.wyloguj = function () {

        var formDataKlient = {
            'akcja_s' : 'logout'
        };
        var response = $http({
            method: "POST",
            url: 'core/session.php',
            params: formDataKlient,
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function mySuccess(response) {
    	    if(response.data==="OK") {
    		location.reload();
    	    } else {
    		alert(response.data);
    	    }
        }, function myError(response){
    	    alert("Error during log out : "+response.statusText);
        });

    };
    
    $scope.wyslijEmail = function(){
        
        $scope.kontakt.loader=true;
        var formDataKlient = {
            'email' : $scope.kontakt.email,
            'tresc' : $scope.kontakt.question
        };
        //alert(formDataKlient.email + formDataKlient.tresc);
        var response = $http({
            method: "POST",
            url: 'core/msg.php',
            params: formDataKlient,
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function mySuccess(response) {
    	    if(response.data==="OK") {
                $mdToast.show(
                    $mdToast.simple()
                        .textContent('Thank you for your message. I will reply as soon as I read it.')
                        .position('bottom right')
                        .hideDelay(10000)
                );
    	    } else {
    		alert(response.data);
    	    }
            $scope.kontakt.loader=false;
        }, function myError(response){
    	    alert("Error sending message: "+response.statusText);
            $scope.kontakt.loader=false;
        });
    }

    $scope.potwierdzCiasto = function(){//ajax tylko, żeby na przyszłość zapisał do sesji,bo wystarczy,że kliknie i zmienna sie ustawi na true
        var formDataKlient = {
            'akcja_s' : 'potwierdzCiasto'
        };
        var response = $http({
            method: "POST",
            url: 'core/session.php',
            params: formDataKlient,
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function mySuccess(response) {
    	    if(response.data!=="OK") {
                $mdToast.show(
                    $mdToast.simple()
                        .textContent("Something went wrong while accepting cookies, but do not worry. It's not a big deal :)")
                        .position('bottom right')
                        .hideDelay(10000)
                );
    	    }

        }, function myError(response){
    	    alert("Error accepting cookies: "+response.statusText);
        });
        $rootScope.potwierdzoneCiasto = true;
    }
    
    $rootScope.ilePotencjalnychKlientow = '0';
    
    $rootScope.ilePotenjalnych = function () {
        //console.log('wejszłem');
        if($rootScope.kto && $rootScope.kto.typ == 1){

            var fd = new FormData();
            fd.append('akcja','ilePotenjalnych');

            var response = $http({
                method: "POST",
                url: 'core/http_moi_klienci.php',
                data: fd,
                headers: {'Content-Type': undefined}
            }).then(function mySuccess(response) {
                if (response.data === "session timed out") {
                    //$window.location = "#!login";
                    $rootScope.kto = false;
                }else{
                    if(response.data.odp!=='OK') {
                        alert(response.data);
                    }else{
                        $rootScope.ilePotencjalnychKlientow = response.data.ile;
                    }
                }
            }, function myError(response) {//na telefonach jak jest blokada ekranu to nie dosc, ze wchodzi tutaj, to jeszcze statusText sie robi undefined, wiec chyba wystarczy olać
                if(response.StatusText!=='undefined' && typeof response.StatusText!==undefined && typeof response.StatusText!=='undefined'){
                    alert("Error: "+response.StatusText);
                }
                
            });
        }
    };
    $rootScope.ilePotenjalnych();       
    
    if (angular.isDefined($rootScope.timerIlePotencjalnych)) {
        $interval.cancel($rootScope.timerIlePotencjalnych);
    }    

    $rootScope.timerIlePotencjalnych = $interval($rootScope.ilePotenjalnych,60000);//300000 - 5 minut?

});

app.controller('toastCtrl', function($scope,$mdToast) {
    $scope.closeToast = function() {
        $mdToast.hide();
    }
});


app.run(function($rootScope, $window, $http) {

    //tu sprawdzanie sesji, poza rootscope.on, bo by w nieskonczonosc window.location robil
    $rootScope.kto = false;
    var formDataKlient = { 
        'akcja_s' : 'check'
    };
    var response = $http({
        method: "POST",
        url: 'core/session.php',
        params: formDataKlient,
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    }).then(function mySuccess(response) {

        if (response.data==="NIE") {
            $window.location = "#!login";
                
        } else {
            $rootScope.kto = response.data;
            $rootScope.lang = response.data.lang;
            $rootScope.temat = response.data.temat;
            moment.locale($rootScope.lang);
            //$rootScope.potwierdzoneCiasto = response.data.potwierdzoneCiasto;
            
            if($rootScope.kto && $rootScope.kto.typ == 1){
                $rootScope.linki = [
                    {'nazwa_pl':'Moje konto', 'nazwa_en':'My Account','link':'myAccount','ikona':'face'},
                    {'nazwa_pl':'Moje plany treningowe', 'nazwa_en':'My Training Plans','link':'myTrainings','ikona':'fitness_center'},
                    {'nazwa_pl':'Moi trenerzy', 'nazwa_en':'My Trainers','link':'myTrainers','ikona':'supervisor_account'},
                    {'nazwa_pl':'Moi klienci', 'nazwa_en':'My Clients','link':'myClients','ikona':'groups'}
                ];
            }else{
                $rootScope.linki = [
                    {'nazwa_pl':'Moje konto', 'nazwa_en':'My Account','link':'myAccount','ikona':'face'},
                    {'nazwa_pl':'Moje plany treningowe', 'nazwa_en':'My Training Plans','link':'myTrainings','ikona':'fitness_center'},
                    {'nazwa_pl':'Moi trenerzy', 'nazwa_en':'My Trainers','link':'myTrainers','ikona':'supervisor_account'}
                ];
            }

            $rootScope.ilePotenjalnych();
                
        }
                
    }, function myError(response) {
        alert("Error checking who's logged in: "+response.statusText + ". It sometimes happens when you start the browser and there's BlendWax on one of the other cards. Just hit 'OK' and it should be OK");
    });
    
    $rootScope.stateIsLoading = false;
    
    $rootScope.$on('$routeChangeStart',function(){
        $rootScope.stateIsLoading = true;
    });
    $rootScope.$on('$routeChangeSuccess',function(){
        $rootScope.stateIsLoading = false;
    });
    $rootScope.$on('$routeChangeError', function() {
        //catch error
    });
    
    
});
