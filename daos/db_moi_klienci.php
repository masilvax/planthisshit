<?php
require_once 'db.php';
class DBMoiKlienci{
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
    
    public function getMoiKlienci($id){
        $this->db->query("select ct.id, u.id as id_cwiklacza, u.login,t.id_cwiklacza as id_cwiklacza_2, ct.zapro, ct.akcept, sum(case when t.id_trenera=ct.id_trenera then 1 else 0 end) as ile_planow
                            from cwiklacz_trener ct
                            left outer join treningi t on t.id_cwiklacza=ct.id_cwiklacza
                            join uzytkownicy u on u.id=ct.id_cwiklacza
                            where ct.id_trenera=?
                            and ct.zapro=1 and ct.akcept=1
                            group by u.id order by ct.data_dod desc",array($id));
        if($this->db->getRowCount()>0){
            $zwrot = $this->db->getResult();
            return $zwrot;
        }
        return false;
    }
    
    public function getMoiPotencjalniKlienci($id){
        $this->db->query("select ct.id, u.id as id_cwiklacza, u.login
                            from cwiklacz_trener ct, uzytkownicy u
                            where ct.id_trenera=?
                            and ct.zapro=1 and ct.akcept=0
                            and u.id=ct.id_cwiklacza
                            order by ct.data_dod desc",array($id));
        if($this->db->getRowCount()>0){
            $zwrot = $this->db->getResult();
            return $zwrot;
        }
        return false;
    }
    
    public function ilePotenjalnych($id){
        $this->db->query("select count(*) as ile
                            from cwiklacz_trener ct, uzytkownicy u
                            where ct.id_trenera=?
                            and ct.zapro=1 and ct.akcept=0
                            and u.id=ct.id_cwiklacza",array($id));
        if($this->db->getRowCount()>0){
            $zwrot = $this->db->getResult();
            return $zwrot[0]['ile'];
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
