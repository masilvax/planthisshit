<?php
require_once 'db.php';
class DBTreningi{
    private $db = null;

    public function __construct(){
        $this->db = DB::getInstance();
    }

    public function saveOrUpdateTrening($data){
        if($data['id']==="0"){
            //echo 'weszlo do inserta ';
            $data['kto_dod'] = $_SESSION['user']['login'];
            $data['data_dod'] = date("Y-m-d H:i:s");
            //unset($data['id']);
            $this->db->insert("treningi", $data);
        }else{
            $data['kto_zm'] = $_SESSION['user']['login'];
            $data['data_zm'] = date("Y-m-d H:i:s");
            $id=$data['id'];
            unset($data['id']);
            $this->db->update("treningi",$id,$data);
        }
    }
    
    public function getTreningiByIdCwiklacza($id){
        $this->db->query("select cwik.login as cwiklacz, tren.login as trener,t.nazwa, t.id, count(s.id) as ile_sesji
                            from treningi t
                            left outer join sesje s on s.id_treningu = t.id and s.data > NOW() - interval 1 day
                            join uzytkownicy cwik on cwik.id = t.id_cwiklacza
                            join uzytkownicy tren on tren.id = t.id_trenera
                            where t.id_cwiklacza=?
                            group by t.id",array($id));
        if($this->db->getRowCount()>0){
            $zwrot = $this->db->getResult();
            return $zwrot;
        }
        return false;
    }
    
    public function getTreningiByIdCwiklaczaIdTrenera($idCwiklacza,$idTrenera){
        $this->db->query("select cwik.login as cwiklacz, tren.login as trener,t.nazwa, t.id, count(s.id) as ile_sesji
                            from treningi t
                            left outer join sesje s on s.id_treningu = t.id and s.data > NOW() - interval 1 day
                            join uzytkownicy cwik on cwik.id = t.id_cwiklacza
                            join uzytkownicy tren on tren.id = t.id_trenera
                            where t.id_cwiklacza=? and t.id_trenera=?
                            group by t.id",array($idCwiklacza,$idTrenera));
        if($this->db->getRowCount()>0){
            $zwrot = $this->db->getResult();
            return $zwrot;
        }
        return false;
    }
    public function getLoginCwiklaczaById($id){
        $this->db->query("select id, login from uzytkownicy where id=?",array($id));
        if($this->db->getRowCount()>0){
            $zwrot = $this->db->getResult();
            return $zwrot[0];
        }
        return false;
    }
    
    public function getSesjeTreningu($id,$data){//DODAC MIESIAC i wyswietlac na trzy miesiace (1m wstecz i 1m w przod [40dni w jedna i druga]) bo przy zmianie miesiaca mamy ten sprzed zmiany a nie po w datepickerze
        
        //$data = date('Y-m-d');
        $pierwszy = new DateTime($data);
        $pierwszy->modify('first day of this month');//od tego odjac miesiac
        $pierwszy->modify('-32 day');
        $ostatni = new DateTime($data);
        $ostatni->modify('last day of this month');//do tego dodac miesiac
        $ostatni->modify('+32 day');
        //echo $pierwszy->format('Y-m-d')."---".$ostatni->format('Y-m-d');
    
    //czas_wpisu > '".$pierwszy->format('Y-m-d')." 00:00:00' and czas_wpisu < '".$ostatni->format('Y-m-d')." 23:59:59'
    //echo "ZAPYTKA::: select id, DATE_FORMAT(data, '%Y-%m-%d') as date, 'training' as css, nazwa as title, true as selectable from sesje where id_treningu=? and data >= '".$pierwszy->format('Y-m-d')." 00:00:00' and data <= '".$ostatni->format('Y-m-d')." 23:59:59'::::";
        $this->db->query("select id, DATE_FORMAT(data, '%Y-%m-%d') as date, 'training' as css, nazwa as title, true as selectable from sesje where id_treningu=?
         and data >= '".$pierwszy->format('Y-m-d')."' and data <= '".$ostatni->format('Y-m-d')."'",array($id));
        if($this->db->getRowCount()>0){
            $zwrot = $this->db->getResult();
            return $zwrot;
        }
        return false;
    }
    
    public function getTreningiByIdTrenera($id){
        $this->db->query("select * from treningi where id_trenera=?",array($id));
        if($this->db->getRowCount()>0){
            $zwrot = $this->db->getResult();
            return $zwrot;
        }
        return false;
    }
    
    public function getTreningById($id){
        $this->db->query("select * from treningi where id=?",array($id));
        if($this->db->getRowCount()>0){
            $zwrot = $this->db->getResult();
            return $zwrot[0];
        }
        return false;
    }
    
    public function getTreningByIdSesji($id){// no potrzebne zeby sprawdzic trenera i cwiklacza i publicznosc i czy zalogowany user moze go wyswietlic 
    // tu do przesuwan usuwan itd ale ze moge usuwac dzien w ktorym nic nie ma to to sie nie sprawdzi, wiec chyba mozna wywalic
        $this->db->query("select t.* from treningi t, sesje s where s.id=? and s.id_treningu=t.id",array($id));
        if($this->db->getRowCount()>0){
            $zwrot = $this->db->getResult();
            return $zwrot[0];
        }
        return false;
    }
    
    public function getLastInsertId(){//bo potrzebne w core'ach
        return $this->db->getLastInsertId();
    }
    
    public function kopiujSesje($id){
        $kto_dod = $_SESSION['user']['login'];
        $this->db->query("insert into sesje (nazwa, data, id_treningu, kto_dod)
            select nazwa, data + INTERVAL 7 DAY, id_treningu, '".$kto_dod."' FROM sesje where id = ?",array($id));
            
        $idNowejSesji = $this->getLastInsertId();
            
        $this->db->query("insert into cwiczenia (id_sesji, superset, kolejnosc, nazwa, serie, powt, ciezar, przerwy_serie, przerwa_po, jedn_intens, nazwa_krotka)
            select '".$idNowejSesji."', superset, kolejnosc, nazwa, serie, powt, ciezar, przerwy_serie, przerwa_po, jedn_intens, nazwa_krotka FROM cwiczenia where id_sesji = ?",array($id));
    }

    public function przesunSesjeDoPrzodu($id){
        $kto_dod = $_SESSION['user']['login'];
        $this->db->query("update sesje set data = DATE_ADD(data, INTERVAL 1 DAY), data_zm = curdate(), kto_zm=? where id = ?",array($kto_dod,$id));
    }
    public function przesunSesjeDoTylu($id){
        $kto_dod = $_SESSION['user']['login'];
        $this->db->query("update sesje set data = DATE_SUB(data, INTERVAL 1 DAY), data_zm = curdate(), kto_zm=? where id = ?",array($kto_dod,$id));
    }

    public function usunSesje($id){
        $this->db->query("delete from sesje where id = ?",array($id));
        $this->db->query("delete from cwiczenia where id_sesji = ?",array($id));
    }
    
    public function usunTrening($id){//kolejnosc zapytan wazna!!!
        $this->db->query("delete from cwiczenia where id_sesji in (select id from sesje where id_treningu=?)",array($id));
        $this->db->query("delete from sesje where id_treningu = ?",array($id));
        $this->db->query("delete from treningi where id = ?",array($id));
    }
    
    //INSERT INTO sesje (nazwa, data, id_treningu, kto_dod)
    //SELECT nazwa, data + INTERVAL 7 DAY, id_treningu, kto_dod FROM sesje where id;
    
    //INSERT INTO cwiczenia (id_sesji, superset, kolejnosc, nazwa, serie, powt, ciezar, przerwy_serie, przerwa_po )
    //SELECT (id_sesji, superset, kolejnosc, nazwa, serie, powt, ciezar, przerwy_serie, przerwa_po FROM cwiczenia where id_sesji;
}
?>
