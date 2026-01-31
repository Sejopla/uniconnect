<?php
require_once __DIR__ . "/inc/config.php";

$error = "";

if ($_SERVER["REQUEST_METHOD"] === "POST") {
  $full_name = trim($_POST["full_name"] ?? "");
  $email = trim($_POST["email"] ?? "");
  $password = $_POST["password"] ?? "";

  if ($full_name === "" || $email === "" || $password === "") {
    $error = "Tüm alanları doldur.";
  } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $error = "Email formatı hatalı.";
  } elseif (strlen($password) < 6) {
    $error = "Şifre en az 6 karakter olmalı.";
  } else {

    $stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $stmt->store_result();

    if ($stmt->num_rows > 0) {
      $error = "Bu email zaten kayıtlı.";
    } else {
      $hash = password_hash($password, PASSWORD_DEFAULT);
      $stmt2 = $conn->prepare("INSERT INTO users (full_name, email, password_hash) VALUES (?, ?, ?)");
      $stmt2->bind_param("sss", $full_name, $email, $hash);
      $stmt2->execute();

      header("Location: login.php?registered=1");
      exit;
    }
  }
}
?>
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Register - UniConnect</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <div style="max-width:420px;margin:40px auto;">
    <h2>Create Account</h2>

    <?php if ($error): ?>
      <div style="padding:10px;border:1px solid #f00;margin-bottom:10px;"><?php echo htmlspecialchars($error); ?></div>
    <?php endif; ?>

    <form method="post">
      <label>Full Name</label>
      <input name="full_name" required style="width:100%;padding:10px;margin:6px 0">

      <label>Email</label>
      <input name="email" type="email" required style="width:100%;padding:10px;margin:6px 0">

      <label>Password</label>
      <input name="password" type="password" required style="width:100%;padding:10px;margin:6px 0">

      <button type="submit" style="width:100%;padding:10px;margin-top:10px;">Register</button>
    </form>

    <p style="margin-top:10px;">Already have an account? <a href="login.php">Login</a></p>
  </div>
</body>
</html>
