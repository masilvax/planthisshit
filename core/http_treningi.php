<?php
require_once '../daos/db_treningi.php';
require_once 'session.php';
class HttpRequest{
    private $db = null;
    private $sessionHandlerr = null;
   
    public function __construct(){
        $this->db = new DBTreningi();
        $this->sessionHandlerr = new SessionHandlerr();
        if(!$this->sessionHandlerr->checkWhosLoggedIn()){
            die("session timed out");
        }
    }

    public function mojeTreningi(){

        $dane = array(
            'treningi'=>$this->db->getTreningiByIdCwiklacza($_SESSION['user']['id']),
            'odp'=>'OK'
        );

        if($dane){
            print json_encode($dane);
        }else{
            die();
        }
    }
    
    public function klientaTreningi(){

        if(!isset($_REQUEST['id_cwiklacza'])){
            die('no client id!');
        }
    
        $dane = array(
            'treningi'=>$this->db->getTreningiByIdCwiklaczaIdTrenera($_REQUEST['id_cwiklacza'],$_SESSION['user']['id']),
            'cwiklacz'=>$this->db->getLoginCwiklaczaById($_REQUEST['id_cwiklacza']),
            'odp'=>'OK'
        );

        if($dane){
            print json_encode($dane);
        }else{
            die();
        }
    }
    
    public function wyswietlTrening(){
        if(!isset($_REQUEST['id'])){
            die('no training id!');
        }
        if(!isset($_REQUEST['data']) || $_REQUEST['data']==""){//data potrzebna do kalendarza, zeby nie wyswietlal wszystkiego a tylko kilka miesiecy
            $data = date('Y-m-d');
        }else{
            $data = $_REQUEST['data'];
        }
        
        if($_REQUEST['id']=='0'){
            $trening = array('id'=>0,'nazwa'=>'','edycja'=>0,'publiczny'=>0,'aktywny'=>1);
        }else{
            $trening = $this->db->getTreningById($_REQUEST['id']);
        }
        
        if($_REQUEST['id']!='0' && $trening['id_trenera']!=$_SESSION['user']['id'] && $trening['id_cwiklacza']!=$_SESSION['user']['id'])
            die('You do not have permission for this training');
            
        $trening['cwiklacz'] = $this->db->getLoginCwiklaczaById($trening['id_cwiklacza']);
        $trening['trener'] = $this->db->getLoginCwiklaczaById($trening['id_trenera']);

        $trening['sesje'] = $this->db->getSesjeTreningu($trening['id'],$data);//bedzie false jak nowy trening
        
        $arr = array(
            'odp' => 'OK',
            'trening' => $trening
        );
        print json_encode($arr);
    }

    public function zapiszTrening(){
    
        if(!isset($_REQUEST['lang']) || $_REQUEST['lang']=="")
            $lang='en';
        else
            $lang = $_REQUEST['lang'];
       
        if(!isset($_REQUEST['id']) || $_REQUEST['id']=="")
            die('no training id!');
            
        if($_REQUEST['id']!="0"){
            $trening = $this->db->getTreningById($_REQUEST['id']);
            if($trening['id_trenera']!=$_SESSION['user']['id'] && $trening['id_cwiklacza']!=$_SESSION['user']['id'])
                die('You do not have permission for this training');
        }
        
        if(!isset($_REQUEST['nazwa']) || $_REQUEST['nazwa']=="")
            die(($lang == 'pl') ? 'Podaj nazwę planu treningowego.' : 'Type training plan name.');
        
        // odtąd
        if(!isset($_REQUEST['edycja']) || $_REQUEST['edycja']=="")
            $edycja='0';
        else
            $edycja = $_REQUEST['edycja'];
        
        if(!isset($_REQUEST['publiczny']) || $_REQUEST['publiczny']=="")
            $publiczny='0';
        else
            $publiczny = $_REQUEST['publiczny'];
            
        if(!isset($_REQUEST['aktywny']) || $_REQUEST['aktywny']=="")
            $aktywny='1';
        else
            $aktywny = $_REQUEST['aktywny'];
        // dotąd - tego nie używam póki co, ale niech se tu bedzie
        
        if($_REQUEST['id']=='0'){ // DODAWANIE NOWEGO
            if($_SESSION['user']['typ']=='0')//jak zwykly cwiklacz to moze tylko sobie i w jsie dla cwiklaczy nie ma id_cwiklacza
                
                $idCwiklacza = $_SESSION['user']['id'];
            
            else{ // jak trener to nie tylko sobie i w trenerowym jsie jest id_cwiklacza
            
                if(!isset($_REQUEST['id_cwiklacza']) || $_REQUEST['id_cwiklacza']=="")
                    die('no athlete id!');
                    
                if($_REQUEST['id_cwiklacza'] == 'treningWlasnyTrenera'){
                    $idCwiklacza = $_SESSION['user']['id'];
                }else{
                    $idCwiklacza = $_REQUEST['id_cwiklacza'];//$idCwiklacza = $_SESSION['user']['id'];
                }
            }
            $arr = array(
                'id'=>'0',
                'nazwa'=>$_REQUEST['nazwa'],
                'id_trenera'=>$_SESSION['user']['id'],
                'id_cwiklacza'=>$idCwiklacza,
                'edycja'=>$edycja,
                'publiczny'=>$publiczny,
                'aktywny'=>$aktywny
            );
            $this->db->saveOrUpdateTrening($arr);
        }else{
            $arr = array(
                'id'=>$_REQUEST['id'],
                'nazwa'=>$_REQUEST['nazwa'],
                'edycja'=>$edycja,
                'publiczny'=>$publiczny,
                'aktywny'=>$aktywny
            );
            $this->db->saveOrUpdateTrening($arr);
        }

        if($_REQUEST['id']=='0'){
            $id = $this->db->getLastInsertId();
        }else{
            $id = $_REQUEST['id'];
        }
        
        print json_encode(array('odp'=>'OK','idTreningu'=>$id));
        die();
    }
    
    public function kopiujSesje(){
        if(!isset($_REQUEST['idki']) || $_REQUEST['idki']=="")
            die('no training session array!');
            
        $idki = json_decode($_REQUEST['idki']);
        //var_dump($idki);
        foreach($idki as $id){
            try{//try tutaj, zeby wylapywal go tutaj a nie pozniej i zeby nie wylazil z funkcji, tylko zeby dokonczyl petle
                $trening = $this->db->getTreningByIdSesji($id);
                if($trening && $trening['id_trenera']!=$_SESSION['user']['id'] && $trening['id_cwiklacza']!=$_SESSION['user']['id'])
                    die('You do not have permission for this training');
                
                $this->db->kopiujSesje($id);
            }catch(Exception $e){
                if( strpos( $e->getMessage(), '1062 Duplicate entry') ){
                    //nic nie rob
                }else
                    echo "ERROR: ".$e->getMessage();
                //SQLSTATE[23000]: Integrity constraint violation: 1062 Duplicate entry '2020-12-31 14:26:08-6' for key 'jeden'
            }
        }
        $arr = array(
            'odp' => 'OK'
        );
        print json_encode($arr);
    }

    public function przesunSesjeDoPrzodu(){
        if(!isset($_REQUEST['idki']) || $_REQUEST['idki']=="")
            die('no training session array!');
            
        $idki = json_decode($_REQUEST['idki']);
        //var_dump($idki);
        foreach($idki as $id){
            try{
                $trening = $this->db->getTreningByIdSesji($id);
                if($trening && $trening['id_trenera']!=$_SESSION['user']['id'] && $trening['id_cwiklacza']!=$_SESSION['user']['id'])
                    die('You do not have permission for this training');
            
                $this->db->przesunSesjeDoPrzodu($id);
            }catch(Exception $e){
                if( strpos( $e->getMessage(), '1062 Duplicate entry') ){
                    //nic nie rob
                }else
                    echo "ERROR: ".$e->getMessage();
                //SQLSTATE[23000]: Integrity constraint violation: 1062 Duplicate entry '2020-12-31 14:26:08-6' for key 'jeden'
            }
        }
        $arr = array(
            'odp' => 'OK'
        );
        print json_encode($arr);
    }
    
    public function przesunSesjeDoTylu(){
        if(!isset($_REQUEST['idki']) || $_REQUEST['idki']=="")
            die('no training session array!');
            
        $idki = json_decode($_REQUEST['idki']);
        //var_dump($idki);
        foreach(array_reverse($idki) as $id){//odwracamy, zeby nie wywalal ze duplikat gdy daty beda obok siebie i przesunie np czwartek na srode, a sroda jeszcze nie bedzie przesunieta na wtorek 
            try{
                $trening = $this->db->getTreningByIdSesji($id);
                if($trening && $trening['id_trenera']!=$_SESSION['user']['id'] && $trening['id_cwiklacza']!=$_SESSION['user']['id'])
                    die('You do not have permission for this training');
            
                $this->db->przesunSesjeDoTylu($id);
            }catch(Exception $e){
                if( strpos( $e->getMessage(), '1062 Duplicate entry') ){
                    //nic nie rob
                }else
                    echo "ERROR: ".$e->getMessage();
                //SQLSTATE[23000]: Integrity constraint violation: 1062 Duplicate entry '2020-12-31 14:26:08-6' for key 'jeden'
            }
        }
        $arr = array(
            'odp' => 'OK'
        );
        print json_encode($arr);
    }
    
    public function usunSesje(){
        if(!isset($_REQUEST['idki']) || $_REQUEST['idki']=="")
            die('no training session array!');
            
        $idki = json_decode($_REQUEST['idki']);
        //var_dump($idki);
        foreach($idki as $id){
            try{
                $trening = $this->db->getTreningByIdSesji($id);
                if($trening && $trening['id_trenera']!=$_SESSION['user']['id'] && $trening['id_cwiklacza']!=$_SESSION['user']['id'])
                    die('You do not have permission for this training');
            
                $this->db->usunSesje($id);
            }catch(Exception $e){
                echo "ERROR: ".$e->getMessage();
            }
        }
        $arr = array(
            'odp' => 'OK'
        );
        print json_encode($arr);
    }
    
    public function usunTrening () {// widok mojeTreningi i klientaTreningi
        if(!isset($_REQUEST['id']))
            die('no training id!');

        $trening = $this->db->getTreningById($_REQUEST['id']);
        if($trening['id_trenera']!=$_SESSION['user']['id'] && $trening['id_cwiklacza']!=$_SESSION['user']['id'])
            die('You do not have permission for this training');
        
        $this->db->usunTrening($_REQUEST['id']);
        
        $arr = array(
            'odp' => 'OK'
        );
        print json_encode($arr);
    }
    
}

try{
    if(isset($_REQUEST['akcja'])){
        
        $httpRequest = new HttpRequest();
        
        switch($_REQUEST['akcja']){
                
            case 'mojeTreningi':
                $httpRequest->mojeTreningi();
                break;
                
            case 'klientaTreningi':
                $httpRequest->klientaTreningi();
                break;

            case 'zapiszTrening':
                $httpRequest->zapiszTrening();
                break;
                
            case 'wyswietlTrening':
                $httpRequest->wyswietlTrening();
                break;
                
            case 'kopiujSesje':
                $httpRequest->kopiujSesje();
                break;
                
            case 'przesunSesjeDoTylu':
                $httpRequest->przesunSesjeDoTylu();
                break;
                
            case 'przesunSesjeDoPrzodu':
                $httpRequest->przesunSesjeDoPrzodu();
                break;
                
            case 'usunSesje':
                $httpRequest->usunSesje();
                break;
                
            case 'usunTrening':
                $httpRequest->usunTrening();
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
