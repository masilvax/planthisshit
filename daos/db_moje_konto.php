<?php
require_once 'db.php';
class DBMojeKonto{
    private $db = null;

    public function __construct(){
        $this->db = DB::getInstance();
    }

    public function saveOrUpdateUzytkownik($data){
        if($data['id']==="0"){
            //echo 'weszlo do inserta ';
            //$data['kto_dod'] = $_SESSION['user']['login'];
            $data['data_dod'] = date("Y-m-d H:i:s");
            //unset($data['id']);
            $this->db->insert("uzytkownicy", $data);
        }else{
            //$data['kto_zm'] = $_SESSION['user']['login'];
            $data['data_zm'] = date("Y-m-d H:i:s");
            $id=$data['id'];
            unset($data['id']);
            $this->db->update("uzytkownicy",$id,$data);
        }
    }
    
    public function getUzytkownikByEmail($id){
        $this->db->query("select * from uzytkownicy where email=?",array($id));
        if($this->db->getRowCount()>0){
            $zwrot = $this->db->getResult();
            return $zwrot[0];
        }
        return false;
    }
    
    public function getUzytkownikById($id){
        $this->db->query("select * from uzytkownicy where id=?",array($id));
        if($this->db->getRowCount()>0){
            $zwrot = $this->db->getResult();
            return $zwrot[0];
        }
        return false;
    }
    
    public function getUzytkownikByLoginHaslo($login,$haslo){
        $this->db->query("select * from uzytkownicy where login=? and haslo=?",array($login,$haslo));
        if($this->db->getRowCount()>0){
            $zwrot = $this->db->getResult();
            return $zwrot[0];
        }
        return false;
    }
    
}
?>
