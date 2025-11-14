// ================= CONFIG =================
const BASE_CART_URL = "http://localhost:5282/api/cart";
const BASE_CHECKOUT_URL = "http://localhost:5282/api/checkout"; // Chúng ta sẽ dùng URL này
const BASE_USER_URL = "http://localhost:5282/api/users";
const token = localStorage.getItem("accessToken") || "";
// ==========================================

document.addEventListener("DOMContentLoaded", async () => {
    if (!token) {
        alert("Vui lòng đăng nhập để tiếp tục thanh toán.");
        window.location.href = "login.html";
        return;
    }

    await loadUserInfo();
    await loadCartForCheckout();

    const placeOrderBtn = document.getElementById("placeOrderBtn");
    const paymentRadios = document.querySelectorAll('input[name="paymentMethod"]');

    // ✨ VÔ HIỆU HÓA NÚT KHI TẢI TRANG
    if(placeOrderBtn) {
        placeOrderBtn.disabled = true;
    }

    paymentRadios.forEach(radio => {
        radio.addEventListener("change", () => {
            if (placeOrderBtn) {
                placeOrderBtn.disabled = false;
            }
        });
    });

    if (placeOrderBtn) {
        placeOrderBtn.addEventListener("click", placeOrderHandler);
    }
});

// ================ USER INFO =================
async function loadUserInfo() {
    try {
        const res = await fetch(`${BASE_USER_URL}/me`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Không lấy được thông tin user");

        const responseData = await res.json();
        const data = responseData.succeeded ? responseData.data : responseData;

        const fullNameInput = document.getElementById("fullName");
        const phoneInput = document.getElementById("phone");
        const emailInput = document.getElementById("email");

        if (data) {
            if (fullNameInput) fullNameInput.value = data.fullName || "";
            if (phoneInput) phoneInput.value = data.phoneNumber || ""; // Bỏ số đt hard-code
            if (emailInput) emailInput.value = data.email || "";
        } else {
            throw new Error("Dữ liệu user trả về không hợp lệ");
        }

    } catch (err) {
        console.error("❌ Lỗi loadUserInfo:", err);
    }
}

// ================ CART & TOTALS =================
async function loadCartForCheckout() {
    try {
        const res = await fetch(BASE_CART_URL, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Không lấy được giỏ hàng");
        const data = await res.json();
        const cartItems = data?.data?.cartItems || [];

        renderCartItems(cartItems);
        renderTotals(cartItems);
    } catch (err) {
        console.error("❌ Lỗi loadCartForCheckout:", err);
        document.getElementById("cartItems").innerHTML = `
            <tr><td colspan="2" class="text-center">Giỏ hàng trống hoặc không thể tải.</td></tr>
        `;
        renderTotals([]);
    }
}

function renderCartItems(cartItems) {
    const tbody = document.getElementById("cartItems");
    tbody.innerHTML = "";

    if (!cartItems || cartItems.length === 0) {
        tbody.innerHTML = `<tr><td colspan="2" class="text-center">Giỏ hàng trống.</td></tr>`;
        return;
    }

    cartItems.forEach(item => {
        const book = item.book || {};
        const price = book.price || 0;
        const qty = item.quantity || 1;
        const subtotal = price * qty;

        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${book.title || "Unknown"} × ${qty}</td>
            <td>£${subtotal.toFixed(2)}</td>
        `;
        tbody.appendChild(row);
    });
}

function renderTotals(cartItems) {
    const subtotalEl = document.getElementById("subtotal");
    const shippingEl = document.getElementById("shippingFee");
    const orderTotalEl = document.getElementById("orderTotal");

    let subtotal = 0;
    cartItems.forEach(item => {
        const price = item.book?.price || 0;
        const qty = item.quantity || 1;
        subtotal += price * qty;
    });

    // ✨ LƯU Ý: Phí ship này (300/15) đang khác với Backend (500k/20k)
    // Bạn nên đồng bộ lại, ở đây tôi tạm giữ nguyên
    const shippingFee = subtotal >= 300 ? 0 : 15; 
    const total = subtotal + shippingFee;

    if (subtotalEl) subtotalEl.textContent = `£${subtotal.toFixed(2)}`;
    if (shippingEl) shippingEl.textContent = `£${shippingFee.toFixed(2)}`;
    if (orderTotalEl) orderTotalEl.textContent = `£${total.toFixed(2)}`;
}

// ================ PLACE ORDER (ĐÃ SỬA HOÀN CHỈNH) =================
async function placeOrderHandler() {
    // 1. Lấy thông tin
    const fullName = document.getElementById("fullName")?.value || "";
    const phone = document.getElementById("phone")?.value || "";
    const address = document.getElementById("address")?.value || "";
    const email = document.getElementById("email")?.value || "";
    const country = document.getElementById("country")?.value || "";
    const note = document.getElementById("orderNote")?.value || ""; // Lấy note
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value;

    // 2. Kiểm tra validation
    if (!fullName || !phone || !address || !email) {
        alert("Vui lòng điền đầy đủ thông tin thanh toán!");
        return;
    }
    if (!paymentMethod) {
        alert("Vui lòng chọn phương thức thanh toán!");
        return;
    }

    // ✨ 3. GỘP DỮ LIỆU ĐỊA CHỈ (để khớp với string ShippingAddress của Backend)
    const combinedAddress = `${fullName}, ${phone}, ${email}, ${address}, ${country}`;
    
    try {
        // ✨ 4. GỌI API HỢP NHẤT (Sửa URL và Body)
        const res = await fetch(`${BASE_CHECKOUT_URL}`, { // ✨ SỬA URL: Dùng BASE_CHECKOUT_URL
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                // ✨ SỬA BODY: Gửi data theo đúng format của CheckoutRequest.cs
                paymentMethod: paymentMethod,
                shippingAddress: combinedAddress,
                note: note
            })
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || "Không thể đặt hàng");
        }

        const data = await res.json(); // Data từ ApiResponse

        // ✨ 5. XỬ LÝ KẾT QUẢ TRẢ VỀ
        // Backend trả về { ..., Data: { paymentUrl: "..." } }
        if (paymentMethod === "vnpay" && data.data && data.data.paymentUrl) {
            alert("Đang chuyển hướng đến VNPAY...");
            window.location.href = data.data.paymentUrl; // Chuyển hướng người dùng
        } else if (paymentMethod === "cod" && data.succeeded) {
            // Nếu là COD, đi tới trang cảm ơn
            alert("✅ Đặt hàng thành công!");
            window.location.href = "thankyou.html";
        } else {
            // Trường hợp VNPAY nhưng không có URL
            throw new Error("Không nhận được link VNPAY hợp lệ.");
        }

    } catch (err) {
        console.error("❌ Lỗi placeOrderHandler:", err);
        alert(`❌ Lỗi khi đặt hàng: ${err.message}`);
    }
}