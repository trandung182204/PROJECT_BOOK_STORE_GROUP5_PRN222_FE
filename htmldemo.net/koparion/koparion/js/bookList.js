// --- Cấu hình ---
const API_URL = "http://localhost:5282/api/Book";
const pageSize = 5;
let allBooks = [];
let currentPage = 1;

// --- Hàm 1: Tải TOÀN BỘ sách từ API ---
async function loadAllBooks() {
    const container = document.getElementById("book-list");
    container.innerHTML = "<p>Loading books...</p>";
    document.querySelector(".pagination-area").style.display = 'none';

    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        if (!data.succeeded || !data.data || data.data.length === 0) {
            container.innerHTML = "<p>No books available.</p>";
            return;
        }

        allBooks = data.data;
        displayPage(1);
    } catch (error) {
        console.error("Fetch error:", error);
        container.innerHTML = `<p style="color:red;">Error loading books: ${error.message}.</p>`;
    }
}

// --- Hàm 2: Hiển thị sách cho 1 trang ---
function displayPage(page) {
    currentPage = page;
    const container = document.getElementById("book-list");

    if (allBooks.length === 0) {
        container.innerHTML = "<p>No books available.</p>";
        return;
    }

    const totalCount = allBooks.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalCount);

    const booksForPage = allBooks.slice(startIndex, endIndex);

    renderBooks(booksForPage);
    renderPagination(page, totalPages, totalCount);
}

// --- Hàm 3: Render danh sách sách ---
function renderBooks(books) {
    const container = document.getElementById("book-list");
    container.innerHTML = books.map(book => `
		<div class="single-shop mb-30">
			<div class="row">
				<div class="col-lg-4 col-md-4 col-12">
					<div class="product-wrapper-2">
						<div class="product-img">
							<a href="product-details.html?id=${book.id || book.Id}">
								<img src="${book.thumbnailUrl || 'img/product/19.jpg'}" 
									 alt="${book.title}" class="primary"
									 style="width:100%; height:auto; object-fit:cover;" />
							</a>
						</div>
					</div>
				</div>
				<div class="col-lg-8 col-md-8 col-12">
					<div class="product-wrapper-content">
						<div class="product-details">
							<h4><a href="product-details.html?id=${book.id || book.Id}">${book.title}</a></h4>
							<p style="font-size: 14px; color: #777;">by ${book.author || 'Unknown'}</p>
							<div class="product-price">
								<ul><li>$${book.price || book.Price}</li></ul>
							</div>
							<p>${book.description ? book.description.substring(0, 180) + "..." : "No description available."}</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	`).join("");
}

// --- Hàm 4: Render phân trang ---
function renderPagination(pageNumber, totalPages, totalCount) {
    const summaryEl = document.getElementById("pagination-summary");
    const linksEl = document.getElementById("pagination-links");

    const startItem = (pageNumber - 1) * pageSize + 1;
    const endItem = Math.min(pageNumber * pageSize, totalCount);
    summaryEl.textContent = `Items ${startItem}-${endItem} of ${totalCount}`;

    let linksHtml = "";
    if (pageNumber > 1)
        linksHtml += `<li><a href="#" data-page="${pageNumber - 1}" class="angle"><i class="fa fa-angle-left"></i></a></li>`;
    for (let i = 1; i <= totalPages; i++)
        linksHtml += `<li><a href="#" class="${i === pageNumber ? 'active' : ''}" data-page="${i}">${i}</a></li>`;
    if (pageNumber < totalPages)
        linksHtml += `<li><a href="#" data-page="${pageNumber + 1}" class="angle"><i class="fa fa-angle-right"></i></a></li>`;

    linksEl.innerHTML = linksHtml;

    linksEl.querySelectorAll("a[data-page]").forEach(link => {
        link.addEventListener("click", e => {
            e.preventDefault();
            displayPage(parseInt(link.getAttribute("data-page")));
            document.getElementById('book-list').scrollIntoView({ behavior: 'smooth' });
        });
    });

    document.querySelector(".pagination-area").style.display = 'block';
}

// --- Hàm 5: Hiển thị danh sách sách đơn giản (ảnh + tên + tác giả) ---
function renderSimpleBooks(containerId, books) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = books.map(book => `
        <div class="single-related">
            <div class="related-thumb">
                <a href="product-details.html?id=${book.id || book.Id}">
                    <img src="${book.thumbnailUrl || 'img/product/19.jpg'}" alt="${book.title}">
                </a>
            </div>
            <div class="related-info">
                <h5><a href="product-details.html?id=${book.id || book.Id}" 
                    style="text-decoration:none; color:#333;">${book.title}</a></h5>
                <p>by ${book.author || 'Unknown'}</p>
            </div>
        </div>
    `).join("");
}

// --- Hàm 6: Tải danh sách sách đơn giản từ API (dành cho phần “Related Products”) ---
async function loadSimpleBooks(containerId, limit = 4) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = "<p>Loading related books...</p>";

    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error(`HTTP error! ${response.status}`);

        const data = await response.json();
        const books = data.data || data;

        if (!Array.isArray(books) || books.length === 0) {
            container.innerHTML = "<p>No related books found.</p>";
            return;
        }

        // Chọn ngẫu nhiên 'limit' cuốn sách
        const shuffled = books.sort(() => 0.5 - Math.random());
        const relatedBooks = shuffled.slice(0, limit);

        renderSimpleBooks(containerId, relatedBooks);
    } catch (error) {
        console.error("Lỗi khi tải sách đơn giản:", error);
        container.innerHTML = `<p style="color:red;">Không thể tải sách liên quan.</p>`;
    }
}

// --- Hàm 7: Render danh sách sách gồm ảnh + tên + giá ---
function renderOnSale(containerId, books) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = books.map(book => `
        <div class="product-wrapper">
            <div class="product-img">
                <a href="product-details.html?id=${book.id || book.Id}">
                    <img src="${book.thumbnailUrl || 'img/product/5.jpg'}" 
                         alt="${book.title}" class="primary" />
                </a>

                <div class="quick-view">
                    <a class="action-view" href="#" data-bs-target="#productModal" 
                       data-bs-toggle="modal" title="Quick View">
                        <i class="fa fa-search-plus"></i>
                    </a>
                </div>

                <div class="product-flag">
                    <ul>
                        <li><span class="sale">new</span></li>
                    </ul>
                </div>
            </div>

            <div class="product-details text-center">
                <div class="product-rating">
                    <ul>
                        <li><a href="#"><i class="fa fa-star"></i></a></li>
                        <li><a href="#"><i class="fa fa-star"></i></a></li>
                        <li><a href="#"><i class="fa fa-star"></i></a></li>
                        <li><a href="#"><i class="fa fa-star"></i></a></li>
                        <li><a href="#"><i class="fa fa-star"></i></a></li>
                    </ul>
                </div>
                <h4>
                    <a href="product-details.html?id=${book.id || book.Id}">
                        ${book.title}
                    </a>
                </h4>

                <div class="product-price">
                    <ul>
                        <li>$${book.price || book.Price}</li>
                    </ul>
                </div>
            </div>

            <div class="product-link">
                <div class="product-button">
                    <a href="#" title="Add to cart">
                        <i class="fa fa-shopping-cart"></i>Add to cart
                    </a>
                </div>
                <div class="add-to-link">
                    <ul>
                        <li>
                            <a href="product-details.html?id=${book.id || book.Id}" title="Details">
                                <i class="fa fa-external-link"></i>
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    `).join("");
}

// --- Hàm 8: Tải danh sách sách có ảnh + tên + giá ---
async function loadOnSale(containerId, limit = 4) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = "<p>Loading books...</p>";

    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error(`HTTP error! ${response.status}`);

        const data = await response.json();
        const books = data.data || data;

        if (!Array.isArray(books) || books.length === 0) {
            container.innerHTML = "<p>No books found.</p>";
            return;
        }

        const shuffled = books.sort(() => 0.5 - Math.random());
        const selectedBooks = shuffled.slice(0, limit);

        renderOnSale(containerId, selectedBooks);
    } catch (error) {
        console.error("Lỗi khi tải sách có giá:", error);
        container.innerHTML = `<p style="color:red;">Không thể tải sách.</p>`;
    }
}

function renderUpsellProducts(containerId, books) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = books.map(book => `
        <div class="product-wrapper">
            <div class="product-img">
                <a href="product-details.html?id=${book.id || book.Id}">
                    <img src="${book.thumbnailUrl || 'img/product/5.jpg'}" 
                         alt="${book.title}" class="primary" />
                </a>

                <div class="quick-view">
                    <a class="action-view" href="#" data-bs-target="#productModal" 
                       data-bs-toggle="modal" title="Quick View">
                        <i class="fa fa-search-plus"></i>
                    </a>
                </div>

                <div class="product-flag">
                    <ul>
                        <li><span class="sale">new</span></li>
                    </ul>
                </div>
            </div>

            <div class="product-details text-center">
                <h4>
                    <a href="product-details.html?id=${book.id || book.Id}">
                        ${book.title}
                    </a>
                </h4>

                <div class="product-price">
                    <ul>
                        <li>$${book.price || book.Price}</li>
                    </ul>
                </div>
            </div>

            <div class="product-link">
                <div class="product-button">
                    <a href="#" title="Add to cart">
                        <i class="fa fa-shopping-cart"></i>Add to cart
                    </a>
                </div>
                <div class="add-to-link">
                    <ul>
                        <li>
                            <a href="product-details.html?id=${book.id || book.Id}" title="Details">
                                <i class="fa fa-external-link"></i>
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    `).join("");
}

async function loadUpsellProducts(containerId, limit = 4) {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        const books = data.data;

        const selected = books.sort(() => 0.5 - Math.random()).slice(0, limit);

        renderUpsellProducts(containerId, selected);
        setTimeout(initUpsellCarousel, 50);
    } catch (err) {
        console.error(err);
    }
}

function initOnSaleCarousel() {
    $("#on-sale").owlCarousel({
        margin: 20,
        nav: true,
        dots: false,
        loop: false
    });
}

document.addEventListener("DOMContentLoaded", () => {
    loadAllBooks();
    loadSimpleBooks("related-books", 4);
    loadOnSale("on-sale-audio", 12);
    loadUpsellProducts("upsell-products", 4);
});
