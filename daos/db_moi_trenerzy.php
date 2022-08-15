<?php
require_once 'db.php';
class DBMoiTrenerzy{
    private $db = null;

    public function __construct(){
        $this->db = DB::getInstance();
    }

    public function saveOrUpdateCwiklaczTrener($data){
        if($data['id']==="0"){
            //echo 'weszlo do inserta ';
            $data['kto_dod'] = $_SESSION['user']['login'];
            $data['data_dod'] = date("Y-m-d H:i:s");
            //unset($data['id']);
            $this->db->insert("cwiklacz_trener", $data);
        }else{
            //$data['kto_zm'] = $_SESSION['user']['login'];
            //$data['data_zm'] = date("Y-m-d H:i:s");
            $id=$data['id'];
            unset($data['id']);
            $this->db->update("cwiklacz_trener",$id,$data);
        }
    }
    
    public function getMoiTrenerzy($id){
        $this->db->query("select ct.id, u.id as id_cwiklacza, u.login, ct.zapro, ct.akcept
                            from cwiklacz_trener ct
                            
                            join uzytkownicy u on u.id=ct.id_trenera
                            where ct.id_cwiklacza=?
                            and ct.zapro=1 and ct.akcept=1
                            group by u.id order by ct.data_dod desc",array($id));
        if($this->db->getRowCount()>0){
            $zwrot = $this->db->getResult();
            return $zwrot;
        }
        return false;
    }
    
    public function getMoiPotencjalniTrenerzy($id){
        $this->db->query("select ct.id, u.id as id_cwiklacza, u.login
                            from cwiklacz_trener ct, uzytkownicy u
                            where ct.id_cwiklacza=?
                            and ct.zapro=1 and ct.akcept=0
                            and u.id=ct.id_trenera
                            order by ct.data_dod desc",array($id));
        if($this->db->getRowCount()>0){
            $zwrot = $this->db->getResult();
            return $zwrot;
        }
        return false;
    }
    
    public function getZnalezieniTrenerzy($kryteria){
        $kryteria = "%".$kryteria."%";
        $this->db->query("select u.id,u.login, count(t.id_trenera) as ile_klientow from uzytkownicy u
            left outer join cwiklacz_trener t on t.id_trenera = u.id and t.zapro=1 and t.akcept=1
            where u.typ=1 and u.login like ?
            group by u.id",array($kryteria));
        if($this->db->getRowCount()>0){
            return $this->db->getResult();
        }
        return false;
    }
    
    public function getCwiklaczTrenerByIdTreneraIdCwiklacza($idTrenera,$idCwiklacza){
        $this->db->query("select * from cwiklacz_trener where id_trenera=? and id_cwiklacza=?",array($idTrenera,$idCwiklacza));
        if($this->db->getRowCount()>0){
            $zwrot = $this->db->getResult();
            return $zwrot[0];
        }
        return false;
    }
  
    public function getCwiklaczTrenerById($id){
        $this->db->query("select * from cwiklacz_trener where id=?",array($id));
        if($this->db->getRowCount()>0){
            $zwrot = $this->db->getResult();
            return $zwrot[0];
        }
        return false;
    }

    
    public function getLastInsertId(){//bo potrzebne w core'ach
        return $this->db->getLastInsertId();
    }

}
?>
