<?php
require_once '../daos/db_moi_trenerzy.php';
require_once 'session.php';
class HttpRequest{
    private $db = null;
    private $sessionHandlerr = null;
   
    public function __construct(){
        $this->db = new DBMoiTrenerzy();
        $this->sessionHandlerr = new SessionHandlerr();
        if(!$this->sessionHandlerr->checkWhosLoggedIn()){
            die("session timed out");
        }
    }

    public function moiTrenerzy(){

        $dane = array(
            'trenerzy'=>$this->db->getMoiTrenerzy($_SESSION['user']['id']),
            'potencjalniTrenerzy'=>$this->db->getMoiPotencjalniTrenerzy($_SESSION['user']['id']),
            'odp'=>'OK'
        );

        if($dane){
            print json_encode($dane);
        }else{
            die();
        }
    }
    
    public function szukajTrenerow(){
    
        if(!isset($_REQUEST['lang']) || $_REQUEST['lang']=="")
            $lang='en';
        else
            $lang = $_REQUEST['lang'];
        
        if(!isset($_REQUEST['szukaj']) || strlen($_REQUEST['szukaj'])<3){
            die(($lang == 'pl') ? 'Wpisz minimum 3 znaki.' : 'Type at least 3 characters.');
        }
            
        $trenerzy = $this->db->getZnalezieniTrenerzy($_REQUEST['szukaj']);
            
        $zwrot = array('odp'=>"OK",'trenerzy'=>$trenerzy);

        print json_encode($zwrot);
        die();
    }
    
    public function zaprosTrenera(){
        if(!isset($_REQUEST['id'])){
            die('no Trainer id!');
        }

        $ct = $this->db->getCwiklaczTrenerByIdTreneraIdCwiklacza($_REQUEST['id'],$_SESSION['user']['id']);
        if($ct){
            $idCt = $ct['id'];
        }else{
            $idCt = '0';
        }
        
        $arr = array(
            'id'=>$idCt,
            'zapro'=>1,
            //'akcept'=>0,//bo jak juz jest trenerem danego cwiklacza to nic to nie zmieni i nie zmienione ma byc
            'id_trenera'=>$_REQUEST['id'],
            'id_cwiklacza'=>$_SESSION['user']['id']
        );
        $this->db->saveOrUpdateCwiklaczTrener($arr);
        
        $arr = array(
            'odp' => 'OK'
        );
        print json_encode($arr);
    }
    
    public function odrzucTrenera(){
        if(!isset($_REQUEST['id'])){
            die('no CT id!');
        }

        $ct = $this->db->getCwiklaczTrenerById($_REQUEST['id']);
        if($ct['id_cwiklacza']!=$_SESSION['user']['id'])
            die('You do not have permission for this operation');
        
        $arr = array(
            'id'=>$_REQUEST['id'],
            'zapro'=>0
        );
        $this->db->saveOrUpdateCwiklaczTrener($arr);
        
        $arr = array(
            'odp' => 'OK'
        );
        print json_encode($arr);
    }
    
    /*public function usunKlienta(){
        if(!isset($_REQUEST['id'])){
            die('no CT id!');
        }

        $ct = $this->db->getCwiklaczTrenerById($_REQUEST['id']);
        if($ct['id_trenera']!=$_SESSION['user']['id'])
            die('You do not have permission for this operation');
        
        $arr = array(
            'id'=>$_REQUEST['id'],
            'akcept'=>0,
            'zapro'=>0
        );
        $this->db->saveOrUpdateCwiklaczTrener($arr);
        
        $arr = array(
            'odp' => 'OK'
        );
        print json_encode($arr);
    }*/
    
}

try{
    if(isset($_REQUEST['akcja'])){
        
        $httpRequest = new HttpRequest();
        
        switch($_REQUEST['akcja']){
                
            case 'moiTrenerzy':
                $httpRequest->moiTrenerzy();
                break;
                
            case 'szukajTrenerow':
                $httpRequest->szukajTrenerow();
                break;
                
            case 'zaprosTrenera':
                $httpRequest->zaprosTrenera();
                break;

            case 'odrzucTrenera':
                $httpRequest->odrzucTrenera();
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
