document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search);
    const bookId = params.get("id");

    if (!bookId) {
        console.error("Không có ID sách trong URL!");
        return;
    }

    try {
        const response = await fetch(`http://localhost:5282/api/book/${bookId}`);
        const result = await response.json();

        if (!result || !result.data) {
            console.error("Không tìm thấy dữ liệu sách!");
            return;
        }

        const book = result.data;

        // Gán dữ liệu vào HTML
        document.getElementById("book-title").textContent = book.title || "Không có tiêu đề";
        document.getElementById("book-author").textContent = book.author || "Unknown";
        document.getElementById("book-status").textContent = book.status || "Unknown";
        // document.getElementById("book-code").textContent = book.code || "-";
        document.getElementById("book-price").textContent = book.price ? `$${book.price}` : "Liên hệ";
        document.getElementById("book-discount").textContent = book.discountPrice ? `$${book.discountPrice}` : "";
        document.getElementById("book-description").textContent = book.description || "Không có mô tả.";
        document.getElementById("book-thumbnail").src = book.thumbnailUrl || "img/flex/1.jpg";

        // Add to cart (tạm thời)
        const addBtn = document.getElementById("add-to-cart-btn");
        addBtn.addEventListener("click", (e) => {
            e.preventDefault();
            alert(`Đã thêm "${book.title}" vào giỏ hàng!`);
        });

    } catch (err) {
        console.error("Lỗi khi tải dữ liệu sách:", err);
    }
});
