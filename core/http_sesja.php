<?php
require_once '../daos/db_sesja.php';
require_once 'session.php';
class HttpRequest{
    private $db = null;
    private $sessionHandlerr = null;
   
    public function __construct(){
        $this->db = new DBSesja();
        $this->sessionHandlerr = new SessionHandlerr();
        if(!$this->sessionHandlerr->checkWhosLoggedIn()){
            die("session timed out");
        }
    }

    public function wyswietlSesje(){
        if(!isset($_REQUEST['id'])){
            die('no training session id!');
        }
        
        $sesja = $this->db->getSesjaById($_REQUEST['id']);

        //var_dump($sesja);
        //potrzebne do sprawdzenia czy mozna wyswietlic
        $trening = $this->db->getTreningById($sesja['id_treningu']);
        if($trening['id_trenera']!=$_SESSION['user']['id'] && $trening['id_cwiklacza']!=$_SESSION['user']['id'])
            die('You do not have permission for this training session');
            
        $trening['cwiklacz'] = $this->db->getLoginCwiklaczaById($trening['id_cwiklacza']);
        $trening['trener'] = $this->db->getLoginCwiklaczaById($trening['id_trenera']);
            
        $sesja['cwiczenia'] = $this->db->getCwiczeniaSesji($sesja['id']);
        
        if($sesja['cwiczenia']){
            //petla robiaca kolejnosc z uwzglednieniem supersetow i literek (1a,1b itd) - korzysta z pryw. funkcji natepnaLitera
            //przesuwa kolejnosc jak wystapi superset - superset=1, czyli przyczepia do poprzedniego cwiczenia (wg pola kolejnosc)
            //[EDIT] tera jest troche inaczej, bo nie przyczepia juz do porzpedniego, gdyz superset jest w danym rekordzie i przyczepiony jest do nastepnego
            $j = 0;
            /*for($i=0;$i<count($sesja['cwiczenia']);$i++){
                if($i>0 && $sesja['cwiczenia'][$i]['superset'] == '1'){
                    if($sesja['cwiczenia'][$i-1]['litera']==''){
                        $sesja['cwiczenia'][$i-1]['litera']=$this->nastepnaLitera($sesja['cwiczenia'][$i-1]['litera']);
                    }
                    $j++;
                    $sesja['cwiczenia'][$i]['kolejnoscWysw'] = $sesja['cwiczenia'][$i]['kolejnosc'] - $j;
                    $sesja['cwiczenia'][$i]['litera'] = $this->nastepnaLitera($sesja['cwiczenia'][$i-1]['litera']);
                    
                }else{
                    $sesja['cwiczenia'][$i]['kolejnoscWysw'] = $sesja['cwiczenia'][$i]['kolejnosc'] - $j;
                }
            }*/
            
            for($i=0;$i<count($sesja['cwiczenia']);$i++){
                
                $sesja['cwiczenia'][$i]['kolejnoscWysw'] = $sesja['cwiczenia'][$i]['kolejnosc'] - $j;
                
                if($sesja['cwiczenia'][$i]['superset'] == '1' && $i<count($sesja['cwiczenia'])-1){
                    if($sesja['cwiczenia'][$i]['litera']==''){
                        $sesja['cwiczenia'][$i]['litera']=$this->nastepnaLitera($sesja['cwiczenia'][$i]['litera']);
                    }
                    $j++;
                    $sesja['cwiczenia'][$i+1]['kolejnoscWysw'] = $sesja['cwiczenia'][$i+1]['kolejnosc'] - $j;
                    $sesja['cwiczenia'][$i+1]['litera'] = $this->nastepnaLitera($sesja['cwiczenia'][$i]['litera']);
                    
                }/*else{
                    $sesja['cwiczenia'][$i]['kolejnoscWysw'] = $sesja['cwiczenia'][$i]['kolejnosc'] - $j;
                }*/
            }
        }
        
        
        $arr = array(
            'odp' => 'OK',
            'sesja' => $sesja,
            'trening'=>$trening
        );
        print json_encode($arr);
    }
    private function nastepnaLitera($poprzLitera){
        $alfabet = array('','a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z');//$alfabet[0] = ''
        $zwrot = $alfabet[0];
        foreach($alfabet as $k=>$v){
            if($v == $poprzLitera){
                $zwrot = $alfabet[$k+1];
            }
        }
        return $zwrot;
    }

    public function dodajNowaSesje(){// i to sie robi w widoku treningu jeszcze, w md-dialogu
        //musi byc oddzielnie bo trzeba przekazac idTreningu i dateSesji
        
        if(!isset($_REQUEST['lang']) || $_REQUEST['lang']=="")
            $lang='en';
        else
            $lang = $_REQUEST['lang'];
        
        if(!isset($_REQUEST['id_treningu'])){
            die('no training id!');
        }
        if(!isset($_REQUEST['data'])){
            die('no session date!');
        }
        if(!isset($_REQUEST['nazwa']) || $_REQUEST['nazwa']==""){
            die(($lang == 'pl') ? 'Podaj nazwę sesji treningowej.' : 'Type training session name.');
        }
        
        $trening = $this->db->getTreningById($_REQUEST['id_treningu']);
        if($trening['id_trenera']!=$_SESSION['user']['id'] && $trening['id_cwiklacza']!=$_SESSION['user']['id'])
            die('You do not have permission for adding sessions in this training program');
            
        $arr = array(
            'id'=>'0',
            'id_treningu'=>$_REQUEST['id_treningu'],
            'data'=>$_REQUEST['data'],
            'nazwa'=>$_REQUEST['nazwa']
        );
        $this->db->saveOrUpdateSesja($arr);
        $idSesji = $this->db->getLastInsertId();
        
        $arr = array(
            'odp' => 'OK','idSesji'=>$idSesji
        );
        print json_encode($arr);
            
        //var_dump($_REQUEST);
    }
    
    public function zapiszSesje(){
    
        if(!isset($_REQUEST['lang']) || $_REQUEST['lang']=="")
            $lang='en';
        else
            $lang = $_REQUEST['lang'];

        if(!isset($_REQUEST['id_sesji'])){
            die('no session id!');
        }
        if(!isset($_REQUEST['data'])){
            die('no session date!');
        }
        if(!isset($_REQUEST['nazwa']) || $_REQUEST['nazwa']==""){
            die(($lang == 'pl') ? 'Podaj nazwę sesji treningowej.' : 'Type training session name.');
        }
        
        $trening = $this->db->getTreningByIdSesji($_REQUEST['id_sesji']);
        if($trening['id_trenera']!=$_SESSION['user']['id'] && $trening['id_cwiklacza']!=$_SESSION['user']['id'])
            die('You do not have permission for this training session');
        
        $arr = array(
            'id'=>$_REQUEST['id_sesji'],
            'data'=>$_REQUEST['data'],
            'nazwa'=>$_REQUEST['nazwa']
        );
        try{//try tutaj, zeby wylapywal go tutaj a nie pozniej i zeby nie wylazil z funkcji, tylko zeby dokonczyl petle
            $this->db->saveOrUpdateSesja($arr);
        }catch(Exception $e){
            if( strpos( $e->getMessage(), '1062 Duplicate entry') ){
                die('The day you\'ve selected ('.$_REQUEST['data'].') has already got a training session in this training program. Choose a different day.');
            }else
                die("ERROR: ".$e->getMessage());
            //SQLSTATE[23000]: Integrity constraint violation: 1062 Duplicate entry '2020-12-31 14:26:08-6' for key 'jeden'
        }

        $arr = array(
            'odp' => 'OK'
        );
        print json_encode($arr);
    }
    
    public function zrobione(){
    
        if(!isset($_REQUEST['id'])){
            die('no exercise id!');
        }
        if(!isset($_REQUEST['zrobione']) || $_REQUEST['zrobione']=="" || $_REQUEST['zrobione']=="undefined"){
            die('no "DONE" parameter!');
        }
        $trening = $this->db->getTreningByIdCwiczenia($_REQUEST['id']);
        if($trening['id_trenera']!=$_SESSION['user']['id'] && $trening['id_cwiklacza']!=$_SESSION['user']['id'])
            die('You do not have permission for this training session');
        
        $arr = array(
            'id'=>$_REQUEST['id'],
            'zrobione'=>$_REQUEST['zrobione']
        );
        $this->db->saveOrUpdateCwiczenie($arr);
        
        $arr = array(
            'odp' => 'OK'
        );
        print json_encode($arr);
    }
    
    public function zapiszCwiczenie(){// dwujęzyczne tylko wpisywane z łapy lub wybierane ręcznie, bo inne pola dadza komunikat tylko jak beda kombinowac
    
        if(!isset($_REQUEST['lang']) || $_REQUEST['lang']=="")
            $lang='en';
        else
            $lang = $_REQUEST['lang'];

        if(!isset($_REQUEST['id']) || $_REQUEST['id']=="" || $_REQUEST['id']=="undefined"){
            die('no exercise id!');
        }
        if(!isset($_REQUEST['zrobione']) || $_REQUEST['zrobione']=="undefined"){
            die('no "DONE" parameter!');
        }
        if(!isset($_REQUEST['id_sesji']) || $_REQUEST['id_sesji']=="" || $_REQUEST['id_sesji']=="undefined"){
            die('no "session_id" parameter!');
        }
        if(!isset($_REQUEST['nazwa_krotka']) || $_REQUEST['nazwa_krotka']=="" || $_REQUEST['nazwa_krotka']=="undefined"){
            die(($lang == 'pl') ? 'Podaj nazwę ćwiczenia.' : 'Type exercise name.');
        }
        if(!isset($_REQUEST['nazwa']) || $_REQUEST['nazwa']=="undefined"){
            die('no "description" parameter!');
        }
        if(!isset($_REQUEST['jedn_intens']) || $_REQUEST['jedn_intens']=="" || $_REQUEST['jedn_intens']=="undefined"){
            die(($lang == 'pl') ? 'Wybierz jednostkę intensywności.' : 'Choose intensity unit.');
        }
        if(!isset($_REQUEST['przerwy_serie']) || $_REQUEST['przerwy_serie']=="" || $_REQUEST['przerwy_serie']=="undefined"){
            die(($lang == 'pl') ? 'Podaj przerwy między seriami w sekundach.' : 'Type pauses between sets in seconds.');
        }
        if(!isset($_REQUEST['przerwa_po']) || $_REQUEST['przerwa_po']=="" || $_REQUEST['przerwa_po']=="undefined"){
            die(($lang == 'pl') ? 'Podaj przerwę przed kolejnym ćwiczeniem.' : 'Type pause before next exercise.');
        }
        if(!isset($_REQUEST['ciezar']) || $_REQUEST['ciezar']=="" || $_REQUEST['ciezar']=="undefined"){
            die('no "weight" parameter!');
        }
        if(!isset($_REQUEST['powt']) || $_REQUEST['powt']=="" || $_REQUEST['powt']=="undefined"){
            die('no "reps" parameter!');
        }
        if(!isset($_REQUEST['serie']) || $_REQUEST['serie']=="" || $_REQUEST['serie']=="undefined"){
            die('no "sets" parameter!');
        }

        $trening = $this->db->getTreningByIdSesji($_REQUEST['id_sesji']);
        if($trening['id_trenera']!=$_SESSION['user']['id'] && $trening['id_cwiklacza']!=$_SESSION['user']['id'])
            die('You do not have permission for this training session');
        
        if($_REQUEST['id']=='0'){
            
            $kolejnosc = $this->db->getMaxKolejnosc($_REQUEST['id_sesji']);
            
            $arr = array(
                'id'=>$_REQUEST['id'],
                'zrobione'=>$_REQUEST['zrobione'],
                'id_sesji'=>$_REQUEST['id_sesji'],
                'nazwa'=>$_REQUEST['nazwa'],
                'nazwa_krotka'=>$_REQUEST['nazwa_krotka'],
                'jedn_intens'=>$_REQUEST['jedn_intens'],
                'przerwy_serie'=>$_REQUEST['przerwy_serie'],
                'przerwa_po'=>$_REQUEST['przerwa_po'],
                'ciezar'=>$_REQUEST['ciezar'],
                'powt'=>$_REQUEST['powt'],
                'serie'=>$_REQUEST['serie'],
                'superset'=>0,
                'kolejnosc'=>$kolejnosc + 1
            );
            
        }else{
        
            $arr = array(
                'id'=>$_REQUEST['id'],
                'zrobione'=>$_REQUEST['zrobione'],
                'id_sesji'=>$_REQUEST['id_sesji'],
                'nazwa'=>$_REQUEST['nazwa'],
                'nazwa_krotka'=>$_REQUEST['nazwa_krotka'],
                'jedn_intens'=>$_REQUEST['jedn_intens'],
                'przerwy_serie'=>$_REQUEST['przerwy_serie'],
                'przerwa_po'=>$_REQUEST['przerwa_po'],
                'ciezar'=>$_REQUEST['ciezar'],
                'powt'=>$_REQUEST['powt'],
                'serie'=>$_REQUEST['serie']
            );
            
        }
        $this->db->saveOrUpdateCwiczenie($arr);
        
        $arr = array(
            'odp' => 'OK'
        );
        print json_encode($arr);
    }
    
    public function supersetujCwiczenie () {
        if(!isset($_REQUEST['id']))
            die('no exercise id!');

        $trening = $this->db->getTreningByIdCwiczenia($_REQUEST['id']);
        if($trening['id_trenera']!=$_SESSION['user']['id'] && $trening['id_cwiklacza']!=$_SESSION['user']['id'])
            die('You do not have permission for this training session');
        
        $arr = array(
            'id'=>$_REQUEST['id'],
            'superset'=>1
        );
        
        $this->db->saveOrUpdateCwiczenie($arr);
        
        $arr = array(
            'odp' => 'OK'
        );
        print json_encode($arr);
    }
    
    public function odsupersetujCwiczenie () {
        if(!isset($_REQUEST['id']))
            die('no exercise id!');

        $trening = $this->db->getTreningByIdCwiczenia($_REQUEST['id']);
        if($trening['id_trenera']!=$_SESSION['user']['id'] && $trening['id_cwiklacza']!=$_SESSION['user']['id'])
            die('You do not have permission for this training session');
        
        $arr = array(
            'id'=>$_REQUEST['id'],
            'superset'=>0
        );
        
        $this->db->saveOrUpdateCwiczenie($arr);
        
        $arr = array(
            'odp' => 'OK'
        );
        print json_encode($arr);
    }
    
    public function usunCwiczenie () {
        if(!isset($_REQUEST['id']))
            die('no exercise id!');
            
        if(!isset($_REQUEST['id_sesji']) || $_REQUEST['id_sesji']=='' || !is_int(intval($_REQUEST['id_sesji']))){
            die('no session id required for order correction');
        }

        $trening = $this->db->getTreningByIdCwiczenia($_REQUEST['id']);
        if($trening['id_trenera']!=$_SESSION['user']['id'] && $trening['id_cwiklacza']!=$_SESSION['user']['id'])
            die('You do not have permission for this training session');
        
        $this->db->usunCwiczenie($_REQUEST['id']);
        
        $this->kolejkuj($_REQUEST['id_sesji']);
        
        $arr = array(
            'odp' => 'OK'
        );
        print json_encode($arr);
    }
    
    public function przesunDoGory(){
        
        if(!isset($_REQUEST['id'])){
            die('no exercise id!');
        }else{
            $id = intval($_REQUEST['id']);
        }
        
        $trening = $this->db->getTreningByIdCwiczenia($id);
        if($trening['id_trenera']!=$_SESSION['user']['id'] && $trening['id_cwiklacza']!=$_SESSION['user']['id'])
            die('You do not have permission for this training session');
        
        $cwiczenie = $this->db->getCwiczenieById($id);
        $cwiczeniePoprzednie = $this->db->getCwiczenieByKolejnosc($cwiczenie['id_sesji'],intval($cwiczenie['kolejnosc'])-1);

        if($cwiczenie){
        
            $arr = array(
                'id'=>$cwiczenie['id'],
                'superset'=>$cwiczeniePoprzednie['superset'],
                'kolejnosc'=>intval($cwiczenie['kolejnosc'])-1 //bieżącej zmniejszamy
            );
            
            $this->db->saveOrUpdateCwiczenie($arr);
            
            if($cwiczeniePoprzednie){
            
                $arrPoprz = array(
                    'id'=>$cwiczeniePoprzednie['id'],
                    'superset'=>$cwiczenie['superset'],
                    'kolejnosc'=>intval($cwiczeniePoprzednie['kolejnosc'])+1 //poprzedniej zwiększamy
                );
                
                $this->db->saveOrUpdateCwiczenie($arrPoprz);
            }
            
            print json_encode(array('odp'=>'OK'));
            die();
        }else{
            die('exercise not found!');
        }
    }
    
    public function przesunNaDol(){
        
        if(!isset($_REQUEST['id'])){
            die('no exercise id!');
        }else{
            $id = intval($_REQUEST['id']);
        }
        
        $trening = $this->db->getTreningByIdCwiczenia($id);
        if($trening['id_trenera']!=$_SESSION['user']['id'] && $trening['id_cwiklacza']!=$_SESSION['user']['id'])
            die('You do not have permission for this training session');
        
        $cwiczenie = $this->db->getCwiczenieById($id);
        $cwiczenieNastepne = $this->db->getCwiczenieByKolejnosc($cwiczenie['id_sesji'],intval($cwiczenie['kolejnosc'])+1);

        if($cwiczenie){
        
            $arr = array(
                'id'=>$cwiczenie['id'],
                'superset'=>$cwiczenieNastepne['superset'],
                'kolejnosc'=>intval($cwiczenie['kolejnosc'])+1 //bieżącej zmniejszamy
            );
            
            $this->db->saveOrUpdateCwiczenie($arr);
            
            if($cwiczenieNastepne){
            
                $arrPoprz = array(
                    'id'=>$cwiczenieNastepne['id'],
                    'superset'=>$cwiczenie['superset'],
                    'kolejnosc'=>intval($cwiczenieNastepne['kolejnosc'])-1 //poprzedniej zwiększamy
                );
                
                $this->db->saveOrUpdateCwiczenie($arrPoprz);
            }
            
            print json_encode(array('odp'=>'OK'));
            die();
        }else{
            die('exercise not found!');
        }
    }
    
    private function kolejkuj($idSesji){
        $cwiczenia = $this->db->getCwiczeniaSesji($idSesji);
        for($i=0;$i<count($cwiczenia);$i++){
            $arr = array(
                'id'=>$cwiczenia[$i]['id'],
                'kolejnosc'=>$i+1
            );
            
            $this->db->saveOrUpdateCwiczenie($arr);
        }
        print json_encode(array('odp'=>'OK'));
        die();
    }

}

try{
    if(isset($_REQUEST['akcja'])){
        
        $httpRequest = new HttpRequest();
        
        switch($_REQUEST['akcja']){
                
            case 'wyswietlSesje':
                $httpRequest->wyswietlSesje();
                break;
                
            case 'zrobione':
                $httpRequest->zrobione();
                break;
                
            case 'zapiszCwiczenie':
                $httpRequest->zapiszCwiczenie();
                break;
                
            case 'dodajNowaSesje':
                $httpRequest->dodajNowaSesje();
                break;
                
            case 'zapiszSesje':
                $httpRequest->zapiszSesje();
                break;
                
            case 'supersetujCwiczenie':
                $httpRequest->supersetujCwiczenie();
                break;
                
            case 'odsupersetujCwiczenie':
                $httpRequest->odsupersetujCwiczenie();
                break;
                
            case 'usunCwiczenie':
                $httpRequest->usunCwiczenie();
                break;
                
            case 'przesunNaDol':
                $httpRequest->przesunNaDol();
                break;
                
            case 'przesunDoGory':
                $httpRequest->przesunDoGory();
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
