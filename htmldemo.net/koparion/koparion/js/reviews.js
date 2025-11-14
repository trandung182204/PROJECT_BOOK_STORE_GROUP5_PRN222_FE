document.addEventListener("DOMContentLoaded", async () => {
    const stars = document.querySelectorAll(".review-control-vote a");
    const ratingInput = document.getElementById("ratingValue");
    const commentBox = document.querySelector('textarea[name="massage"]');
    const submitButton = document.querySelector(".review-form-button a");
    const bookTitleEl = document.getElementById("book-title");

    let currentRating = 0;

    // 🔹 Lấy bookId từ URL (?bookId=5)
    const urlParams = new URLSearchParams(window.location.search);
    const bookId = urlParams.get("bookId");

    // ✅ Hiển thị tên sách
    if (bookId) {
        try {
            const res = await fetch(`https://localhost:5282/api/books/${bookId}`);
            if (res.ok) {
                const book = await res.json();
                bookTitleEl.textContent = book.title || "Không rõ tên sách";
            } else {
                bookTitleEl.textContent = "Không tìm thấy sách";
            }
        } catch {
            bookTitleEl.textContent = "Không thể tải tên sách";
        }
    }

    // ⭐ Xử lý chọn sao
    stars.forEach((star, index) => {
        star.addEventListener("click", (e) => {
            e.preventDefault();
            currentRating = index + 1;
            ratingInput.value = currentRating;

            stars.forEach((s, i) => {
                s.classList.toggle("active", i < currentRating);
            });
        });

        star.addEventListener("mouseover", () => {
            stars.forEach((s, i) => {
                s.classList.toggle("active", i <= index);
            });
        });

        star.addEventListener("mouseout", () => {
            stars.forEach((s, i) => {
                s.classList.toggle("active", i < currentRating);
            });
        });
    });

    // 📨 Gửi review
    if (!submitButton) return;

    submitButton.addEventListener("click", async (e) => {
        e.preventDefault();

        const rating = parseInt(ratingInput.value) || 0;
        const comment = commentBox.value.trim();

        if (!bookId) {
            alert("Không xác định được mã sách để review!");
            return;
        }

        if (rating === 0) {
            alert("Vui lòng chọn số sao!");
            return;
        }

        if (!comment) {
            alert("Vui lòng nhập nội dung review!");
            return;
        }

        const review = { rating, comment };

        try {
            const response = await fetch(`https://localhost:5282/api/books/${bookId}/reviews`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token") || ""}`
                },
                body: JSON.stringify(review)
            });

            if (response.ok) {
                const data = await response.json();

                alert(`✅ Review thành công cho sách "${data.bookTitle}"!`);
                document.getElementById("review-date").innerText =
                    "Gửi lúc: " + new Date(data.createdAt).toLocaleString();

                // reset form
                commentBox.value = "";
                ratingInput.value = 0;
                currentRating = 0;
                stars.forEach(s => s.classList.remove("active"));
            } else {
                const err = await response.text();
                alert("❌ Gửi review thất bại: " + err);
            }
        } catch (error) {
            console.error("Lỗi:", error);
            alert("⚠️ Không thể kết nối đến server!");
        }
    });
});