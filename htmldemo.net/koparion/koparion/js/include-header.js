async function loadHeader() {
    // 1. Tìm vị trí cần chèn header
    const headerContainer = document.getElementById('header-placeholder'); 
    
    // 2. Kiểm tra xem phần tử placeholder có tồn tại không
    if (headerContainer) {
        try {
            // 3. Tải nội dung từ file header.html
            const response = await fetch('header.html'); 
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const html = await response.text();
            
            // 4. Chèn nội dung vào placeholder
            headerContainer.innerHTML = html;
        } catch (error) {
            console.error("Lỗi khi tải header. Hãy đảm bảo bạn đang chạy trên Live Server!", error);
            // Có thể thêm nội dung dự phòng ở đây
            headerContainer.innerHTML = '<h1>Lỗi tải Header!</h1>'; 
        }
    }
}

// Chạy hàm sau khi tài liệu HTML chính đã tải xong
document.addEventListener('DOMContentLoaded', loadHeader);