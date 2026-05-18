<?php 
require_once("config.php");
// Turn off all error reporting
error_reporting(0);
?>
<?php
 //$formsubtype = $_REQUEST['formsubtype'];
if(isset($_REQUEST['email'])) {
 // EDIT THE 2 LINES BELOW AS REQUIRED
 
 $formsubtype = $_REQUEST['formsubtype'];
// send email
// Always set content-type when sending HTML email
$headers = "MIME-Version: 1.0" . "\r\n";
$headers .= "Content-Type: text/html; charset=ISO-8859-1\r\n"; 
	
	if($formsubtype=="admissionenquiry"){
		 $name = $_REQUEST['name']; // required
		 $mobilenumber = $_REQUEST['phone']; // required
		 $email = $_REQUEST['email']; // not required
		 $statename = $_REQUEST['statename'];
	     $cityname = $_REQUEST['cityname'];
	     $location = $_REQUEST['location'];
	     $str = $_REQUEST['location'];
	     $pieces = explode("$$", $str);
	     $email_to = $pieces[2];
		 $email_message="";
	     $email_message .= "Name: ".$name."<br>";
		 $email_message .= "Email: ".$email."<br>";
		 $email_message .= "Mobilenumber: ".$mobilenumber."<br>";
	     $email_message .= "Statename: ".$statename."<br>";
	     $email_message .= "Cityname: ".$cityname."<br>";
	     $email_message .= "Location: ".$location."<br>";
	
		 $sql = $DB->prepare("INSERT INTO KidsEnquiry (Name,Mobileno,Email,State,City,Location,EnquiryType,CreatedDate) values('".$name."','".$mobilenumber."','".$email."','".$statename."','".$cityname."','".$location."','".$formsubtype."','".date("Y-m-d")."')");
		 $email_subject = "Admission Enquiry From Website"; 
         $sql->execute();
		 $headers .= "From: info@timekidspreschools.com"."\r\n";
         //mail($email_to,$email_subject,$email_message,$headers);
		 header('Location: index.php?sm=ind');
	 }
	 else if($formsubtype=="franchiseopportunity"){
	     $name = $_REQUEST['name']; // required
		 $mobilenumber = $_REQUEST['mob']; // required
		 $email = $_REQUEST['email']; // not required
		 $statename = $_REQUEST['state'];
	     $cityname = $_REQUEST['city'];
	     $location = $_REQUEST['location'];
		 if ($cityname=="Others")
		 {
			$cityname = $_REQUEST['city1']; 
		 }
		 
		 //code added newly///////////////////
		 $refno="2021";
		 $source = $_REQUEST['source'];
		 //$source="bdf";
		 
		 if ($source=="Othersource")
		 {
			$source = $_REQUEST['source1']; 
		 }
		 
		 $status="0";
		 $query_fr = "SELECT MAX(sno) FROM KidsEnquiry"; 
         $stmt_fr = $DB->prepare($query_fr); $stmt_fr->execute();
         $allpgcont_fr = $stmt_fr->fetchAll();
         foreach ($allpgcont_fr as $row_fr) 
         {
          $maxno=$row_fr['MAX(sno)'];
         }
		 $sno_new=intval($maxno)+1;
         if (intval($maxno)<=8){
		 $refno=$refno."000".$sno_new;}
         
         if (intval($maxno)>=9 and intval($maxno)<=98){
            $refno=$refno."00".$sno_new;}
         
        if (intval($maxno)>=99 and intval($maxno)<=999){
            $refno=$refno."0".$sno_new;}
        
        if (intval($maxno)>=999){
            $refno=$refno.$sno_new;}
        
		$body="<font size=2 face=verdana><b>Dear ".$name.",</b><br><br>Thank you for showing interest in taking up franchise of T.I.M.E. Kids Pre-schools. Our representative will contact within 2 working days.<br><br>";
		$body=$body."<font size=2 face=verdana><b>Your Reference No is ".$refno." .<br><br>";
		$body= $body."Regards, <br> <font face=Berlin Sans FB Demi bold>T.I.M.E.</font> Kids<br><br>";
		$body= $body."</font>";
   
		$body1="<table border='1' cellpading='1' cellspacing='1' width='600px' style='font-family:verdana; font-size:12px;'<tr><td>Name:</td><td>".$name."</td></tr>";
		$body1=$body1."<tr><td>Email id:</td><td>". $email."</td></tr>";
		$body1=$body1."<tr><td>Phone no:</td><td>".$mobilenumber."</td></tr>";
		$body1=$body1."<tr><td>City:</td><td>".$cityname."</td></tr>";
		$body1=$body1."<tr><td>State:</td><td>".$statename."</td></tr>";
		$body1=$body1."<tr><td>RefNo:</td><td>".$refno."</td></tr>";
		$body1=$body1."<tr><td>Source:</td><td>".$source."</td></tr>";
		$body1=$body1."</table>";
		
		$headers .= "From: franchise@timekidspreschools.com"."\r\n";
		$subject="T.I.M.E. Kids franchise opportunity";
		//Database insertion****************************************
		
		//$select = "SELECT Name,State,Mobileno FROM KidsEnquiry WHERE Name='".$name."' and State='".$statename."' and Mobileno='".$mobilenumber."' and EnquiryType='".$formsubtype."'";
		
		if(strpos($name, "?") !== false)
		{
		  header('Location: franchise-opportunity.php?sm=ind');
		}
		else
		{
		$sql = $DB->prepare("INSERT INTO KidsEnquiry (Name,Mobileno,Email,State,City,Location,EnquiryType,CreatedDate,refno,Status,Source) values('".$name."','".$mobilenumber."','".$email."','".$statename."','".$cityname."','".$location."','".$formsubtype."','".date("Y-m-d")."','".$refno."','0','".$source."')");
		//$sql1 = $DB->prepare("INSERT INTO franchisee_conversion (Refno) values('".$name."','".$mobilenumber."','".$email."','".$statename."','".$cityname."','".$location."','".$formsubtype."','".date("Y-m-d")."','".$refno."','0','".$source."')");
		$sql->execute();
		//$sql1->execute();
		//**********************************************************
		
		//Database insertion into Franchisee Conversion Table****************************************
		$created_date = strtotime(date('d-m-Y'));
		
		
		
		
		/*$sql_insert = $DB->prepare("INSERT INTO KidsEnquiry (Name,Mobileno,Email,State,City,Location,EnquiryType,CreatedDate,Refno,Status,Source) values('".$name."','".$mobilenumber."','".$email."','".$statename."','".$cityname."','".$location."','".$formsubtype."','".date("Y-m-d")."','".$refno."','0','".$source."')");*/
		$sql_insert = $DB->prepare("INSERT INTO franchisee_conversion(Refno,Created_Date) VALUES ('".$refno."','".$created_date."')");
		$sql_insert->execute();
		//**********************************************************
		mail($email,$subject,$body,$headers);    
				
        $email1="info@timekidspreschools.com";
		$subject1="Landing page enquiry details-IMP";
		
		
		$sql_stateemails="select count(*) as counts from Franchise_Enquiry_Emailids where State='".$statename."'";
		$stmt_statemails = $DB->prepare($sql_stateemails); 
		$stmt_statemails->execute();
		$stateemil = $stmt_statemails->fetchAll();
		foreach ($stateemil as $rowi)
		{
		 $stemailcount=$rowi["counts"];
		}
        //echo $stemailcount;
		//exit;
		if($stemailcount==1)
        {
		    $query_frlc = "SELECT Emailids,Mobilenos FROM Franchise_Enquiry_Emailids where State='".$statename."'"; 
			//echo $query_frlc."<br>";
			//exit;
			 $stmt_frlc = $DB->prepare($query_frlc);
			 $stmt_frlc->execute();
			 $allpgcont_frlc = $stmt_frlc->fetchAll();
			 
			 foreach ($allpgcont_frlc as $row_frlc) 
			 {
			  $cc1=$row_frlc['Emailids'].",franchise@timekidspreschools.com";
			  $mbno=$row_frlc['Mobilenos'];
			 }
		} 
        else
		{
         $cc1="jayesh@timekidspreschools.com,payalmahajan@timekidspreschools.com,Jayesh@time4education.com,franchise@timekidspreschools.com";
		 $mbno="9550049494,8977664947,9769933897,9866178088,7989281696,8639152089";
		}  		 
       
       
	   //$bcc1="jayesh@timekidspreschools.com,payalmahajan@timekidspreschools.com,franchise@timekidspreschools.com";
	   $headers1 = "MIME-Version: 1.0" . "\r\n";
       $headers1 .= "Content-Type: text/html; charset=ISO-8859-1\r\n"; 
	   $headers1 .= "From: franchise@timekidspreschools.com"."\r\n";
	   $headers1 .= "CC: ".$cc1."\r\n";
       //$headers1 .= "BCC: ".$bcc1."\r\n";
	   
       mail($email1,$subject1,$body1,$headers1);
	   
	   /*****************MOBILE OTP SERVICE STARTS*********************/

			//$mobileno="8977664947,9769933897"; //9
			  
			//$otpno   = $sub; //90
			//if($mobileno !='' || $otpno !=''){
			//New Franchisee lead generated @ <DATETIME> with <RefID> <Text>
			
			
			
			//echo $otpno;


			//$message='Dear Student, One time password (OTP) to complete your registration is : '.$otpno;
			$message='T.I.M.E. Kids Franchisee lead generated @ '.date("Y-m-d").' with '.$refno.' Name : '.$name.' Mobile :'.$mobilenumber.' Email :'.$email.' State :'.$statename.' City:'.$cityname.' Source:'.$source;
            
			//$mobileno=$mbno;
			
			$std_mob   = $mbno;
			
			//$std_mob   = "8977664947,9769933897";

			//echo $std_mob;

			$someArray = [];

			array_push($someArray, ['to'=>$std_mob ,'message'=> $message]);

			$mobile_nos = json_encode($someArray);

			//$API_Key="Ab3ad9743da5a692703189e3b7aba79b2";
			$API_Key="Aced058272a8f3033e46e1b722a70a611";    
			$method="sms.json";  
			$sender="MYTIME";    


			//$json='{"sender":"MYTIME","sms":'.$mobile_nos.',"unicode":"auto","flash":0,"dlrurl":"http://alerts.kaleyra.com"}';
			
			//$json='{"sender":"MYTIME","sms":'.$mobile_nos.',"unicode":"auto","flash":0,"dlrurl":"http://alerts.kaleyra.com","template_id":1207162866786662698}';
			$json='{"sender":"MYTIME","sms":'.$mobile_nos.',"unicode":"auto","flash":0,"dlrurl":"http://alerts.kaleyra.com"}';


			$arr2 = array('api_key'=>$API_Key,'method' => $method, 'sender' => $sender, 'json' => $json);

			$baseurl = 'https://api-alerts.kaleyra.com/v4/';  

			$uri2 = http_build_query($arr2, '', '&');
			$uri2 = str_replace (array('+',' '), '%20', $uri2);
			$url2 = sprintf("%s?%s", $baseurl, $uri2);

			// Send the POST request with cURL
			$ch = curl_init($baseurl);
			curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
			curl_setopt($ch, CURLOPT_POST, true);
			curl_setopt($ch, CURLOPT_POSTFIELDS, $arr2);
			curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
			$response = curl_exec($ch);
			curl_close($ch);
			
			}
			
			/*****************MOBILE OTP SERVICE ENDS*********************/
	   
	   
       if($source=="bdf"){
	   header('Location: franchise-opportunity.php?sm=ind');}
	   
	   else if($source=="facebook"){
		   header('Location: franchise-opportunity1.php?sm=ind');
	   }
	   else if($source=="google"){
		   header('Location: franchise-opportunity2.php?sm=ind');
	   }
	   else if($source=="Google-Remarketing"){
		   header('Location: franchise-opportunity-gm.php?sm=ind');
	   }
	   else if($source=="SMS"){
		   header('Location: franchise-opportunity5.php?sm=ind');
	   }
	   else if($source=="Email"){
		   header('Location: franchise-opportunity4.php?sm=ind');
	   }
	   else if($source=="Parent"){
		   header('Location: franchise-opportunity3.php?sm=ind');
	   }
	   else if($source=="Website"){
		   header('Location: franchise-opportunity.php?sm=ind');
	   }
	   
	   else
	   {
		   header('Location: franchise-opportunity-rm.php?sm=ind');
	   }
	   
	}
	else if($formsubtype=="contactus"){
	     $email_to = "info@timekidspreschools.com";
		// $email_to = "kalyan@time4education.com";
		 $name = $_REQUEST['name']; // required
	     $mobilenumber = $_REQUEST['phone']; // required
		 $email = $_REQUEST['email']; // not required
		 $message = $_REQUEST['message']; // required
		 $email_message="";
	     $email_message .= "Name: ".$name."<br>";
		 $email_message .= "Email: ".$email."<br>";
		 $email_message .= "Mobilenumber: ".$mobilenumber."<br>";
	     $email_message .= "Message: ".$message."<br>";
		 $sql = $DB->prepare("INSERT INTO KidsEnquiry (Name,Mobileno,Email,EnquiryType,Message,CreatedDate) values('".$name."','".$mobilenumber."','".$email."','".$formsubtype."','".$message."','".date("Y-m-d")."')");
		 //$email_subject = "Enquiry From Website from ".$formsubtype; 
		 $email_subject = "Contact Us Enquiry From Website"; 
         $sql->execute();
		// $headers .= "From: info@timekidspreschools.com"."\r\n";
		 $headers .= "From: info@timekidspreschools.in"."\r\n";
		 //mail($email_to,$email_subject,$email_message,$headers);
		 header('Location: contact-us.php?sm=ind');
	}
	else if($formsubtype=="admissionenquiry_parent"){
		$parentname = $_REQUEST['parentname'];
		$childname = $_REQUEST['childname'];
        $childage = $_REQUEST['childage'];
		$email = $_REQUEST['email']; // not required
		$mobilenumber = $_REQUEST['mobilenumber'];
		$stateid = $_REQUEST['statename'];
	    $cityid = $_REQUEST['cityname'];
	    $location = $_REQUEST['location'];
	    $str = $_REQUEST['location'];
	    //$pieces = explode("$$", $str);
		
		$query_frlc = "SELECT cityname,statename,email FROM franchise where areaname='".$location."'"; 
		//echo $query_frlc."<br>";
		//exit;
         $stmt_frlc = $DB->prepare($query_frlc);
		 $stmt_frlc->execute();
         $allpgcont_frlc = $stmt_frlc->fetchAll();
         foreach ($allpgcont_frlc as $row_frlc) 
         {
          $statename=$row_frlc['cityname'];
		  $cityname=$row_frlc['statename'];
		  $email_to=$row_frlc['email'];
         }
		//echo $email_to."<br>";
	    //$email_to = $pieces[2];
		
		 
		 
		
		$email_message="";
	    $email_message .= "Parentname: ".$parentname."<br>";
		$email_message .= "ChildName: ".$childname."<br>";
		$email_message .= "ChildAge: ".$childage."<br>";
		$email_message .= "Email: ".$email."<br>";
		$email_message .= "Mobilenumber: ".$mobilenumber."<br>";
	    $email_message .= "Statename: ".$statename."<br>";
	    $email_message .= "Cityname: ".$cityname."<br>";
	    $email_message .= "Location: ".$location."<br>";
		$sql = $DB->prepare("INSERT INTO KidsEnquiry (Name,Mobileno,Email,State,City,Location,EnquiryType,ParentName,ChildName,ChildAge,CreatedDate) values('".$parentname."','".$mobilenumber."','".$email."','".$statename."','".$cityname."','".$location."','".$formsubtype."','".$parentname."','".$childname."','".$childage."','".date("Y-m-d")."')");
		//$email_subject = "Enquiry From Website from ".$formsubtype; 
		$email_subject = "Admission Enquiry with Child Details From Website - IMP"; 
        $sql->execute();
		 
		 //echo $email_message;
		 $from_email='info@timekidspreschools.com';
// 1. Define the required variables
	

// 1. Correct the From header format for better compatibility
$headers = "From: TIMEKIDS Admission Enquiry <info@timekidspreschools.com>\r\n";

$headers .= "Reply-To: info@timekidspreschools.com\r\n";

$headers .= "CC: admissionleads@timekidspreschools.com\r\n"; 

$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-type: text/html; charset=UTF-8\r\n";

// CRITICAL FIX: Add \r\n to the X-Mailer header!
$headers .= "X-Mailer: PHP/" . phpversion() . "\r\n"; 
// Note: This is the LAST header, but it still needs \r\n 
// to ensure the body starts on a new line.

$to = explode(",",$email_to);
$cc1="admissionleads@timekidspreschools.com";

$cc = explode(",",$cc1); 

$email_from="info@timekidspreschools.com";

$subject=$email_subject;
$body=$email_message;
$attachments = [];


echo $to;

$result = Send_eMail_sendgrid(
			$to,        // To address as array
			$email_from,  // From address
			$cc,           // CC
			[],           // BCC
			$subject,     // Subject
			$body,        // Body
			$attachments  // Attachments
		);

		if ($result['status'] == 202 || $result['status'] == 200) {
			// Mail sent successfully
			//unlink($filename);
			//echo "Mail sent successfully";
			//exit;
		} else {
			//echo "Mail send ERROR via SendGrid!";
			
		}

/*if (mail($email_to, $email_subject, $email_message, $headers)) {
echo "Email successfully sent to $email_to!";
} else {
    echo "Email sending failed.";
}*/
		 //print_r($result);
		 //exit;

		 
		 //header('Location: https://www.time4education.com/landingpage_enquiry/timekids-admission-emil.php?subject='.$email_subject.'&email_message='.$email_message.'&from_email='.$from_email.'&to_email='.$email_to.'');
		 header('Location: https://www.timekidspreschools.in/admission.php?sm=ind');	
	 }
}
    
//echo '<script language="javascript">';
//echo 'alert("Thank you for contactng us, Our team will soon contact you")';
//echo '</script>';	


?>