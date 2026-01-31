/* =========================================================
   UniConnect - app.js (FULL PROJECT)
   - Login (index.html) + admin demo credentials
   - Theme (light/dark)
   - Holiday snow toggle
   - Courses (admin adds) -> students pick
   - Schedule: schedule.html edit, dashboard.html view
   - Friends + Shared free slots
   - Profile + Settings persistence
   - Admin pages: admin-dashboard, admin-users, admin-courses
   - Legacy admin.html supported too
   ========================================================= */

(function(){
  "use strict";

  /* ---------- Helpers ---------- */
  const $  = (s, r=document)=>r.querySelector(s);
  const $$ = (s, r=document)=>Array.from(r.querySelectorAll(s));

  const escapeHtml = (str)=>String(str ?? "").replace(/[&<>"']/g, (m)=>({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[m]));

  const loadJson = (k, fallback)=>{
    try{
      const raw = localStorage.getItem(k);
      return raw ? JSON.parse(raw) : fallback;
    }catch(_e){
      return fallback;
    }
  };
  const saveJson = (k, v)=>localStorage.setItem(k, JSON.stringify(v));

  const nowISO = ()=>{
    const d = new Date();
    const p = (n)=>String(n).padStart(2,"0");
    return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
  };

  /* ---------- Storage Keys ---------- */
  const LS = {
    CURRENT_USER: "uc_current_user_v2",
    USERS:        "uc_users_v2",
    THEME:        "uc_theme_v2",
    HOLIDAY:      "uc_holiday_v2",
    PROFILE:      "uc_profile_v2",
    COURSES:      "uc_courses_v2",
    SCHEDULES:    "uc_schedules_v2",
    SELECTED_FRIEND: "uc_selected_friend_v2",
    ADMIN_LOGS:   "uc_admin_logs_v2",
  };

  /* ---------- Constants ---------- */
  const ALLOWED_DOMAINS = ["@baskent.edu.tr", "@mail.baskent.edu.tr"];
  const ADMIN_DEMO = { email:"admin@baskent.edu.tr", password:"admin123", role:"admin", name:"Admin" };

  const DAYS = [
    { key:"mon", label:"Pazartesi" },
    { key:"tue", label:"Salı" },
    { key:"wed", label:"Çarşamba" },
    { key:"thu", label:"Perşembe" },
    { key:"fri", label:"Cuma" },
  ];
  const HOURS = [9,10,11,12,13,14,15,16,17];

  /* ---------- User ---------- */
  const getCurrentUser = ()=>loadJson(LS.CURRENT_USER, null);
  const setCurrentUser = (u)=>saveJson(LS.CURRENT_USER, u);

  const isAllowedEmail = (email)=>{
    const e = (email||"").trim().toLowerCase();
    return ALLOWED_DOMAINS.some(d=>e.endsWith(d));
  };

  function upsertUser(email, role, name){
    const list = loadJson(LS.USERS, []);
    const key = (email||"").toLowerCase();
    const idx = list.findIndex(x=>(x.email||"").toLowerCase()===key);
    const row = {
      email,
      role: role || "ogrenci",
      name: name || email,
      lastSeen: nowISO()
    };
    if(idx>=0) list[idx] = { ...list[idx], ...row };
    else list.push(row);
    saveJson(LS.USERS, list);
  }

  function requireAuth(){
    const page = document.body?.dataset?.page || "";
    if(page === "login") return true;

    const u = getCurrentUser();
    if(!u){
      window.location.href = "index.html";
      return false;
    }
    upsertUser(u.email, u.role, u.name);
    return true;
  }

  function requireAdmin(){
    const u = getCurrentUser();
    if(!u || u.role !== "admin"){
      alert("Bu sayfa sadece admin içindir.");
      window.location.href = "dashboard.html";
      return false;
    }
    return true;
  }

  function logout(){
    localStorage.removeItem(LS.CURRENT_USER);
    window.location.href = "index.html";
  }

  /* ---------- Theme ---------- */
  function applyTheme(theme){
    document.body.classList.remove("theme-light","theme-dark");
    document.body.classList.add(theme === "dark" ? "theme-dark" : "theme-light");
  }
  function initTheme(){
    const theme = localStorage.getItem(LS.THEME) || "light";
    applyTheme(theme);

    const themeSelects = [
      $("#settingsTheme"), $("#pTheme")
    ].filter(Boolean);

    themeSelects.forEach(sel=>{
      sel.value = theme;
      sel.addEventListener("change", ()=>{
        const v = sel.value === "dark" ? "dark" : "light";
        localStorage.setItem(LS.THEME, v);
        applyTheme(v);
      });
    });
  }

  /* ---------- Holiday Snow ---------- */
  function ensureHolidayLayer(){
    let layer = $("#holidayLayer");
    if(!layer){
      layer = document.createElement("div");
      layer.id="holidayLayer";
      layer.className="holiday-layer hidden";
      layer.setAttribute("aria-hidden","true");
      document.body.appendChild(layer);
    }
    return layer;
  }

  function startSnow(layer){
    layer.innerHTML = "";
    const density = 40;
    for(let i=0;i<density;i++){
      const s = document.createElement("div");
      s.className = "snowflake";
      const left = Math.random()*100;
      const size = 4 + Math.random()*6;
      const dur = 6 + Math.random()*8;
      const delay = Math.random()*6;
      s.style.left = `${left}vw`;
      s.style.width = `${size}px`;
      s.style.height = `${size}px`;
      s.style.animationDuration = `${dur}s`;
      s.style.animationDelay = `${delay}s`;
      layer.appendChild(s);
    }
  }

  function setHolidayEnabled(on){
    localStorage.setItem(LS.HOLIDAY, on ? "1" : "0");
    const layer = ensureHolidayLayer();
    layer.classList.toggle("hidden", !on);
    if(on) startSnow(layer); else layer.innerHTML = "";
  }

  function initHoliday(){
    const saved = localStorage.getItem(LS.HOLIDAY);
    if(saved === null){
      // default: off
      localStorage.setItem(LS.HOLIDAY, "0");
    }
    const on = localStorage.getItem(LS.HOLIDAY) === "1";
    setHolidayEnabled(on);

    const holidayToggle = $("#holidayToggle");
    if(holidayToggle){
      holidayToggle.checked = on;
      holidayToggle.addEventListener("change", ()=>{
        setHolidayEnabled(holidayToggle.checked);
      });
    }
  }

  /* ---------- Header / Nav ---------- */
  function initHeader(){
    const u = getCurrentUser();
    const emailEl = $("#currentUserEmail");
    if(emailEl && u) emailEl.textContent = u.email;

    const logoutBtn = $("#btnLogout");
    if(logoutBtn) logoutBtn.addEventListener("click", logout);

    // logo click
    $$("[data-logo]").forEach(el=>{
      el.addEventListener("click", ()=>{
        const user = getCurrentUser();
        if(!user){ window.location.href="index.html"; return; }
        if((document.body?.dataset?.page||"").startsWith("admin")) window.location.href="admin-dashboard.html";
        else window.location.href="dashboard.html";
      });
    });

    // active links
    const cur = (location.pathname.split("/").pop() || "").toLowerCase();
    [...$$("a.nav-link"), ...$$("a.side-link")].forEach(a=>{
      const href = (a.getAttribute("href")||"").toLowerCase();
      if(href && href === cur) a.classList.add("active");
    });
  }

  /* ---------- Courses ---------- */
  function loadCourses(){ return loadJson(LS.COURSES, []); }
  function saveCourses(list){ saveJson(LS.COURSES, list || []); }

  function ensureDemoCourses(){
    const cur = loadCourses();
    if(cur.length) return;

    const demo = [
      { code:"BİLP107", name:"İşletim Sistemleri" },
      { code:"BİLP231", name:"İnternet Programcılığı I" },
      { code:"BİLP243", name:"Görsel Programlama I" },
      { code:"BİLP245", name:"Nesneye Yönelik Programlama II" },
      { code:"BİLP252", name:"Staj II" },
      { code:"BİLP264", name:"Siber Güvenlik" },
      { code:"TEKN192", name:"Temel Elektrik ve Elektronik" },
    ];
    saveCourses(demo);
  }

  /* ---------- Schedules ---------- */
  function loadSchedulesAll(){ return loadJson(LS.SCHEDULES, {}); }
  function saveSchedulesAll(obj){ saveJson(LS.SCHEDULES, obj || {}); }
  function getScheduleFor(email){
    const all = loadSchedulesAll();
    return all[email] || {};
  }
  function saveScheduleFor(email, occ){
    const all = loadSchedulesAll();
    all[email] = occ || {};
    saveSchedulesAll(all);
  }

  function ensureDemoSchedules(){
    const all = loadSchedulesAll();
    if(Object.keys(all).length) return;

    all["demo@mail.baskent.edu.tr"] = {
      "mon-9":"BİLP231",
      "mon-10":"BİLP231",
      "wed-13":"BİLP107",
      "fri-15":"BİLP264"
    };
    all["ayse.yilmaz@mail.baskent.edu.tr"] = {
      "tue-9":"BİLP243",
      "thu-14":"BİLP245"
    };
    all["mehmet.kaya@mail.baskent.edu.tr"] = {
      "mon-11":"BİLP107",
      "wed-9":"TEKN192"
    };
    all["elif.demir@mail.baskent.edu.tr"] = {
      "fri-10":"BİLP231"
    };
    saveSchedulesAll(all);
  }

  /* ---------- Course picker ---------- */
  function openCoursePicker(courses, currentValue, callback){
    // fallback if no courses
    if(!courses || !courses.length){
      const input = prompt("Ders adı (boş bırak siler):", currentValue || "");
      callback((input||"").trim());
      return;
    }

    const overlay = document.createElement("div");
    overlay.className = "course-picker-overlay";

    const dialog = document.createElement("div");
    dialog.className = "course-picker-dialog";

    dialog.innerHTML = `
      <h3 style="margin:0 0 6px">Ders Seç</h3>
      <p class="muted small" style="margin:0 0 10px">Bu saat için eklemek istediğin dersi seç.</p>
    `;

    const select = document.createElement("select");
    select.style.width = "100%";

    const optNone = document.createElement("option");
    optNone.value = "";
    optNone.textContent = "— Ders seçme (sil) —";
    select.appendChild(optNone);

    courses.forEach(c=>{
      const opt = document.createElement("option");
      opt.value = c.code;
      opt.textContent = `${c.code} – ${c.name}`;
      if(currentValue && currentValue === c.code) opt.selected = true;
      select.appendChild(opt);
    });

    const row = document.createElement("div");
    row.style.display="flex";
    row.style.justifyContent="flex-end";
    row.style.gap="8px";
    row.style.marginTop="12px";

    const btnCancel = document.createElement("button");
    btnCancel.type="button";
    btnCancel.className="btn-outline btn-small";
    btnCancel.textContent="İptal";

    const btnOk = document.createElement("button");
    btnOk.type="button";
    btnOk.className="btn-primary btn-small";
    btnOk.textContent="Seç";

    row.appendChild(btnCancel);
    row.appendChild(btnOk);

    dialog.appendChild(select);
    dialog.appendChild(row);
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    function close(v){
      document.body.removeChild(overlay);
      callback(v);
    }

    btnCancel.addEventListener("click", ()=>close(currentValue || ""));
    btnOk.addEventListener("click", ()=>close(select.value || ""));

    overlay.addEventListener("click",(e)=>{
      if(e.target === overlay) close(currentValue || "");
    });
  }

  /* ---------- Schedule table renderer ---------- */
  function renderScheduleTable(container, occ, options){
    const interactive = !!options?.interactive;
    const onChange = options?.onChange || function(){};
    const picker = options?.coursePicker || null;

    container.innerHTML = "";

    const table = document.createElement("table");
    table.className = "schedule-table";

    const thead = document.createElement("thead");
    const hr = document.createElement("tr");

    const th0 = document.createElement("th");
    th0.textContent = "Saat";
    hr.appendChild(th0);

    DAYS.forEach(d=>{
      const th = document.createElement("th");
      th.textContent = d.label;
      hr.appendChild(th);
    });
    thead.appendChild(hr);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");

    HOURS.forEach(h=>{
      const tr = document.createElement("tr");

      const tdHour = document.createElement("td");
      tdHour.textContent = `${h}:00`;
      tr.appendChild(tdHour);

      DAYS.forEach(d=>{
        const key = `${d.key}-${h}`;
        const val = occ[key] || "";

        const td = document.createElement("td");
        td.className = "schedule-cell " + (val ? "busy" : "free");
        td.textContent = val ? val : "—";

        if(interactive){
          td.style.cursor = "pointer";
          td.addEventListener("click", ()=>{
            const current = occ[key] || "";
            if(picker){
              picker(current, (selected)=>{
                const v = (selected||"").trim();
                if(!v) delete occ[key];
                else occ[key] = v;
                onChange(occ);
                renderScheduleTable(container, occ, options);
              });
            }else{
              const input = prompt("Ders adı (boş bırak siler):", current);
              if(input === null) return;
              const v = (input||"").trim();
              if(!v) delete occ[key];
              else occ[key] = v;
              onChange(occ);
              renderScheduleTable(container, occ, options);
            }
          });
        }

        tr.appendChild(td);
      });

      tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    container.appendChild(table);
  }

  /* ---------- Pages: Dashboard ---------- */
  function initDashboard(){
    if(document.body?.dataset?.page !== "dashboard") return;

    ensureDemoSchedules();

    const u = getCurrentUser();
    const occ = getScheduleFor(u.email);

    const box = $("#dashboardSchedule");
    if(box) renderScheduleTable(box, occ, { interactive:false });

    const nameEl = $("#dashboardUserName");
    if(nameEl) nameEl.textContent = u.name || u.email;
  }

  /* ---------- Pages: Schedule Editor ---------- */
  function initScheduleEditor(){
    if(document.body?.dataset?.page !== "schedule") return;

    ensureDemoSchedules();
    ensureDemoCourses();

    const u = getCurrentUser();
    let occ = getScheduleFor(u.email);
    const box = $("#scheduleGrid");
    if(!box) return;

    const coursePicker = (current, cb)=>{
      const courses = loadCourses();
      openCoursePicker(courses, current, cb);
    };

    const save = ()=>saveScheduleFor(u.email, occ);

    renderScheduleTable(box, occ, {
      interactive:true,
      onChange:(o)=>{ occ=o; save(); },
      coursePicker
    });

    const btnSave = $("#btnSaveSchedule");
    if(btnSave){
      btnSave.addEventListener("click", ()=>{
        save();
        alert("Program kaydedildi (localStorage).");
      });
    }
  }

  /* ---------- Friends + Shared ---------- */
  function friendsStatic(){
    return [
      { email:"ayse.yilmaz@mail.baskent.edu.tr", name:"Ayşe Yılmaz", dept:"Yazılım Müh." },
      { email:"mehmet.kaya@mail.baskent.edu.tr", name:"Mehmet Kaya", dept:"Bilgisayar Müh." },
      { email:"elif.demir@mail.baskent.edu.tr", name:"Elif Demir", dept:"Endüstri Müh." },
    ];
  }

  function initFriends(){
    if(document.body?.dataset?.page !== "friends") return;

    ensureDemoSchedules();

    const listEl = $("#friendList");
    if(!listEl) return;

    const friends = friendsStatic();
    listEl.innerHTML = "";

    friends.forEach(f=>{
      const card = document.createElement("div");
      card.className="card";
      card.style.boxShadow="none";
      card.innerHTML = `
        <strong>${escapeHtml(f.name)}</strong>
        <div class="muted small">${escapeHtml(f.email)}</div>
        <div class="muted small">Bölüm: ${escapeHtml(f.dept)}</div>
        <div style="margin-top:10px;display:flex;gap:10px;flex-wrap:wrap">
          <button class="btn-primary btn-small" type="button" data-shared="${escapeHtml(f.email)}">Ortak Boş Saat</button>
          <button class="btn-outline btn-small" type="button" data-profile="${escapeHtml(f.email)}">Profili Gör (demo)</button>
        </div>
      `;
      listEl.appendChild(card);
    });

    listEl.addEventListener("click",(e)=>{
      const b = e.target.closest("[data-shared]");
      if(b){
        const email = b.getAttribute("data-shared");
        localStorage.setItem(LS.SELECTED_FRIEND, email);
        window.location.href = "shared.html";
      }
      const p = e.target.closest("[data-profile]");
      if(p){
        alert("Profil (demo): " + p.getAttribute("data-profile"));
      }
    });
  }

  function computeSharedFree(myOcc, frOcc){
    const free = [];
    for(const d of DAYS){
      for(const h of HOURS){
        const k = `${d.key}-${h}`;
        if(!myOcc[k] && !frOcc[k]) free.push(k);
      }
    }
    return free;
  }

  function compressToRanges(hours){
    const nums = hours.map(h=>parseInt(h,10)).sort((a,b)=>a-b);
    if(!nums.length) return [];
    const ranges = [];
    let start = nums[0], prev = nums[0];

    const push = (s,p)=>{
      const pad = (n)=>String(n).padStart(2,"0");
      ranges.push(`${pad(s)}:00–${pad(p+1)}:00`);
    };

    for(let i=1;i<nums.length;i++){
      const cur = nums[i];
      if(cur === prev+1) prev = cur;
      else { push(start, prev); start = prev = cur; }
    }
    push(start, prev);
    return ranges;
  }

  function initShared(){
    if(document.body?.dataset?.page !== "shared") return;

    ensureDemoSchedules();

    const select = $("#friendSelect");
    const out    = $("#sharedFreeList");
    if(!select || !out) return;

    const u = getCurrentUser();
    const schedules = loadSchedulesAll();
    const me = schedules[u.email] || {};

    const friends = friendsStatic();
    const pre = localStorage.getItem(LS.SELECTED_FRIEND);

    select.innerHTML = "";
    friends.forEach(f=>{
      const opt = document.createElement("option");
      opt.value = f.email;
      opt.textContent = `${f.name} (${f.email})`;
      if(pre && pre === f.email) opt.selected = true;
      select.appendChild(opt);
    });

    function render(){
      const frEmail = select.value;
      localStorage.setItem(LS.SELECTED_FRIEND, frEmail);

      const fr = schedules[frEmail] || {};
      const shared = computeSharedFree(me, fr);

      out.innerHTML = "";
      if(!shared.length){
        out.innerHTML = `<div class="muted">Ortak boş saat bulunamadı.</div>`;
        return;
      }

      const byDay = {};
      shared.forEach(x=>{
        const [d,h] = x.split("-");
        (byDay[d] ||= []).push(h);
      });

      const wrap = document.createElement("div");
      wrap.style.display="grid";
      wrap.style.gap="10px";

      DAYS.forEach(d=>{
        const hs = byDay[d.key];
        if(!hs || !hs.length) return;
        const ranges = compressToRanges(hs);
        const card = document.createElement("div");
        card.className="card";
        card.style.boxShadow="none";
        card.innerHTML = `
          <strong>${d.label}</strong>
          <div class="muted small" style="margin-top:6px">
            ${ranges.map(r=>`✅ ${r}`).join("<br>")}
          </div>
        `;
        wrap.appendChild(card);
      });

      out.appendChild(wrap);
    }

    select.addEventListener("change", render);
    render();
  }

  /* ---------- Profile + Settings ---------- */
  function loadProfile(){ return loadJson(LS.PROFILE, { name:"", dept:"", location:"", bio:"" }); }
  function saveProfile(p){ saveJson(LS.PROFILE, p); }

  function initProfile(){
    if(document.body?.dataset?.page !== "profile") return;
    const form = $("#profileForm");
    if(!form) return;

    const p = loadProfile();
    $("#pName").value = p.name || "";
    $("#pDepartment").value = p.dept || "";
    $("#pLocation").value = p.location || "";
    $("#pBio").value = p.bio || "";

    // theme select handled by initTheme, but also set initial here
    const theme = localStorage.getItem(LS.THEME) || "light";
    $("#pTheme").value = theme;

    form.addEventListener("submit",(e)=>{
      e.preventDefault();
      const next = {
        name: $("#pName").value.trim(),
        dept: $("#pDepartment").value.trim(),
        location: $("#pLocation").value.trim(),
        bio: $("#pBio").value.trim(),
      };
      saveProfile(next);

      // update current user name
      const u = getCurrentUser();
      u.name = next.name || u.name;
      setCurrentUser(u);
      upsertUser(u.email, u.role, u.name);

      // theme
      const t = $("#pTheme").value === "dark" ? "dark" : "light";
      localStorage.setItem(LS.THEME, t);
      applyTheme(t);

      alert("Profil kaydedildi.");
    });
  }

  function initSettings(){
    if(document.body?.dataset?.page !== "settings") return;
    const form = $("#settingsForm");
    if(!form) return;

    const p = loadProfile();
    $("#settingsName").value = p.name || "";
    $("#settingsDepartment").value = p.dept || "";
    $("#settingsLocation").value = p.location || "";
    $("#settingsBio").value = p.bio || "";

    const theme = localStorage.getItem(LS.THEME) || "light";
    $("#settingsTheme").value = theme;

    const on = localStorage.getItem(LS.HOLIDAY) === "1";
    const toggle = $("#holidayToggle");
    if(toggle) toggle.checked = on;

    form.addEventListener("submit",(e)=>{
      e.preventDefault();
      const next = {
        name: $("#settingsName").value.trim(),
        dept: $("#settingsDepartment").value.trim(),
        location: $("#settingsLocation").value.trim(),
        bio: $("#settingsBio").value.trim(),
      };
      saveProfile(next);

      const u = getCurrentUser();
      u.name = next.name || u.name;
      setCurrentUser(u);
      upsertUser(u.email, u.role, u.name);

      const t = $("#settingsTheme").value === "dark" ? "dark" : "light";
      localStorage.setItem(LS.THEME, t);
      applyTheme(t);

      if(toggle) setHolidayEnabled(toggle.checked);

      alert("Ayarlar kaydedildi.");
    });
  }

  /* ---------- Admin Logs ---------- */
  function loadAdminLogs(){
    const logs = loadJson(LS.ADMIN_LOGS, null);
    if(Array.isArray(logs)) return logs;
    const seed = [
      { ts:"2025-12-30 10:12", msg:"Admin panel demo başlatıldı." },
      { ts:"2025-12-30 10:14", msg:"Ders kataloğu görüntülendi." },
    ];
    saveJson(LS.ADMIN_LOGS, seed);
    return seed;
  }
  function pushAdminLog(msg){
    const logs = loadAdminLogs();
    logs.unshift({ ts: nowISO(), msg });
    saveJson(LS.ADMIN_LOGS, logs.slice(0,100));
  }

  /* ---------- Admin Dashboard ---------- */
  function initAdminDashboard(){
    if(document.body?.dataset?.page !== "admin-dashboard") return;
    if(!requireAdmin()) return;

    ensureDemoCourses();
    ensureDemoSchedules();

    const users = loadJson(LS.USERS, []);
    const courses = loadCourses();
    const schedules = loadSchedulesAll();

    $("#statUsers").textContent = String(users.length);
    $("#statCourses").textContent = String(courses.length);
    $("#statSchedules").textContent = String(Object.keys(schedules).length);

    const logsEl = $("#adminLogList");
    if(logsEl){
      const logs = loadAdminLogs();
      logsEl.innerHTML = "";
      logs.forEach(l=>{
        const row = document.createElement("div");
        row.className="admin-log-row";
        row.innerHTML = `<div class="admin-log-ts">${escapeHtml(l.ts)}</div><div>${escapeHtml(l.msg)}</div>`;
        logsEl.appendChild(row);
      });
    }
  }

  /* ---------- Admin Users ---------- */
  function initAdminUsers(){
    if(document.body?.dataset?.page !== "admin-users") return;
    if(!requireAdmin()) return;

    ensureDemoSchedules();

    const listEl = $("#adminUserList");
    if(!listEl) return;

    const users = loadJson(LS.USERS, []);
    listEl.innerHTML = "";

    users.forEach(u=>{
      const occ = getScheduleFor(u.email);
      const hasSchedule = Object.keys(occ).length > 0;

      const card = document.createElement("div");
      card.className="card";
      card.style.boxShadow="none";
      card.innerHTML = `
        <strong>${escapeHtml(u.name || u.email)}</strong>
        <div class="muted small">${escapeHtml(u.email)}</div>
        <div class="muted small">Rol: <strong>${escapeHtml(u.role)}</strong></div>
        <div class="muted small">Program: ${hasSchedule ? "Var" : "Yok"}</div>
        <div style="margin-top:10px">
          <button class="btn-primary btn-small" type="button" data-view="${escapeHtml(u.email)}">Programı Gör</button>
        </div>
      `;
      listEl.appendChild(card);
    });

    const modal = $("#adminScheduleModal");
    const modalTitle = $("#adminScheduleTitle");
    const modalView = $("#adminScheduleView");
    const btnClose = $("#btnCloseAdminModal");

    const close = ()=>{
      modal.classList.add("hidden");
      modalView.innerHTML = "";
    };
    btnClose.addEventListener("click", close);
    modal.addEventListener("click",(e)=>{ if(e.target===modal) close(); });

    listEl.addEventListener("click",(e)=>{
      const b = e.target.closest("[data-view]");
      if(!b) return;
      const email = b.getAttribute("data-view");
      modalTitle.textContent = `Program: ${email}`;
      modal.classList.remove("hidden");
      const occ = getScheduleFor(email);
      renderScheduleTable(modalView, occ, { interactive:false });
    });
  }

  /* ---------- Admin Courses ---------- */
  function renderCourseList(listEl){
    const courses = loadCourses();
    listEl.innerHTML = "";

    if(!courses.length){
      listEl.innerHTML = `<div class="muted small">Kayıtlı ders yok.</div>`;
      return;
    }

    courses.forEach((c,idx)=>{
      const row = document.createElement("div");
      row.className="admin-course-row";
      row.innerHTML = `
        <div>
          <div><strong>${escapeHtml(c.code)}</strong> – ${escapeHtml(c.name)}</div>
          <div class="muted small">${escapeHtml(c.dept || "")}</div>
        </div>
        <button class="btn-outline btn-small" type="button" data-del="${idx}">Sil</button>
      `;
      listEl.appendChild(row);
    });

    listEl.onclick = (e)=>{
      const b = e.target.closest("[data-del]");
      if(!b) return;
      const idx = parseInt(b.getAttribute("data-del"),10);
      const cur = loadCourses();
      if(idx>=0 && idx<cur.length){
        if(confirm(`${cur[idx].code} – ${cur[idx].name} silinsin mi?`)){
          const removed = cur.splice(idx,1)[0];
          saveCourses(cur);
          pushAdminLog(`Ders silindi: ${removed.code}`);
          renderCourseList(listEl);
        }
      }
    };
  }

  function initAdminCourses(){
    const page = document.body?.dataset?.page || "";
    if(page !== "admin-courses" && page !== "admin") return;
    if(!requireAdmin()) return;

    ensureDemoCourses();

    const form = $("#courseForm") || $("#adminCourseForm");
    const codeInp = $("#cCode") || $("#adminCourseCode");
    const nameInp = $("#cName") || $("#adminCourseName");
    const deptInp = $("#cDept") || $("#adminCourseDept");
    const listEl = $("#courseList") || $("#adminCourseList");
    if(!form || !listEl) return;

    renderCourseList(listEl);

    form.addEventListener("submit",(e)=>{
      e.preventDefault();
      const code = (codeInp?.value||"").trim();
      const name = (nameInp?.value||"").trim();
      const dept = (deptInp?.value||"").trim();

      if(!code || !name){
        alert("Ders kodu ve adı zorunlu.");
        return;
      }
      const courses = loadCourses();
      if(courses.some(x=>(x.code||"").toLowerCase()===code.toLowerCase())){
        alert("Bu ders kodu zaten kayıtlı.");
        return;
      }
      courses.push({ code, name, dept });
      saveCourses(courses);
      pushAdminLog(`Ders eklendi: ${code}`);

      if(codeInp) codeInp.value="";
      if(nameInp) nameInp.value="";
      if(deptInp) deptInp.value="";

      renderCourseList(listEl);
      alert("Ders eklendi.");
    });
  }

  /* ---------- Login ---------- */
  function initLogin(){
    if(document.body?.dataset?.page !== "login") return;

    const form = $("#loginForm");
    if(!form) return;

    const email = $("#email");
    const pass  = $("#password");

    form.addEventListener("submit",(e)=>{
      e.preventDefault();

      const em = (email.value||"").trim().toLowerCase();
      const pw = (pass.value||"").trim();

      if(!em){ alert("E-posta gir."); return; }
      if(!isAllowedEmail(em)){
        alert("Sadece @baskent.edu.tr ve @mail.baskent.edu.tr kabul edilir.");
        return;
      }
      if(!pw){ alert("Şifre gir."); return; }

      // Admin login
      if(em === ADMIN_DEMO.email && pw === ADMIN_DEMO.password){
        const u = { email: em, role:"admin", name:"Admin" };
        setCurrentUser(u);
        upsertUser(u.email,u.role,u.name);
        pushAdminLog("Admin giriş yaptı.");
        window.location.href = "admin-dashboard.html";
        return;
      }

      // Student login (demo)
      const u = { email: em, role:"ogrenci", name: em.split("@")[0] };
      setCurrentUser(u);
      upsertUser(u.email,u.role,u.name);
      window.location.href = "dashboard.html";
    });
  }

  /* ---------- Boot ---------- */
  document.addEventListener("DOMContentLoaded", ()=>{
    initTheme();
    initHoliday();

    if(!requireAuth()) return;

    initHeader();

    initLogin();

    initDashboard();
    initScheduleEditor();
    initFriends();
    initShared();
    initProfile();
    initSettings();

    initAdminDashboard();
    initAdminUsers();
    initAdminCourses();
  });

})();



