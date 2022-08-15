<?php
require_once '../daos/db_moje_konto.php';
require_once 'session.php';
class HttpRequest{
    private $db = null;
    private $sessionHandlerr = null;
   
    public function __construct(){
        $this->db = new DBMojeKonto();
        $this->sessionHandlerr = new SessionHandlerr();
        if(!$this->sessionHandlerr->checkWhosLoggedIn()){
            die("session timed out");
        }
    }

    public function mojeKonto(){

        $dane = array(
            'uzytkownik'=>$this->db->getUzytkownikById($_SESSION['user']['id']),//
            'odp'=>'OK'
        );

        if($dane){
            print json_encode($dane);
        }else{
            die();
        }
    }

    public function zapiszUzytkownika(){//TUDU: POLSKI
    
        if(!isset($_REQUEST['lang']) || $_REQUEST['lang']=="")
            $lang='en';
        else
            $lang = $_REQUEST['lang'];
       
        if(!isset($_REQUEST['id']) || $_REQUEST['id']=="")
            die(($lang == 'pl') ? 'Brak ID użytkownika.' : 'No user ID.');
        if(!isset($_REQUEST['login']) || $_REQUEST['login']=="")
            die(($lang == 'pl') ? 'Brak loginu użytkownika.' : 'No user login.');
        if(!isset($_REQUEST['lang']) || $_REQUEST['lang']=="")
            die(($lang == 'pl') ? 'Wybierz język.' : 'No language selected.');
        if(!isset($_REQUEST['typ']) || $_REQUEST['typ']=="")
            die(($lang == 'pl') ? 'Wybierz typ użytkownika.' : 'No user type selected.');
        if(!isset($_REQUEST['email']) || $_REQUEST['email']=="")
            $email='';
        else
            $email = $_REQUEST['email'];
            
        if(!isset($_REQUEST['temat']) || $_REQUEST['temat']!="default")
            $temat='ciemny';
        else
            $temat = 'default';//$_REQUEST['temat'];//zeby nie kombinowali
            
       
        $arr = array(
            'id'=>$_SESSION['user']['id'],//zeby nie wpisywali w riklesta cudzego id
            'login'=>$_REQUEST['login'],
            'lang'=>$_REQUEST['lang'],
            'typ'=>$_REQUEST['typ'],
            'email'=>$email,
            'temat'=>$temat
        );
        $this->db->saveOrUpdateUzytkownik($arr);
        $_SESSION['user'] = $this->db->getUzytkownikById($_SESSION['user']['id']);
        print json_encode(array('odp'=>'OK','uzytkownik'=>$_SESSION['user']));
        die();
       
    }
    
    public function zmienHaslo(){//TUDU: POLSKI
    
        if(!isset($_REQUEST['lang']) || $_REQUEST['lang']=="")
            $lang='en';
        else
            $lang = $_REQUEST['lang'];
    
        if(!isset($_REQUEST['zmiana_hasla_stare']) || $_REQUEST['zmiana_hasla_stare']=="")
            die(($lang == 'pl') ? 'Podaj stare hasło.' : 'Type old password.');
        if(!isset($_REQUEST['zmiana_hasla_nowe']) || $_REQUEST['zmiana_hasla_nowe']=="")
            die(($lang == 'pl') ? 'Podaj nowe hasło.' : 'Type new password.');
        if(!isset($_REQUEST['zmiana_hasla_nowe_potw']) || $_REQUEST['zmiana_hasla_nowe_potw']=="")
            die(($lang == 'pl') ? 'Potwierdź nowe hasło.' : 'Confirm new password.');
            
        if(strlen($_REQUEST['zmiana_hasla_nowe'])<8)
            die( ($lang == 'pl') ? 'Hasło powinno mieć przynajmniej 8 znaków.' : 'Password should have at least 8 characters.');
            
        if($_REQUEST['zmiana_hasla_nowe'] != $_REQUEST['zmiana_hasla_nowe_potw'])
            die(($lang == 'pl') ? 'Hasła się nie zgadzają.' : 'Passwords do not match.');
       
        $user = $this->db->getUzytkownikByLoginHaslo($_SESSION['user']['login'],md5($_REQUEST['zmiana_hasla_stare']));
        if(!$user)
            die(($lang == 'pl') ? 'Błędne hasło.' : 'Wrong password.');
       
        $arr = array(
            'id'=>$_SESSION['user']['id'],
            'haslo'=>md5($_REQUEST['zmiana_hasla_nowe'])
        );
        $this->db->saveOrUpdateUzytkownik($arr);
        print json_encode(array('odp'=>'OK'));
        die();
    }
    
}

try{
    if(isset($_REQUEST['akcja'])){
        
        $httpRequest = new HttpRequest();
        
        switch($_REQUEST['akcja']){
                
            case 'mojeKonto':
                $httpRequest->mojeKonto();
                break;

            case 'zapiszUzytkownika':
                $httpRequest->zapiszUzytkownika();
                break;
                
            case 'zmienHaslo':
                $httpRequest->zmienHaslo();
                break;
            
            default:
               die("Incorrect request pramaters");
        }
    }else{
        die('ajaxem!!!');
    }
}catch(Exception $e){
    die($e->getMessage());
}
?>
