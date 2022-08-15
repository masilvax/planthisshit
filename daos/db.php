<?php
class DB{
    private static $_instance = null;
    private $_pdo,
    $_query,
    $_error = false,
    $_result,
    $_count = 0;
    
    
    public static function getInstance(){
        if(!isset(self::$instance)){
            self::$_instance = new DB();
        }
        return self::$_instance;
    }
    
    public function __construct(){
        try{
            $this->_pdo = new PDO('mysql:host=localhost;dbname=14093285_treny;charset=utf8','14093285_treny','BayerFool_500+');
            $this->_pdo->setAttribute( PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION ); //ten parametr uaktywnia exceptiony, ale wyrzuca je znaim zrobi execute, więc w funkcji ponieżej nawet tam nie dojdzie
            $this->_pdo->setAttribute( PDO::ATTR_EMULATE_PREPARES, false );
            $this->query("SET NAMES 'utf8' COLLATE 'utf8_polish_ci'");//sprawdzic czy potrzebne
            $this->query("SET CHARACTER SET 'utf8'");//sprawdzic czy potrzebne
        }catch(PDOException $e){
            echo "TO TU";
            die($e->getMessage());
        }
    }
    
     public function query($sql, $params = array()){
        //var_dump($params);
        $this->_error = false;
        if($this->_query = $this->_pdo->prepare($sql)){
            $x=1;
            if(count($params)){
                foreach($params as $key=>$param){   //key po to, zeby moc w zaleznosci od niego odpowiednio
                                                    //zbindowac kolumne, np bindValue($x, $param, PDO::PARAM_LOB)
                    //echo $x.":".$param."<br/>";
                    $this->_query->bindValue($x,$param);//od 1
                    $x++;
                }
            }
            
            if($this->_query->execute()){
                if(strpos(strtolower($sql), 'select')!==false && strpos(strtolower($sql), 'insert')===false)
                    $this->_result = $this->_query->fetchAll(PDO::FETCH_ASSOC);//przy insertach.updejtach,deletach i ERRMODE_EXCEPTION nie ma co fetchowac i wywala exception, dlatego oifowałem (INSERT AS SELECT, wiec jak znajdzie select ale bez inserta tylko wtedy ma feczować)
                $this->_count = $this->_query->rowCount();
                //echo "<br/><br/><br/>ile: ".$this->_count."<br/><br/>";
            }else{
                
                //var_dump($this->_pdo->errorInfo());
                
                $this->_error = true;//moze throw exception?
                throw new Exception("błąd zapytania: ".$sql);
            }
        }
        return $this;
    }

    public function insert($table, $fields = array()){
        if(count($fields)){
            $keys = array_keys($fields);
            $values = '';
            $x=1;

            foreach($fields as $field){
                $values .= '?';
                if($x < count($fields)){
                    $values .= ', ';
                }
                $x++;
            }
        }
        $sql = "INSERT INTO $table (`".implode('`, `',$keys)."`) VALUES ($values)";
        //echo $sql;
        //var_dump($fields);
        if($this->query($sql,$fields)->error()){
            throw new Exception("Błąd inserta");//to itak sie nie wykona, bo sie wywala w query
        }else{
            return true;
        }

    }

    public function update($table, $id, $fields){
        $set = '';
        $x = 1;
        foreach($fields as $key => $val){
            $set .= "$key = ?";
            if($x < count($fields)){
                $set .= ', ';
            }
            $x++;
        }
        $sql = "UPDATE `$table` SET $set WHERE id = $id";
        //echo "::::".$sql.":::::";
        if($this->query($sql,$fields)->error()){
            throw new Exception("Błąd update'a");
        }else{
            return true;
        }
    }

    public function error(){
        return $this->_error;
    }

    public function getResult(){
        return $this->_result;
    }

    public function getRowCount(){
        return $this->_count;
    }

    public function getLastInsertId(){
        return $this->_pdo->lastInsertId();
    }

}
