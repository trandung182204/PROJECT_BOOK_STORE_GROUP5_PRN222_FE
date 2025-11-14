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

// Hàm check signIn
document.addEventListener("DOMContentLoaded", function () {
    const accessToken = localStorage.getItem("accessToken");
    const menu = document.getElementById("accountMenu");
    let signInItem = document.getElementById("signInItem");
    let accountItem = document.getElementById("accountItem");

    // Nếu đã đăng nhập
    if (accessToken) {
        // Ẩn Sign in
        if (signInItem) signInItem.remove();

        // Thêm nút Logout nếu chưa có
        if (!document.getElementById("logoutItem")) {
            const li = document.createElement("li");
            li.id = "logoutItem";
            li.innerHTML = `<a href="#" onclick="logout()">Logout</a>`;
            menu.appendChild(li);
        }

        // Chỉ còn một item → CSS có thể bỏ dấu |
        menu.classList.add("only-one");

    } else {
        // Chưa đăng nhập → hiển thị Sign in nếu chưa có
        if (!signInItem) {
            const li = document.createElement("li");
            li.id = "signInItem";
            li.innerHTML = `<a href="login.html">Sign in</a>`;
            menu.appendChild(li);
        }

        // Xóa Logout nếu có
        const logoutItem = document.getElementById("logoutItem");
        if (logoutItem) logoutItem.remove();

        menu.classList.remove("only-one");
    }
});

// 🔒 Hàm fetch có xác thực (tự động renew khi 401)
async function fetchWithAccount(url, options = {}) {
  const token = localStorage.getItem("accessToken");

  const res = await fetch(url, {
    ...options,
    headers: {
      "Authorization": `Bearer ${token}`, // ✅ đã sửa ở đây
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  // 🧠 Nếu token hết hạn → làm mới rồi thử lại
  if (res.status === 401) {
    console.log("⚠️ Access token hết hạn → làm mới...");
    await renewToken();
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
      window.location.href = "login.html";
    } else {
      alert("❌ Đăng xuất thất bại: " + (data.message || "Unknown error"));
    }
  } catch (err) {
    console.error("Lỗi đăng xuất:", err);
  }
}
