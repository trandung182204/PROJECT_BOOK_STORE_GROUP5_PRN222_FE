async function loadHeader() {
    const headerContainer = document.getElementById('header-placeholder'); 
    
    if (headerContainer) {
        try {
            const response = await fetch('header.html'); 
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const html = await response.text();
            headerContainer.innerHTML = html;

            // ✅ Header đã load xong → gọi hàm kiểm tra đăng nhập
            updateAccountMenu();

        } catch (error) {
            console.error("Lỗi khi tải header!", error);
            headerContainer.innerHTML = '<h1>Lỗi tải Header!</h1>'; 
        }
    }
}

// Hàm kiểm tra token và cập nhật menu
function updateAccountMenu() {
    const accessToken = localStorage.getItem("accessToken");
    const signInItem = document.getElementById("signInItem");
    const accountItem = document.getElementById("accountItem");

    if (!signInItem || !accountItem) return; // tránh lỗi khi chưa load xong header

    if (accessToken) {
        // Đã đăng nhập → chỉ hiện My Account
        signInItem.style.display = "none";
        accountItem.style.display = "block";
    } else {
        // Chưa đăng nhập → chỉ hiện Sign in
        signInItem.style.display = "block";
        accountItem.style.display = "none";
    }
}

document.addEventListener('DOMContentLoaded', loadHeader);
