<?php
require_once __DIR__ . "/inc/config.php";

$error = "";
$registered = isset($_GET["registered"]);

if ($_SERVER["REQUEST_METHOD"] === "POST") {
  $email = trim($_POST["email"] ?? "");
  $password = $_POST["password"] ?? "";

  if ($email === "" || $password === "") {
    $error = "Email ve şifre gir.";
  } else {
    $stmt = $conn->prepare("SELECT id, full_name, password_hash FROM users WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $res = $stmt->get_result();
    $user = $res->fetch_assoc();

    if (!$user || !password_verify($password, $user["password_hash"])) {
      $error = "Email veya şifre hatalı.";
    } else {
      $_SESSION["user_id"] = $user["id"];
      $_SESSION["full_name"] = $user["full_name"];
      header("Location: dashboard.php");
      exit;
    }
  }
}
?>
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Login - UniConnect</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <div style="max-width:420px;margin:40px auto;">
    <h2>Login</h2>

    <?php if ($registered): ?>
      <div style="padding:10px;border:1px solid #0a0;margin-bottom:10px;">Kayıt başarılı. Giriş yapabilirsin.</div>
    <?php endif; ?>

    <?php if ($error): ?>
      <div style="padding:10px;border:1px solid #f00;margin-bottom:10px;"><?php echo htmlspecialchars($error); ?></div>
    <?php endif; ?>

    <form method="post">
      <label>Email</label>
      <input name="email" type="email" required style="width:100%;padding:10px;margin:6px 0">

      <label>Password</label>
      <input name="password" type="password" required style="width:100%;padding:10px;margin:6px 0">

      <button type="submit" style="width:100%;padding:10px;margin-top:10px;">Login</button>
    </form>

    <p style="margin-top:10px;">No account? <a href="register.php">Register</a></p>
  </div>
</body>
</html>
