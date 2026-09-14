<?php

class ServerSql {

    private $available_days;
    private $manufacture_name;
    private $model_name;
    private $chassi_no;
    private $year;
    private $from_year;
    private $to_year;
    private $enginecc;
    private $colour;
    private $lot_no; 
    private $table_name = "main";

    function availableDays() {
        return $this->available_days;
    }

    function manufactureName() {
        return $this->manufacture_name;
    }

    function modelName() {
        return $this->model_name;
    }

    function chassiNo() {
        return $this->chassi_no;
    }

    function year() {
        return $this->year;
    }

    function fromYear() {
        return $this->from_year;
    }

    function toYear() {
        return $this->to_year;
    }

    function enginecc() {
        return $this->enginecc;
    }

    function colour() {
        return $this->colour;
    }
    
    function lotNo(){
        return $this->lot_no;
    }

    function setAvailableDays($available_days) {
        $this->available_days = $available_days;
    }

    function setManufactureName($manufacture_name) {
        $this->manufacture_name = $manufacture_name;
    }

    function setModelName($model_name) {
        $this->model_name = $model_name;
    }

    function setChassiNo($chassi_no) {
        $this->chassi_no = $chassi_no;
    }

    function setYear($year) {
        $this->year = $year;
    }

    function setFromYear($from_year) {
        $this->from_year = $from_year;
    }

    function setToYear($to_year) {
        $this->to_year = $to_year;
    }

    function setEnginecc($enginecc) {
        $this->enginecc = $enginecc;
    }

    function setColour($colour) {
        $this->colour = $colour;
    }
    
    function setLotNo($lot_no){
        $this->lot_no = $lot_no;
    }

    /*
     * 
      [0] => Array
      (
      [ID] => 37EB6RvPDcj5Arx
      [LOT] => 8101
      [AUCTION_DATE] => 2017-02-04 11:41:00
      [AUCTION] => JU Gifu
      [MARKA_ID] => 12
      [MODEL_ID] => 10267
      [MARKA_NAME] => ALFAROMEO
      [MODEL_NAME] => ALFA ROMEO GIULIETTA
      [YEAR] => 2013
      [ENG_V] => 1400
      [PW] =>
      [KUZOV] => 940141
      [GRADE] => &#65404;&#65438;&#65389;&#65432;&#65396;&#65391;&#65408; &#65400;&#65431;&#65404;&#65398;
      [COLOR] => red
      [KPP] => FAT
      [KPP_TYPE] => 2
      [PRIV] =>
      [MILEAGE] => 15000
      [EQUIP] =>
      [RATE] => 4.5
      [START] => 1230000
      [FINISH] => 0
      [STATUS] =>
      [TIME] => 2017-01-31 23:05:00
      [AVG_PRICE] => 2009000
      [AVG_STRING] => 2009
      [IMAGES] => http://46.4.101.210/imgs/8tJEtOBiZeiVqgfCvicAUu13pWZwUxOhR9DIi9402xOCphe-37EB6RvPDcj5Arx&h=50#http://46.4.101.210/imgs/8tJEtOBiZeiVqgfCvicAUu13pWZwUxOhR9DIu2nn6UZFvd6-37EB6RvPDcj5Arx&h=50
      )
     */
    function searchByIdStats($id) {
        $sql = "SELECT * FROM stats WHERE id = '" . $id . "' order by marka_name ASC";
        return $this->outputData($sql);
    }

    function searchById($id) {
        $sql = "SELECT * FROM " . $this->table_name . " WHERE id = '" . $id . "' order by marka_name ASC";
        return $this->outputData($sql);
    }

    function getAuctionDays() {//get Auction Available Days
        $sql = "SELECT auction_date FROM " . $this->table_name . " GROUP BY DATE_FORMAT(auction_date,'%Y-%m-%d')";
        $data = $this->outputData($sql);
        return $data;
    }

    function getDistinctManufacturer() {  //get Manufacturer
        $sql = "select distinct marka_name from " . $this->table_name . " order by marka_name ASC";
        $data = $this->outputData($sql);
        return $data;
    }

    function getModelByManufacturer($manufacturer) {
        if($manufacturer != ''){
            $where = " where marka_name='" . $manufacturer."' ";
        }else{
            $where = '';
        }
        $sql = "SELECT distinct MODEL_NAME from " . $this->table_name . $where . " order by MODEL_NAME ASC";
        return $this->outputData($sql);
    }

    function getYears(){
        $sql = "SELECT distinct year from " . $this->table_name . " order by year ASC";
        return $this->outputData($sql);
    }

    function getYearByManufacturer($manufacturer) {
        $sql = "SELECT distinct year from " . $this->table_name . " where marka_name='" . $manufacturer . "' order by year ASC";
        return $this->outputData($sql);
    }

    function getYearByModelManufacturer($manufacturer,$model) {
        $sql = "SELECT distinct year from " . $this->table_name . " where marka_name='" . $manufacturer . "' AND MODEL_NAME='" . $model . "' order by year ASC";
        return $this->outputData($sql);
    }

    function getColours(){
        $sql = "SELECT distinct COLOR from " . $this->table_name . " order by COLOR ASC";
        return $this->outputData($sql);
    }

    function getColoursByManufacturer($manufacturer,$from_year,$to_year){
        $from_year_set = empty($from_year);
        $to_year_set = empty($to_year);
        if(!$from_year_set){
            $from_year = '';
        }
        if(!$to_year_set){
            $to_year = '';
        }

        if($from_year!=''&&$to_year!=''){
            $where = "AND year BETWEEN $from_year AND $to_year";
        }else if($from_year!=''&&$to_year==''){
            $where = "AND year= $from_year";
        }else if($from_year==''&&$to_year!=''){
            $where = "AND year= $to_year";
        }else{
            $where = '';
        }

        $sql = "SELECT distinct COLOR from " . $this->table_name . " where marka_name='" . $manufacturer . "' $where order by COLOR ASC";
        return $this->outputData($sql);
    }

    function getColoursByManufacturerAndModel($manufacturer,$model,$from_year,$to_year){
        $from_year_set = empty($from_year);
        $to_year_set = empty($to_year);
        if(!$from_year_set){
            $from_year = '';
        }
        if(!$to_year_set){
            $to_year = '';
        }

        if($from_year!=''&&$to_year!=''){
            $where = "AND year BETWEEN $from_year AND $to_year";
        }else if($from_year!=''&&$to_year==''){
            $where = "AND year= $from_year";
        }else if($from_year==''&&$to_year!=''){
            $where = "AND year= $to_year";
        }else{
            $where = '';
        }

        $sql = "SELECT distinct COLOR from " . $this->table_name . " where marka_name='" . $manufacturer . "' AND model_name='" . $model . "' $where order by COLOR ASC";
        $data = $this->outputData($sql);
        return $data;
    }

    function getChassisNo($manufacturer,$model) {
        $sql = "SELECT distinct kuzov from " . $this->table_name . " where marka_name='" . $manufacturer . "' AND MODEL_NAME='" . $model . "' ";

        // if ($this->toYear() == $this->fromYear()) {

        //     $sql .= "AND year = '" . $this->fromYear() . "' ";
        // } else if ($this->toYear() && $this->fromYear()) {

        //     $sql .= "AND year BETWEEN '" . $this->fromYear() . "' AND '" . $this->toYear() . "' ";
        // }

        $sql .="order by kuzov ASC";

        $data = $this->outputData($sql);
        return $data;
    }

    function getEngineCC() {
        $sql = "SELECT distinct eng_v from " . $this->table_name . " where marka_name='" . $this->manufactureName() . "' AND model_name='" . $this->modelName() . "' ";

        if ($this->toYear() == $this->fromYear()) {

            $sql .= "AND year = '" . $this->fromYear() . "' ";
        } else if ($this->toYear() && $this->fromYear()) {

            $sql .= "AND year BETWEEN '" . $this->fromYear() . "' AND '" . $this->toYear() . "' ";
        }

        if ($this->chassiNo()) {
            $sql .= "AND kuzov = '" . $this->chassiNo() . "' ";
        }

        $sql .="order by eng_v ASC";

        $data = $this->outputData($sql);
        return $data;
    }

    function getColor() {
        $sql = "SELECT distinct COLOR from " . $this->table_name . " where marka_name='" . $this->manufactureName() . "' AND model_name='" . $this->modelName() . "' ";

        if ($this->toYear() == $this->fromYear()) {

            $sql .= "AND year = '" . $this->fromYear() . "' ";
        } else if ($this->toYear() && $this->fromYear()) {

            $sql .= "AND year BETWEEN '" . $this->fromYear() . "' AND '" . $this->toYear() . "' ";
        }

        if ($this->chassiNo()) {
            $sql .= "AND kuzov = '" . $this->chassiNo() . "' ";
        }

        if ($this->enginecc()) {
            $sql .= "AND eng_v = '" . $this->enginecc() . "' ";
        }

        $sql .=" order by COLOR ASC";

        $data = $this->outputData($sql);
        return $data;
    }

    function searchVehiclePaged($page) {
        $sql = "SELECT * from " . $this->table_name . " where 1=1 ";
        
        if ($this->manufactureName()) {
            $sql .= "AND marka_name = '" . $this->manufactureName() . "' ";
        }

        if ($this->modelName()) {
            $sql .= "AND model_name = '" . $this->modelName() . "' ";
        }

        if ($this->year() != 0 || $this->year() != '') {
            $sql .= "AND year = '" . $this->year() . "' ";
        }

        if ($this->chassiNo()) {
            $sql .= "AND kuzov = '" . $this->chassiNo() . "' ";
        }

        /*if ($this->enginecc() && $this->enginecc() != '' && !empty($this->enginecc())) {
            $sql .= "AND eng_v = '" . $this->enginecc() . "' ";
        }

        if ($this->colour() && $this->colour() != '') {
            $sql .= "AND COLOR = '" . $this->colour() . "' ";
        }
        
        if($this->lotNo() && $this->lotNo() != ''){
            $sql .= "AND LOT = '" . $this->lotNo() . "' ";
        }

        if ($this->availableDays() && $this->availableDays() != '') {

            if (preg_match("/,/", $this->availableDays())) {//here check if the variable contain multiple data
                $auc_date = explode(",", $this->availableDays()); //break the variable in to single array

                $count = sizeof($auc_date);
                $sql .=" AND (";
                for ($i = 0; $i < sizeof($auc_date); $i++) {
                    $auc_date_type = explode(" ", $auc_date[$i]);
                    if ($i == 0) {
                        $sql .= " AUCTION_DATE LIKE '%$auc_date_type[0]%' ";
                    } else {
                        $sql .= " OR AUCTION_DATE LIKE '%$auc_date_type[0]%' ";
                    }
                }
                $sql .= " )";
            } else {
                //if single variable came for auc_date this will execute
                $auc_date = explode(" ", $this->availableDays());
                $sql .= " AND AUCTION_DATE LIKE  '%$auc_date[0]%'";
            }
        }*/

        $offset = ($page - 1) * 10;

        $sql.=' ORDER BY marka_name ASC LIMIT ' . $offset . ',10'; 

      //  echo $sql;
        $data = $this->outputData($sql);
        return $data;
    }

    function searchVehicleCount() {
        $sql = "SELECT COUNT(*) from " . $this->table_name . " where 1=1 ";

        if ($this->manufactureName()) {
            $sql .= "AND marka_name = '" . $this->manufactureName() . "' ";
        }

        if ($this->modelName()) {
            $sql .= "AND model_name = '" . $this->modelName() . "' ";
        }

        if ($this->year() != 0 || $this->year() != '') {
            $sql .= "AND year = '" . $this->year() . "' ";
        }

        if ($this->chassiNo()) {
            $sql .= "AND kuzov = '" . $this->chassiNo() . "' ";
        }

        /*if ($this->enginecc() && $this->enginecc() != '' && !empty($this->enginecc())) {
            $sql .= "AND eng_v = '" . $this->enginecc() . "' ";
        }

        if ($this->colour() && $this->colour() != '') {
            $sql .= "AND COLOR = '" . $this->colour() . "' ";
        }
        
        if($this->lotNo() && $this->lotNo() != ''){
            $sql .= "AND LOT = '" . $this->lotNo() . "' ";
        }

        if ($this->availableDays() && $this->availableDays() != '') {

            if (preg_match("/,/", $this->availableDays())) {//here check if the variable contain multiple data
                $auc_date = explode(",", $this->availableDays()); //break the variable in to single array

                $count = sizeof($auc_date);
                $sql .=" AND (";
                for ($i = 0; $i < sizeof($auc_date); $i++) {
                    $auc_date_type = explode(" ", $auc_date[$i]);
                    if ($i == 0) {
                        $sql .= " AUCTION_DATE LIKE '%$auc_date_type[0]%' ";
                    } else {
                        $sql .= " OR AUCTION_DATE LIKE '%$auc_date_type[0]%' ";
                    }
                }
                $sql .= " )";
            } else {
                //if single variable came for auc_date this will execute
                $auc_date = explode(" ", $this->availableDays());
                $sql .= " AND AUCTION_DATE LIKE  '%$auc_date[0]%'";
            }
        }*/

        $sql.=' ORDER BY marka_name ASC';
        //echo $sql;
        $data = $this->outputData($sql);
        //print_r($data);
        return $data[0]['TAG0'];
    }
    
    function searchVehicleStatsYears() {
        $sql = "SELECT count(year), year from stats ";
        
        if ($this->manufactureName()) {
            $sql .= "where marka_name = '" . $this->manufactureName() . "' ";
        }

        if ($this->modelName()) {
            $sql .= "AND model_name = '" . $this->modelName() . "' ";
        }
        
        $sql .= "GROUP BY year ORDER BY year ASC";
        
        $data = $this->outputData($sql);
        return $data;
        
    }
    
    function searchVehicleStatsChassis($year){
        $sql = "SELECT count(kuzov), kuzov from stats ";
        
        if ($this->manufactureName()) {
            $sql .= "where marka_name = '" . $this->manufactureName() . "' ";
        }

        if ($this->modelName()) {
            $sql .= "AND model_name = '" . $this->modelName() . "' ";
        }
        
        if ($year) {
            $sql .= "AND year = '" . $year . "' ";
        }
        
        $sql.='GROUP BY kuzov ORDER BY kuzov ASC';
        $data = $this->outputData($sql);
        return $data;
        
    }
    
    function searchVehicleStatsCondition($year){
        $sql = "SELECT count(rate), rate from stats ";
        
        if ($this->manufactureName()) {
            $sql .= "where marka_name = '" . $this->manufactureName() . "' ";
        }

        if ($this->modelName()) {
            $sql .= "AND model_name = '" . $this->modelName() . "' ";
        }
        
        if ($this->chassiNo()) {
            $sql .= "AND kuzov = '" . $this->chassiNo() . "' ";
        }
        
        if ($year) {
            $sql .= "AND year = '" . $year . "' ";
        }
        
        $sql.='GROUP BY rate ORDER BY rate ASC';
        $data = $this->outputData($sql);
        return $data;
        
    }
    
    function searchVehicleStatsPaged($page,$year,$rate) {
        $sql = "SELECT * from stats ";
        
        if($year=="undefined"){
            $year = false;
        }
        
        if($rate=="undefined"){
            $rate = false;
        }
        
        if($this->chassiNo()=="undefined"){
            $this->setChassiNo(false);
        }

        if ($this->manufactureName()) {
            $sql .= "where marka_name = '" . $this->manufactureName() . "' ";
        }

        if ($this->modelName()) {
            $sql .= "AND model_name = '" . $this->modelName() . "' ";
        }
        
        if ($this->chassiNo()) {
            $sql .= "AND kuzov = '" . $this->chassiNo() . "' ";
        }
        
        if ($year) {
            $sql .= "AND year = '" . $year . "' ";
        }
        
        if ($rate) {
            $sql .= "AND rate = '" . $rate . "' ";
        }

        $offset = ($page - 1) * 10;

        $sql.=' ORDER BY marka_name ASC LIMIT ' . $offset . ',10';
        $data = $this->outputData($sql);
        return $data;
    }

    function searchVehicleStatsPagedCount($year,$rate) {
        $sql = "SELECT COUNT(*) from stats ";
        
        if($year=="undefined"){
            $year = false;
        }
        
        if($rate=="undefined"){
            $rate = false;
        }
        
        if($this->chassiNo()=="undefined"){
            $this->setChassiNo(false);
        }

        if ($this->manufactureName()) {
            $sql .= "where marka_name = '" . $this->manufactureName() . "' ";
        }

        if ($this->modelName()) {
            $sql .= "AND model_name = '" . $this->modelName() . "' ";
        }
        
        if ($this->chassiNo()) {
            $sql .= "AND kuzov = '" . $this->chassiNo() . "' ";
        }
        
        if ($year) {
            $sql .= "AND year = '" . $year . "' ";
        }
        
        if ($rate) {
            $sql .= "AND rate = '" . $rate . "' ";
        }

        $sql.='ORDER BY marka_name ASC';
        
        $data = $this->outputData($sql);
        return $data[0]['TAG0'];
    }
    
    
    function isFeaturedFront(){
         $sql = "SELECT * from " . $this->table_name . " ORDER BY id DESC LIMIT 0,10";
         $data = $this->outputData($sql);
         return $data;
    }
    
    function isFeaturedFront2(){
         $sql = "SELECT * from stats ORDER BY id DESC LIMIT 0,10";
         $data = $this->outputData($sql);
         return $data;
    }
    
    function featureManufacturers() {
        $sql = "SELECT marka_name, count(marka_name) from ". $this->table_name . " GROUP BY marka_name ORDER BY count(marka_name) DESC LIMIT 0,5";
        $data = $this->outputData($sql);
        return $data;
    }
    
    function featureManufacturerVehicles() {
        $sql = "SELECT * from ". $this->table_name . " WHERE MARKA_NAME = '" . $this->manufactureName() . "' ORDER BY id DESC LIMIT 0,6";
        $data = $this->outputData($sql);
        return $data;
    }
    
    function outputData($sql) {
        ## To avoid PREG_MATCH_ALL() 100 Kb limit
        @ini_set("pcre.backtrack_limit", 10000000);
        //$code = "qmFdi84mSg"; // old Password without Images
        //$code = "hYqwv45_znR";  // New Password with Images
        $code = "Ddddrr33fs";  // New Password with Images
        //$this->header_out($start_time); // Header output, Time starting  
        //$v = preg_replace("/\\\\'/","'","http://auc.nikoba.com/xml/xml?code=".$code."&sql=".$sql);
        //echo "XML-link: <a style='font-size:11px' href=\"$v\">".$v."</a>";
        //------------------------------------------------------
        ## 1 - Enable gzip, fast; 0 - Disable gzip compression, slowly;
        $is_gzip = 1;
        $file_name = "http://75.125.226.218/xml/xml?gzip&code=DvemR43s&sql=".urlencode(preg_replace("/%25/","%",$sql)); 
        $handle = fopen("C:/wamp/www/car-auction/test.txt", "a");
        fwrite($handle, $file_name);
        fclose($handle);
         //echo $file_name; die();
        //$file_name = "http://auc.nikoba.com/xml/xml?".(($is_gzip)?"gzip&":"")."code=".$code."&sql=".urlencode(preg_replace("/%25/","%",$sql));
        //$file_name = "http://auc.nikoba.com/xml/xml?" . (($is_gzip) ? "gzip&" : "") . "code=" . $code . "&ip=127.0.0.1&sql=" . urlencode(preg_replace("/%25/", "%", $sql));
        //echo gethostbyname("ONLY_ HOST_HERE_WITHOUT_HTTP_PROTOCOL"); // debug
//var_export (dns_get_record ( "ONLY_HOST_HERE_WITHOUT_HTTP_PROTOCOL") );
        if ($is_gzip) {
            $xml = file_get_contents($file_name);
            $xml = gzuncompress(preg_replace("/^\\x1f\\x8b\\x08\\x00\\x00\\x00\\x00\\x00/", "", $xml));
        } else {
            $xml = file_get_contents($file_name);
        }
        //------------------------------------------------------
        $xml_arr = $this->xml2array($xml);
        //print_r($xml_arr);
        if (is_array($xml_arr['aj'])) {
            $t = $xml_arr['aj'][0]['row'];
            $num_rows = sizeof($t);
            return $t;
        } else {
            return 0;
        }
    }

    function xml2array($text) {
        $reg_exp = '/<(\w+)[^>]*>(.*?)<\/\\1>/s';
        preg_match_all($reg_exp, $text, $match);
        foreach ($match[1] as $key => $val) {
            if (preg_match($reg_exp, $match[2][$key])) {
                $array[$val][] = $this->xml2array($match[2][$key]);
            } else {
                $array[$val] = $match[2][$key];
            }
        }
        return $array;
    }

## For debug

    function prn($var) {
        echo "<br><textarea style='width:500px;height:450px;'>";
        echo "</textarea>";
//die();
    }

## Header output

    function header_out($start_time) {
        echo "<html>
                <head>
                <title>SQL2XML API</title>
                <META HTTP-EQUIV='Content-Type' CONTENT='text/html; charset=windows-1251'>
                <style>
                  body{font-size:12px;font-family:Arial,Verdana;margin:12px 0px 0px 20px;padding:0px;line-height:1em}
                  .copy{font-size:11px;text-decoration:none}
                  .button{font-size:12px;width:170px;background:#efefef;border:1px solid #999999}
                  .t_main {border-top:solid 1px #ccc;border-left:solid 1px #ccc}
                  .t_main td{padding:3px;line-height:1.1em;border-bottom:solid 1px #ccc;border-right:solid 1px #ccc;font-size:12px}
                </style>
                </head>
                <body>\n<br>
                <b style='font-size:12px'><span style='font-size:16px;color:#e297a0'>Your site</span><br><br><br>
                Connection to database through XML-export/import</b><br><br>
                <hr size=1 noshadow>
                <i class=s12>
                  <a href='{$_SERVER['PHP_SELF']}'>Home</a></i>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                  <a href='http://autopatrul.ru/xml'><i>Documentation autopatrul.ru</i></a><br><br>\n";
// Time
        $mtime = explode(" ", microtime());
        $start_time = $mtime [1] + $mtime[0];
    }

    function footer_out($start_time) {
        $mtime = explode(" ", microtime()); // Time
        $end_time = $mtime [1] + $mtime[0];
        $total_time = ($end_time - $start_time);
        echo "\n\n<br><br><br><p class=copy style='line-height:1.2em'>
                        <a class=copy href='http://avto.jp'>2008 &copy; Avto.Jp</a>&nbsp;&nbsp;&nbsp;&nbsp;
                        <span style='color:#f00'>time " . round($total_time, 3) . " sec</span><br><br>
                        </p>
                </body>
                </html>";
    }

}

?>