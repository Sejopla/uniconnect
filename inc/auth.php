<?php
require_once __DIR__ . "/config.php";

function require_login() {
  if (!isset($_SESSION["user_id"])) {
    header("Location: login.php");
    exit;
  }
}
