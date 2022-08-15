<?php
if (is_file('../daos/db.php')){
    require_once('../daos/db.php');
}else{
    require_once 'daos/db.php';
}
class SessionHandlerr{
	private $db = null;
 
        public function __construct(){
		session_start();
		$this->db = DB::getInstance();

	}
    
	public function zarejestruj(){

        session_unset();
        session_destroy();
        session_start();
        
        if(!isset($_REQUEST['lang']) || $_REQUEST['lang']=="")
            $lang='en';
        else
            $lang = $_REQUEST['lang'];
            
        if(!isset($_REQUEST['login']) || $_REQUEST['login']=="")
            die( ($lang == 'pl') ? 'Podaj login.' : 'Please type your username.');
            
        if(!isset($_REQUEST['haslo']) || $_REQUEST['haslo']=="")
            die( ($lang == 'pl') ? 'Podaj hasło.' : 'Please type your password.');
            
        if(!isset($_REQUEST['potw_haslo']) || $_REQUEST['potw_haslo']=="")
            die( ($lang == 'pl') ? 'Potwierdź hasło.' : 'Please confirm your password.');
            
        if($_REQUEST['haslo']!=$_REQUEST['potw_haslo'])
            die( ($lang == 'pl') ? 'Hasła nie są takie same.' : 'Passwords don\'t match.');
            
        if(strlen($_REQUEST['haslo'])<8)
            die( ($lang == 'pl') ? 'Hasło powinno mieć przynajmniej 8 znaków.' : 'Password should have at least 8 characters.');
            
        if(!isset($_REQUEST['email']) || $_REQUEST['email']=="")
            $email='';
        else
            $email = $_REQUEST['email'];

        $this->db->query("select id, login, email, typ, lang, temat from uzytkownicy where login=?",array($_REQUEST['login']));
        if($this->db->getRowCount()>0){
            
            die( ($lang == 'pl') ? 'Podany login już istnieje. Proszę podaj inny.' : 'Username you typed already exists. Please try something else.');
        }
       
        $arr = array(
            'login'=>$_REQUEST['login'],
            'lang'=>$lang,
            'haslo'=>md5($_REQUEST['haslo']),
            'email'=>$email,
            'ost_logowanie'=>date("Y-m-d H:i:s"),
            'data_dod'=>date("Y-m-d H:i:s")
        );
        $this->db->insert("uzytkownicy",$arr);
        
        $this->db->query("select id, login, email, typ, lang, temat from uzytkownicy where login=?",array($_REQUEST['login']));
        if($this->db->getRowCount()!=1){
            throw new Exception("Something went wrong.");
        }else{
            $user = $this->db->getResult();
            $_SESSION['user'] = $user[0];
            print json_encode($user[0]);
        }
	}
    
	public function logIn(){

            session_unset();
            session_destroy();
            session_start();
            
            if(!isset($_REQUEST['lang']) || $_REQUEST['lang']=="")
                $lang='en';
            else
                $lang = $_REQUEST['lang'];
                
            if(!isset($_REQUEST['login']) || !isset($_REQUEST['haslo']) )
                die( ($lang == 'pl') ? 'Podaj login i hasło.' : 'Please type your username and password.');
            
            $this->db->query("select id, login, email, typ, lang, temat from uzytkownicy where login=? and haslo=?",array($_REQUEST['login'],md5($_REQUEST['haslo'])));
            if($this->db->getRowCount()!=1){
                throw new Exception(($lang == 'pl') ? 'Nieprawidłowy login lub hasło!' : 'Incorrect username or password!');
            }else{
                $user = $this->db->getResult();
                $_SESSION['user'] = $user[0];
                //akt ost logowanie
                $data['ost_logowanie'] = date("Y-m-d H:i:s");
                $id=$user[0]['id'];
                $this->db->update("uzytkownicy",$id,$data);
            }
	}
    
	public function checkWhosLoggedIn(){
            if(isset($_SESSION['user']['login'])){
                return $_SESSION['user'];
            }
            return false;
    }
 
        
    public function logOut(){
        session_unset();
        session_destroy();
    }
    
	public function odzyskajHaslo(){

            session_unset();
            session_destroy();
            session_start();
            
            if(!isset($_REQUEST['lang']) || $_REQUEST['lang']=="")
                $lang='en';
            else
                $lang = $_REQUEST['lang'];
                
                
            if(!isset($_REQUEST['login']) || !isset($_REQUEST['login']) )
                die( ($lang == 'pl') ? 'Podaj login.' : 'Please type your username.');
            if(!isset($_REQUEST['email']) || !isset($_REQUEST['email']) )
                die( ($lang == 'pl') ? 'Podaj adres e-mail.' : 'Please type your e-mail address.');
            
            $this->db->query("select id, login, email, typ, lang, temat from uzytkownicy where login=? and email=?",array($_REQUEST['login'],$_REQUEST['email']));
            if($this->db->getRowCount()!=1){
                throw new Exception(($lang == 'pl') ? 'Podany login z tym adresem e-mail nie istnieje w naszej bazie danych!' : 'The given username with this e-mail address does not exist in our database!');
            }else{
                
                //TUDU: ODZYSKANIE HASLA
                /*
                utworzyc nowe randomowe haslo i wysłać je imejlem
                */
                $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
                $randomoweHaslo = '';
            
                for ($i = 0; $i < 10; $i++) {
                    $index = rand(0, strlen($characters) - 1);
                    $randomoweHaslo .= $characters[$index];
                }

                
                
                $user = $this->db->getResult();
                $data['haslo'] = md5($randomoweHaslo);
                $id=$user[0]['id'];
                $this->db->update("uzytkownicy",$id,$data);
                
                
                $subject = ($lang == 'pl') ? 'PlanThisSh!t - zmiana hasła' : 'PlanThisSh!t - password change';
                $subject = "=?UTF-8?B?".base64_encode($subject)."?=";

                //from musi byc istniejaca skrzynka na serwerze w homie inaczej mail zwroci false
                $headers = 'From: office@snapshotniugini.com' . "\r\n" .
                        'Reply-To: '.$_REQUEST['email']. "\r\n" .
                        'X-Mailer: PHP/' . phpversion(). "\r\n" .
                        'Content-type:text/plain;charset=UTF-8';
                
                $message = ($lang == 'pl') ? "Dziękujemy za korzystanie z PlanThisSh!t. Twoje nowe hasło znajduje się poniżej. Wskazane jest aby zmienić je w sekcji 'Moje konto'.\n\n\n" : "Thank you for using PlanThisShit. Your new password is down below. It is strongly recommended that you change the password in 'My Account' section.\n\n\n";
                
                $message .= $randomoweHaslo;
                
                $message .= ($lang == 'pl') ? "\n\n\nŻyczymy szybkich i trwałych progresów.\nZespół ds. PlanowaniaTegoSh!ta ;)\n\nWiadomość wygenerowania automatycznie - prosimy na nią nie odpowiadać.\n\n\n" : "\n\n\nBest Regards. And remember - it's ok to be healthy, strong, and of course, beautiful ;)\nPlanThisSh!t Team\n\nMessage generated automatically. Please do not respond.\n\n\n";
                
                $to = 'jakub.bartek@gmail.com';//$_REQUEST['email']
                
                
                if(!mail($to, $subject, $message, $headers)){
                    throw new Exception( ($lang == 'pl') ? 'Błąd podczas wysyłania wiadomości e-mail.' : 'Error during sending e-mail.');
                }
            
                $arr = array(
                    'odp' => 'OK'
                );
                print json_encode($arr);
            }
	}
    
    public function potwierdzCiasto(){
        $_SESSION['user']['potwierdzoneCiasto']=true;
    }
    
}

if(isset($_REQUEST['akcja_s'])){
    try{
            
            $sessionHandlerr = new sessionHandlerr();
            
            switch($_REQUEST['akcja_s']){
                case 'login':
                    $sessionHandlerr->logIn();
                    if(!$kto = $sessionHandlerr->checkWhosLoggedIn()){
                        die("NIE");
                    }else{
                        print json_encode($kto);
                    }
                    break;

                case 'logout':
                    $sessionHandlerr->logOut();
                    die("OK");
                    break;

                case 'check':
                    if(!$kto = $sessionHandlerr->checkWhosLoggedIn()){
                        die("NIE");
                    }else{
                        print json_encode($kto);
                    }
                    break;
                    
                case 'zarejestruj':
                    $sessionHandlerr->zarejestruj();
                    break;
                    
                case 'odzyskajHaslo':
                    $sessionHandlerr->odzyskajHaslo();
                    break;
                    
                default:
                    die("NIEOK");
            }

    }catch(Exception $e){
        die($e->getMessage());
    }
}

?>
