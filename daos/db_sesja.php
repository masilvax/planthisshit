<?php
require_once 'db.php';
class DBSesja{
    private $db = null;

    public function __construct(){
        $this->db = DB::getInstance();
    }

    public function saveOrUpdateSesja($data){
        if($data['id']==="0"){
            //echo 'weszlo do inserta ';
            $data['kto_dod'] = $_SESSION['user']['login'];
            //unset($data['id']);
            $this->db->insert("sesje", $data);
        }else{
            $data['kto_zm'] = $_SESSION['user']['login'];
            $id=$data['id'];
            unset($data['id']);
            $this->db->update("sesje",$id,$data);
        }
    }
    
    public function saveOrUpdateCwiczenie($data){
        if($data['id']==="0"){
            //echo 'weszlo do inserta ';
            $data['kto_dod'] = $_SESSION['user']['login'];
            //unset($data['id']);
            $this->db->insert("cwiczenia", $data);
        }else{
            $data['kto_zm'] = $_SESSION['user']['login'];
            $id=$data['id'];
            unset($data['id']);
            $this->db->update("cwiczenia",$id,$data);
        }
    }
    
    public function getLoginCwiklaczaById($id){
        $this->db->query("select id, login from uzytkownicy where id=?",array($id));
        if($this->db->getRowCount()>0){
            $zwrot = $this->db->getResult();
            return $zwrot[0];
        }
        return false;
    }
    
    public function getSesjaById($id){
        $this->db->query("select * from sesje where id=?",array($id));
        if($this->db->getRowCount()>0){
            $zwrot = $this->db->getResult();
            return $zwrot[0];
        }
        return false;
    }
    
    public function getTreningById($id){// no potrzebne zeby sprawdzic trenera i cwiklacza i publicznosc i czy zalogowany user moze go wyswietlic
        $this->db->query("select * from treningi where id=?",array($id));
        if($this->db->getRowCount()>0){
            $zwrot = $this->db->getResult();
            return $zwrot[0];
        }
        return false;
    }
    
    public function getTreningByIdCwiczenia($id){// no potrzebne zeby sprawdzic trenera i cwiklacza i publicznosc i czy zalogowany user moze go wyswietlic
        $this->db->query("select t.* from treningi t, sesje s, cwiczenia c where c.id=? and c.id_sesji=s.id and s.id_treningu=t.id",array($id));
        if($this->db->getRowCount()>0){
            $zwrot = $this->db->getResult();
            return $zwrot[0];
        }
        return false;
    }
    
    public function getTreningByIdSesji($id){// no potrzebne zeby sprawdzic trenera i cwiklacza i publicznosc i czy zalogowany user moze go wyswietlic
        $this->db->query("select t.* from treningi t, sesje s where s.id=? and s.id_treningu=t.id",array($id));
        if($this->db->getRowCount()>0){
            $zwrot = $this->db->getResult();
            return $zwrot[0];
        }
        return false;
    }
    
    public function getCwiczeniaSesji($id){
        $this->db->query("select *, '' as litera from cwiczenia where id_sesji=? order by kolejnosc",array($id));
        if($this->db->getRowCount()>0){
            $zwrot = $this->db->getResult();
            return $zwrot;
        }
        return false;
    }
    
    public function getCwiczenieById($id){
        $this->db->query("select * from cwiczenia where id=?",array($id));
        if($this->db->getRowCount()>0){
            $zwrot = $this->db->getResult();
            return $zwrot[0];
        }
        return false;
    }
    
    public function getCwiczenieByKolejnosc($idSesji,$kolejnosc){
        $this->db->query("select * from cwiczenia where id_sesji=? and kolejnosc=?",array($idSesji,$kolejnosc));
        if($this->db->getRowCount()>0){
            $zwrot = $this->db->getResult();
            return $zwrot[0];
        }
        return false;
    }
    
    public function getMaxKolejnosc($idSesji){
        $this->db->query("select max(kolejnosc) as maks from cwiczenia where id_sesji=?",array($idSesji));
        if($this->db->getRowCount()>0){
            $zwrot = $this->db->getResult();
            return $zwrot[0]['maks'];
        }
        return false;
    }
    
    public function usunCwiczenie($id){
        $this->db->query("delete from cwiczenia where id = ?",array($id));
    }
    
    public function getLastInsertId(){//bo potrzebne w core'ach
        return $this->db->getLastInsertId();
    }
    
}
?>
