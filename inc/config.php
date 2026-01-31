<?php

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

$DB_HOST = "localhost";
$DB_USER = "root";
$DB_PASS = "";        
$DB_NAME = "uniconnect";

$conn = new mysqli($DB_HOST, $DB_USER, $DB_PASS, $DB_NAME);
$conn->set_charset("utf8mb4");

session_start();
