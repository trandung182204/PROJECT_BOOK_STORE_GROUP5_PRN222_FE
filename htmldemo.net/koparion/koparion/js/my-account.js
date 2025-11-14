// ================= CONFIG (Lấy từ checkout.js) =================
// Đảm bảo các URL này là chính xác
const BASE_USER_URL = "http://localhost:5282/api/users";
const token = localStorage.getItem("accessToken") || "";
// =============================================================

document.addEventListener("DOMContentLoaded", async () => {
    // 1. Kiểm tra token
    if (!token) {
        alert("Vui lòng đăng nhập để xem thông tin.");
        window.location.href = "login.html";
        return;
    }

    // 2. Tải thông tin user và điền vào form
    await loadAccountInfo();

    // 3. Gán sự kiện "click" cho nút "Save Changes"
    const saveButton = document.getElementById("saveChangesBtn");
    if (saveButton) {
        saveButton.addEventListener("click", handleUpdateAccount);
    }
});

// ================ LOAD USER INFO ================
async function loadAccountInfo() {
    try {
        const res = await fetch(`${BASE_USER_URL}/me`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!res.ok) throw new Error("Không lấy được thông tin user");

        const responseData = await res.json();
        const data = responseData.succeeded ? responseData.data : responseData;

        if (data) {
            // Điền dữ liệu vào các ô input (khớp với HTML bạn cung cấp)
            document.getElementById("fullname").value = data.fullName || "";
            document.getElementById("phone").value = data.phoneNumber || "";
            document.getElementById("email").value = data.email || "";
            
            // ✨ QUAN TRỌNG: Giả định API của bạn trả về data.address
            // Nếu không, bạn cần thêm trường Address vào User DTO của mình
            document.getElementById("address").value = data.address || ""; 
            
            // Tùy chọn: Vô hiệu hóa ô email vì thường không cho đổi
            // document.getElementById("email").disabled = true; 
        } else {
            throw new Error("Dữ liệu user trả về không hợp lệ");
        }

    } catch (err) {
        console.error("❌ Lỗi loadAccountInfo:", err);
        alert("Lỗi khi tải thông tin tài khoản.");
    }
}

// ================ SAVE CHANGES ================
async function handleUpdateAccount(event) {
    // Ngăn form submit (tải lại trang)
    event.preventDefault(); 

    // 1. Lấy dữ liệu mới từ form
    const newFullName = document.getElementById("fullname").value;
    const newPhone = document.getElementById("phone").value;
    const newAddress = document.getElementById("address").value;
    // (Chúng ta không gửi 'email' vì giả định không cho đổi)

    // 2. Gói dữ liệu để gửi đi
    const updateData = {
        fullName: newFullName,
        phoneNumber: newPhone == null ? "0342860233" : newPhone,
        address: newAddress
        // Thêm bất kỳ trường nào khác bạn cho phép user cập nhật
    };

    try {
        // 3. Gọi API (Chúng ta cần 1 endpoint PUT /api/users/me ở backend)
        const res = await fetch(`${BASE_USER_URL}/me`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(updateData)
        });

        const result = await res.json();

        if (!res.ok || !result.succeeded) {
            throw new Error(result.message || "Không thể cập nhật.");
        }

        // 4. Thông báo thành công
        alert("✅ Cập nhật thông tin thành công!");

    } catch (err) {
        console.error("❌ Lỗi handleUpdateAccount:", err);
        alert(`❌ Lỗi khi cập nhật: ${err.message}`);
    }
}