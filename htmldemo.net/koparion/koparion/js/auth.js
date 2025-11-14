// ===== Account.js =====

// 🔁 Làm mới token khi hết hạn
async function renewToken() {
  const refreshToken = localStorage.getItem("refreshToken");
  const accessToken = localStorage.getItem("accessToken");

  if (!refreshToken || !accessToken) {
    console.warn("⚠️ Không có token, cần đăng nhập lại!");
    window.location.href = "login.html";
    return;
  }

  try {
    const res = await fetch("http://localhost:5282/api/Account/RenewToken", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        accessToken: accessToken,
        refreshToken: refreshToken,
      }),
    });

    const data = await res.json();

    if (data.succeeded && data.data?.accessToken) {
      // ✅ Lưu token mới
      localStorage.setItem("accessToken", data.data.accessToken);
      localStorage.setItem("refreshToken", data.data.refreshToken);
      console.log("🔁 Token đã được làm mới!");
    } else {
      alert("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      window.location.href = "login.html";
    }
  } catch (err) {
    console.error("❌ Lỗi khi làm mới token:", err);
    window.location.href = "login.html";
  }
}

// Dùng code này NẾU bạn đổi id="signInItem" thành class="signInItem"
function checkSignIn() {
  const accessToken = localStorage.getItem("accessToken");
  
  // 1. Tìm TẤT CẢ các menu
  const menus = document.querySelectorAll(".accountMenu"); 

  if (!menus.length) {
    console.error("Không tìm thấy phần tử nào với class .accountMenu");
    return;
  }

  // 2. Lặp qua từng menu để cập nhật
  menus.forEach(menu => {
    let signInItem = menu.querySelector(".signInItem"); // Tìm class
    let logoutItem = menu.querySelector(".logoutItem"); 

    if (accessToken) {
      if (signInItem) {
        signInItem.remove();
      }
      if (!logoutItem) {
        const li = document.createElement("li");
        li.classList.add("logoutItem");
        li.innerHTML = `<a href="#" onclick="logout()">Logout</a>`;
        menu.appendChild(li);
      }
    } else {
      if (logoutItem) {
        logoutItem.remove();
      }
      if (!signInItem) {
        const li = document.createElement("li");
        li.classList.add("signInItem");
        li.innerHTML = `<a href="login.html">Sign in</a>`;
        menu.appendChild(li);
      }
    }
  });
}

// 🔒 Hàm fetch có xác thực (tự động renew khi 401)
async function fetchWithAccount(url, options = {}) {
  const token = localStorage.getItem("accessToken");

  const res = await fetch(url, {
    ...options,
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  // 🧠 Nếu token hết hạn → làm mới rồi thử lại
  if (res.status === 401) {
    console.log("⚠️ Access token hết hạn → làm mới...");
    await renewToken();
    // Sau khi làm mới, gọi lại hàm fetch với token mới (đã được lưu trong localStorage)
    return fetchWithAccount(url, options);
  }

  return res;
}

// 🚪 Đăng xuất
async function logout() {
  const refreshToken = localStorage.getItem("refreshToken");

  try {
    const res = await fetch("http://localhost:5282/api/Account/Logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await res.json();

    if (data.succeeded) {
      alert("👋 Đăng xuất thành công!");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      // Cập nhật lại UI ngay lập tức và chuyển trang
      checkSignIn();
      window.location.href = "login.html";
    } else {
      alert("❌ Đăng xuất thất bại: " + (data.message || "Unknown error"));
    }
  } catch (err) {
    console.error("Lỗi đăng xuất:", err);
  }
}