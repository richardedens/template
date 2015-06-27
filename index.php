<?php

date_default_timezone_set("Europe/Amsterdam");
error_reporting(E_ALL);
ini_set('display_errors', 1);

if ($_SERVER['REDIRECT_URL'] == "/") {
	$page = file_get_contents("theme/default/default.html");
} else {
	if (file_exists("theme/default" . $_SERVER['REDIRECT_URL'])) {
		$page = file_get_contents("theme/default" . $_SERVER['REDIRECT_URL']);
	}
}

if ($handle = opendir("theme/default/parts/")) {
	while (false !== ($file = readdir($handle))) {
		if ('.' === $file) continue;
		if ('..' === $file) continue;

		$part = file_get_contents("theme/default/parts/" . $file);
		$page = str_replace("{{" . $file . "}}", $part, $page);
	}
	closedir($handle);
}

header("Content-Type: text/html");
echo $page;