// ========== CONFIG ==========
const BASE_URL = "http://localhost:5282/api/cart"; // Đổi port nếu backend khác
// ============================

// =================================================================
// 🚀 1. LOGIC KHỞI TẠO VÀ CHUYỂN HƯỚNG
// =================================================================

document.addEventListener("DOMContentLoaded", () => {
    console.log("cart.js loaded");

    setTimeout(() => {
        // Mini Cart Button (Header)
        const cartBtn = document.getElementById("mini-cart-btn");
        if (cartBtn) {
            cartBtn.addEventListener("click", function (e) {
                e.preventDefault();
                window.location.href = "cart.html";
            });
        }

        // Tải Mini Cart trên tất cả các trang
        loadMiniCart();

        // Trang Giỏ hàng Chính (cart.html)
        if (window.location.pathname.endsWith('/cart.html')) {
            initCartPage();
        }

        // Gắn sự kiện cho nút Add to Cart
        const addToCartBtn = document.getElementById("add-to-cart-btn");
        if (addToCartBtn) {
            addToCartBtn.addEventListener("click", addToCartHandler);
        } else {
            console.warn("Không tìm thấy nút Add to Cart");
        }

    }, 100);
});

// =================================================================
// 🛒 2. CÁC HÀM API CORE
// =================================================================

async function getCart() {
    try {
        const res = await fetch(BASE_URL, {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token") || ""}`
            }
        });
        if (!res.ok) throw new Error("Không thể tải giỏ hàng.");
        const data = await res.json();
        console.log("🧺 Current cart:", data);
        return data;
    } catch (err) {
        console.error("❌ Get cart error:", err);
        return null;
    }
}

async function addToCartHandler(e) {
    e.preventDefault();
    console.log("🔥 addToCartHandler called");

    const params = new URLSearchParams(window.location.search);
    const bookId = params.get("id");

    const qtyInput = document.querySelector(".qty");
    const quantity = qtyInput ? parseInt(qtyInput.value) || 1 : 1;

    if (!bookId) {
        alert("Không tìm thấy sản phẩm.");
        return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
        alert("Vui lòng đăng nhập trước khi thêm vào giỏ hàng.");
        return;
    }

    try {
        console.log(`🚀 Adding to cart: BookId=${bookId}, Quantity=${quantity}`);

        const res = await fetch(`${BASE_URL}/items`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                userId: "",
                bookId: parseInt(bookId),
                quantity: quantity
            })
        });

        console.log("Fetch response status:", res.status);

        if (!res.ok) {
            const errText = await res.text();
            console.error("❌ Add to cart failed:", errText);
            throw new Error(errText || "Lỗi khi thêm vào giỏ hàng.");
        }

        const data = await res.json();
        console.log("✅ Add to cart success:", data);

        alert(`Đã thêm sản phẩm vào giỏ hàng!`);
        await loadMiniCart();

    } catch (err) {
        console.error("❌ Add to cart error:", err);
        alert("Không thể thêm vào giỏ hàng. Vui lòng đăng nhập hoặc thử lại.");
    }
}

async function updateCartItem(itemId, newQuantity) {
    try {
        const res = await fetch(`${BASE_URL}/items/${itemId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token") || ""}`
            },
            body: JSON.stringify({ quantity: newQuantity })
        });
        if (!res.ok) throw new Error("Không thể cập nhật số lượng.");
        const data = await res.json();
        console.log("🔄 Updated item:", data);
        loadMiniCart();
        return data;
    } catch (err) {
        console.error("❌ Update error:", err);
    }
}

async function deleteCartItem(itemId) {
    try {
        const res = await fetch(`${BASE_URL}/items/${itemId}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token") || ""}`
            }
        });
        if (!res.ok) throw new Error("Không thể xóa sản phẩm.");
        alert("Đã xóa sản phẩm khỏi giỏ hàng.");
        loadMiniCart();
    } catch (err) {
        console.error("❌ Delete error:", err);
    }
}

async function clearCart() {
    try {
        const res = await fetch(`${BASE_URL}/clear`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token") || ""}`
            }
        });
        if (!res.ok) throw new Error("Không thể dọn giỏ hàng.");
        alert("Giỏ hàng đã được làm trống.");
        loadMiniCart();
    } catch (err) {
        console.error("❌ Clear error:", err);
    }
}

// =================================================================
// 🧩 3. LOGIC HIỂN THỊ MINI CART (HEADER)
// =================================================================

async function loadMiniCart() {
    const token = localStorage.getItem("token");
    const cartCount = document.getElementById("cart-count");
    const cartItemsContainer = document.getElementById("cart-items");
    const cartTotal = document.getElementById("cart-total");

    if (!cartCount || !cartItemsContainer || !cartTotal) return;

    if (!token) {
        cartCount.textContent = "0";
        cartItemsContainer.innerHTML = `<p style="padding:10px;">Vui lòng đăng nhập để xem giỏ hàng.</p>`;
        cartTotal.textContent = "$0";
        return;
    }

    try {
        const res = await fetch(BASE_URL, { headers: { "Authorization": `Bearer ${token}` } });
        if (!res.ok) throw new Error("Không thể tải giỏ hàng.");
        const data = await res.json();
        const cartItems = data.data?.cartItems || [];
        renderMiniCart(cartItems);
    } catch (err) {
        console.error("❌ Load cart error:", err);
        cartItemsContainer.innerHTML = `<p style="padding:10px;">Không thể tải giỏ hàng.</p>`;
    }
}

function renderMiniCart(cartItems) {
    const cartItemsContainer = document.getElementById("cart-items");
    const cartCount = document.getElementById("cart-count");
    const cartTotal = document.getElementById("cart-total");

    if (!cartItems || cartItems.length === 0) {
        cartItemsContainer.innerHTML = `<p style="padding:10px;">Giỏ hàng trống.</p>`;
        cartCount.textContent = "0";
        cartTotal.textContent = "$0";
        return;
    }

    cartCount.textContent = cartItems.length;
    let total = 0;
    cartItemsContainer.innerHTML = "";

    cartItems.forEach(item => {
        const book = item.book;
        const price = book?.price ?? 0; // chỉ dùng price
        const qty = item.quantity || 1;
        const subtotal = price * qty;
        total += subtotal;

        const itemHTML = `
        <div class="single-cart">
            <div class="cart-img">
                <a href="#"><img src="${book?.thumbnailUrl || 'img/flex/1.jpg'}" alt="${book?.title || 'Book'}"></a>
            </div>
            <div class="cart-info">
                <h5><a href="#">${book?.title || 'Unknown'}</a></h5>
                <p>${qty} x $${price.toLocaleString()}</p>
            </div>
            <div class="cart-icon">
                <a href="#" onclick="removeFromMiniCart(${item.id}); return false;"><i class="fa fa-remove"></i></a>
            </div>
        </div>
    `;
        cartItemsContainer.insertAdjacentHTML("beforeend", itemHTML);
    });
    cartTotal.textContent = "$" + total.toLocaleString();
}

async function removeFromMiniCart(itemId) {
    if (!confirm("Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?")) return;

    try {
        const res = await fetch(`${BASE_URL}/items/${itemId}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${localStorage.getItem("token") || ""}` }
        });

        if (!res.ok) throw new Error("Không thể xóa sản phẩm.");
        alert("Đã xóa sản phẩm khỏi giỏ hàng.");
        loadMiniCart();
        if (window.location.pathname.endsWith('/cart.html')) {
            initCartPage();
        }
    } catch (err) {
        console.error(err);
        alert("Lỗi khi xóa sản phẩm.");
    }
}

// =================================================================
// 🛒 4. LOGIC HIỂN THỊ TRANG CART.HTML
// =================================================================

async function initCartPage() {
    const cartData = await getCart();
    const cartItems = cartData?.data?.cartItems || [];
    renderCartPage(cartItems);
    attachCartPageEvents(cartItems);
}

function renderCartPage(cartItems) {
    const cartTableBody = document.getElementById("cart-body");
    const cartSubtotalEl = document.getElementById("subtotal");
    const cartTotalEl = document.getElementById("total");
    const shippingEl = document.getElementById("shipping-amount");
    const shippingNoteEl = document.getElementById("shipping-note");

    if (!cartTableBody) return;

    if (!cartItems || cartItems.length === 0) {
        cartTableBody.innerHTML = '<tr><td colspan="6" class="text-center">Giỏ hàng của bạn trống.</td></tr>';
        if (cartSubtotalEl) cartSubtotalEl.textContent = "$0.00";
        if (cartTotalEl) cartTotalEl.textContent = "$0.00";
        if (shippingEl) shippingEl.textContent = "$0.00";
        return;
    }

    let subtotal = 0;
    let tableHTML = "";

    cartItems.forEach(item => {
        const book = item.book;
        const price = book?.price ?? 0;
        const qty = item.quantity || 1;
        const itemTotal = price * qty;
        subtotal += itemTotal;

        tableHTML += `
        <tr data-item-id="${item.id}">
            <td class="product-thumbnail">
                <a href="#"><img src="${book?.thumbnailUrl || 'img/flex/1.jpg'}" alt="${book?.title || 'Book'}"></a>
            </td>
            <td class="product-name">
                <a href="#">${book?.title || 'Unknown'}</a>
            </td>
            <td class="product-price">$${price.toFixed(2)}</td>
            <td class="product-quantity">
                <input type="number" id="qty-${item.id}" value="${qty}" min="1" />
            </td>
            <td class="product-subtotal">$${itemTotal.toFixed(2)}</td>
            <td class="product-remove">
                <a href="#" onclick="deleteCartItemAndReload(${item.id}); return false;"><i class="fa fa-times"></i></a>
            </td>
        </tr>`;
    });

    // Tính phí ship
    const shippingFee = subtotal >= 300 ? 0 : 15;
    const total = subtotal + shippingFee;

    cartTableBody.innerHTML = tableHTML;
    if (cartSubtotalEl) cartSubtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    if (shippingEl) shippingEl.textContent = `$${shippingFee.toFixed(2)}`;
    if (cartTotalEl) cartTotalEl.textContent = `$${total.toFixed(2)}`;
    if (shippingNoteEl) shippingNoteEl.textContent = "Free shipping for orders over $300.";
}

function attachCartPageEvents(cartItems) {
    const updateCartBtn = document.getElementById("update-cart");
    const clearCartBtn = document.getElementById("clear-cart");

    if (clearCartBtn) {
        clearCartBtn.addEventListener("click", (e) => {
            e.preventDefault();
            if (confirm("Bạn có chắc chắn muốn dọn sạch giỏ hàng?")) {
                clearCartAndReload();
            }
        });
    }

    if (updateCartBtn && cartItems && cartItems.length > 0) {
        updateCartBtn.style.pointerEvents = 'auto';
        updateCartBtn.addEventListener("click", async (e) => {
            e.preventDefault();
            const itemsToUpdate = cartItems.map(item => {
                const qtyInput = document.getElementById(`qty-${item.id}`);
                return {
                    itemId: item.id,
                    oldQuantity: item.quantity,
                    newQuantity: qtyInput ? parseInt(qtyInput.value) : item.quantity
                };
            });

            let updatedCount = 0;
            for (const item of itemsToUpdate) {
                if (item.newQuantity > 0 && item.newQuantity !== item.oldQuantity) {
                    await updateCartItem(item.itemId, item.newQuantity);
                    updatedCount++;
                }
            }

            if (updatedCount > 0) {
                initCartPage();
                alert("Giỏ hàng đã được cập nhật!");
            } else {
                alert("Không có thay đổi nào cần cập nhật.");
            }
        });
    }
}

async function updateCartItemAndReload(itemId, newQuantity) {
    await updateCartItem(itemId, newQuantity);
    if (window.location.pathname.endsWith('/cart.html')) {
        initCartPage();
    }
}

async function deleteCartItemAndReload(itemId) {
    await deleteCartItem(itemId);
    if (window.location.pathname.endsWith('/cart.html')) {
        initCartPage();
    }
}

async function clearCartAndReload() {
    await clearCart();
    if (window.location.pathname.endsWith('/cart.html')) {
        initCartPage();
    }
}
