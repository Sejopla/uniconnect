<?php
require_once __DIR__ . "/inc/auth.php";
require_login();
?>
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <title>UniConnect – Ders Programım</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="css/style.css">
  <link rel="stylesheet" href="css/holiday.css">
  <link rel="icon" type="image/png" href="img/uniConnect.png">
</head>
<body class="theme-light" data-page="dashboard">

<header class="site-header">
  <div class="container header-inner">
    <div class="logo" data-logo>
      <img src="img/uniConnect.png" alt="Logo">
      <span>UniConnect</span>
    </div>

    <nav class="top-nav">
      <a class="nav-link" href="dashboard.php">Ders Programım</a>
      <a class="nav-link" href="schedule.html">Programı Düzenle</a>
      <a class="nav-link" href="friends.html">Arkadaşlar</a>
      <a class="nav-link" href="shared.html">Ortak Boş Saat</a>
      <a class="nav-link" href="profile.html">Profil</a>
      <a class="nav-link" href="settings.html">Ayarlar</a>
      <a class="nav-link" href="media.html">Media</a>
    </nav>

    <div class="userbox">
      <span id="currentUserEmail" class="user-email muted small"><?php echo htmlspecialchars($_SESSION["full_name"] ?? ""); ?></span>
      <a id="btnLogout" class="btn-small" href="logout.php">Çıkış</a>
    </div>
  </div>
</header>

<main class="container layout">
  <aside class="sidebar">
    <div class="card">
      <div class="side-title">Menü</div>
      <div class="side-nav">
        <a class="side-link" href="dashboard.php">Ana Sayfa</a>
        <a class="side-link" href="schedule.html">Programı Düzenle</a>
        <a class="side-link" href="friends.html">Arkadaşlar</a>
        <a class="side-link" href="shared.html">Ortak Boş Saat</a>
        <a class="side-link" href="messages.html">Mesajlar</a>
        <a class="side-link" href="notifications.html">Bildirimler</a>
        <a class="side-link" href="resources.html">Dış Linkler</a>
      </div>
    </div>
  </aside>

  <section>
    <div class="card">
      <h1>Ders Programım</h1>
      <p class="muted">
        Aşağıda haftalık programının son kaydedilmiş hali var.
        Düzenlemek için <strong>Programı Düzenle</strong> sayfasına git.
      </p>
    </div>

    <div class="card">
      <h2>Haftalık Program</h2>
      <p class="muted small">Burada yalnızca görüntülenir.</p>
      <div id="dashboardSchedule" style="margin-top:12px"></div>
    </div>
  </section>

  <aside class="rightbar">
    <div class="card">
      <h3>Özet</h3>
      <ul class="muted small" style="margin:0;padding-left:18px">
        <li><strong>Öğrenci:</strong> <span id="dashboardUserName"><?php echo htmlspecialchars($_SESSION["full_name"] ?? ""); ?></span></li>
        <li><strong>Gün:</strong> Pzt–Cum</li>
        <li><strong>Saat:</strong> 09:00–17:00</li>
      </ul>
    </div>

    <div class="card">
      <h3>Kısa Yol</h3>
      <a class="btn-primary" href="schedule.html" style="width:100%;text-align:center">Programı Düzenle</a>
    </div>
  </aside>
</main>

<footer class="site-footer">
  <div class="container footer-inner">
    <span>© 2025 UniConnect</span>
    <span><a href="contact.html">İletişim</a> · <a href="media.html">Medya</a> · <a href="about.html">Hakkında</a></span>
  </div>
</footer>

<div id="holidayLayer" class="holiday-layer hidden" aria-hidden="true"></div>
<script src="js/app.js"></script>
<script src="js/holiday.js"></script>
</body>
</html>

