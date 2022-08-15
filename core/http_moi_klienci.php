<?php
require_once '../daos/db_moi_klienci.php';
require_once 'session.php';
class HttpRequest{
    private $db = null;
    private $sessionHandlerr = null;
   
    public function __construct(){
        $this->db = new DBMoiKlienci();
        $this->sessionHandlerr = new SessionHandlerr();
        if(!$this->sessionHandlerr->checkWhosLoggedIn()){
            die("session timed out");
        }
    }

    public function moiKlienci(){

        $dane = array(
            'klienci'=>$this->db->getMoiKlienci($_SESSION['user']['id']),
            'potencjalniKlienci'=>$this->db->getMoiPotencjalniKlienci($_SESSION['user']['id']),
            'odp'=>'OK'
        );

        if($dane){
            print json_encode($dane);
        }else{
            die();
        }
    }
    
    public function akceptujKlienta(){
        if(!isset($_REQUEST['id'])){
            die('no CT id!');
        }

        $ct = $this->db->getCwiklaczTrenerById($_REQUEST['id']);
        if($ct['id_trenera']!=$_SESSION['user']['id'])
            die('You do not have permission for this operation');
        
        $arr = array(
            'id'=>$_REQUEST['id'],
            'akcept'=>1
        );
        $this->db->saveOrUpdateCwiklaczTrener($arr);
        
        $arr = array(
            'odp' => 'OK'
        );
        print json_encode($arr);
    }
    
    public function odrzucKlienta(){
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
    
    public function ilePotenjalnych(){

        $dane = array(
            'ile'=>$this->db->ilePotenjalnych($_SESSION['user']['id']),
            'odp'=>'OK'
        );

        if($dane){
            print json_encode($dane);
        }else{
            die();
        }
    }
    
}

try{
    if(isset($_REQUEST['akcja'])){
        
        $httpRequest = new HttpRequest();
        
        switch($_REQUEST['akcja']){
                
            case 'moiKlienci':
                $httpRequest->moiKlienci();
                break;
                
            case 'odrzucKlienta':
                $httpRequest->odrzucKlienta();
                break;
                
            case 'akceptujKlienta':
                $httpRequest->akceptujKlienta();
                break;
                
            case 'ilePotenjalnych':
                $httpRequest->ilePotenjalnych();
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
