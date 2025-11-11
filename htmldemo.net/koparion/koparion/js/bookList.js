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
							<div class="product-rating">
								<ul>
									<li><a href="#"><i class="fa fa-star"></i></a></li>
									<li><a href="#"><i class="fa fa-star"></i></a></li>
									<li><a href="#"><i class="fa fa-star"></i></a></li>
									<li><a href="#"><i class="fa fa-star"></i></a></li>
									<li><a href="#"><i class="fa fa-star-half-o"></i></a></li>
								</ul>
							</div>
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

// --- Khởi chạy ---
document.addEventListener("DOMContentLoaded", () => loadAllBooks());
