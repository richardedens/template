<?php

/**
 * MangoICT - cms mini core.
 * -------------------------
 * Minimum vital content management system architecture.
 * Truely a little piece of master work.
 */

// Start a session
session_start();

// Truely start a session!
if( !isset($_SESSION['last_access']) || (time() - $_SESSION['last_access']) > 60 ) 
{
    $_SESSION['last_access'] = time();
}

// Show all errors
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Redirect to a HTTPS connection
if ($_SERVER["HTTP_HOST"] != "localhost:8080") {    
    if (isset($_SERVER['HTTPS']) == false) 
    {
        $protocol = "https://";
        $address = $protocol.$_SERVER["SERVER_NAME"]."/";
        header("Location: " . $address);
        die;
    }  
} 

// Get theme folder to use
$theme = "default";

// Parse the url
$url = parse_url($_SERVER['REQUEST_URI']);

// Get default HTML page
$page = file_get_contents("./theme/" . $theme . "/default.html");

// Go to default page when clicking on the home button.
if ($url["path"] == "/") 
{
    $url["path"] = "default";
}

// Check for a REST services request!
if (is_dir("./" . $url["path"]) && is_file("./" . $url["path"] . "/srv.php"))
{
    require_once("./" . $url["path"] . "/srv.php");
    if ($url["path"] != "/editor/") {
        $srv = new srv();
        $srv->execute();
    }
} else {

    // Check if a page exists from the URL provided
    if (is_file("./theme/" . $theme . $url["path"] . ".html")) 
    {
        $page = file_get_contents("./theme/" . $theme . $url["path"] . ".html");
    }

    // Get page parts (seperate HTML files)
    $parts = array();
    if ($handle = opendir("./theme/" . $theme . "/parts"))
    {
        // This is the correct way to loop over the directory.
        while (false !== ($entry = readdir($handle))) {
            if($entry != "." && $entry != ".." && is_file("./theme/" . $theme . "/parts/" . $entry)) 
            {
                $parts[$entry] = file_get_contents("./theme/" . $theme . "/parts/" . $entry);
            }
        }
        closedir($handle);
    }

    // Interper template parts in the page. For now do this 30 times to go 30 layers deap.
    for($i = 0; $i < 30;$i++){
        foreach ($parts as $key => $value)
        {
            $page = str_replace("{{" . $key . "}}", $value, $page);
        }
    }
    
    // Add angular and the app
    $page = str_replace("{{" . $key . "}}", $value, $page);
    
    // Include scripts
    $page = str_replace("<html", "<html data-ng-app=\"mango\"", $page);
    $page = str_replace("<html", "<body data-ng-controller=\"mango-heart\"", $page);
    $page = str_replace("</body>", "        <!-- Mango - AngularJS - System -->
        <script src=\"js/jquery-1.11.3.min.js\"></script>
        <script src=\"js/bootstrap.min.js\"></script>
        <script src=\"js/Chart.min.js\"></script>
        <script src=\"js/async.js\"></script>
        <script src=\"js/angular.min.js\"></script>
		<script src=\"js/ui-bootstrap-0.13.0.min.js\"></script>
        <script src=\"app/lib/mangosys.js\"></script>
        <script src=\"app/mango-angular.js\"></script>
    </body>", $page);

    // Output HTML page
    header("Content-Type: text/html");
    echo $page;

}