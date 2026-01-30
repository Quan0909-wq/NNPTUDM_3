// --- QUẢN LÝ STATE (TRẠNG THÁI) ---
let allProducts = [];       // Chứa toàn bộ dữ liệu gốc từ API
let filteredProducts = [];  // Chứa dữ liệu sau khi tìm kiếm/sắp xếp
let currentPage = 1;        // Trang hiện tại
let itemsPerPage = 5;       // Số dòng mỗi trang (mặc định 5)
let sortDirection = {       // Trạng thái sắp xếp
    price: 'asc',
    title: 'asc'
};

// --- 1. HÀM GET ALL (Lấy dữ liệu từ API) ---
async function getAllProducts() {
    try {
        const response = await fetch('https://api.escuelajs.co/api/v1/products');
        const data = await response.json();
        
        // Lưu dữ liệu
        allProducts = data;
        filteredProducts = [...allProducts]; // Copy dữ liệu để thao tác
        
        renderTable();
        renderPagination();
    } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error);
        alert("Không thể tải dữ liệu sản phẩm.");
    }
}

// --- 2. HÀM RENDER BẢNG (Hiển thị dữ liệu) ---
function renderTable() {
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = '';

    // Tính toán chỉ số bắt đầu và kết thúc cho phân trang
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentData = filteredProducts.slice(startIndex, endIndex);

    if (currentData.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center; background:white; color:black;">Không tìm thấy sản phẩm</td></tr>';
        return;
    }

    currentData.forEach(product => {
        // Xử lý hình ảnh (chọn ảnh đầu tiên hoặc ảnh placeholder nếu lỗi)
        let imageUrl = (product.images && product.images.length > 0) ? product.images[0] : 'https://via.placeholder.com/80';
        // Clean URL nếu API trả về chuỗi JSON bị lỗi (trường hợp đặc thù của API này đôi khi xảy ra)
        if (imageUrl.startsWith('["') && imageUrl.endsWith('"]')) {
            imageUrl = JSON.parse(imageUrl)[0];
        }

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.id}</td>
            <td><img src="${imageUrl}" alt="${product.title}" class="product-img" onerror="this.src='https://via.placeholder.com/80'"></td>
            <td>${product.title}</td>
            <td>$${product.price}</td>
        `;
        tableBody.appendChild(row);
    });
}

// --- 3. XỬ LÝ TÌM KIẾM (onChange) ---
function handleSearch(keyword) {
    const lowerKeyword = keyword.toLowerCase();
    
    // Lọc dữ liệu từ mảng gốc
    filteredProducts = allProducts.filter(product => 
        product.title.toLowerCase().includes(lowerKeyword)
    );

    // Reset về trang 1 khi tìm kiếm
    currentPage = 1;
    renderTable();
    renderPagination();
}

// --- 4. XỬ LÝ PHÂN TRANG (Pagination) ---
function handlePageSizeChange(size) {
    itemsPerPage = parseInt(size);
    currentPage = 1; // Reset về trang 1
    renderTable();
    renderPagination();
}

function changePage(page) {
    currentPage = page;
    renderTable();
    renderPagination();
}

function renderPagination() {
    const paginationDiv = document.getElementById('paginationControls');
    paginationDiv.innerHTML = '';

    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

    // Tạo nút cho từng trang (Giới hạn hiển thị đơn giản)
    // Nếu quá nhiều trang, bạn có thể thêm logic "..."
    // Ở đây demo hiển thị Prev, Next và số trang hiện tại
    
    // Nút Trước
    const prevBtn = document.createElement('button');
    prevBtn.innerText = '<';
    prevBtn.disabled = currentPage === 1;
    prevBtn.onclick = () => changePage(currentPage - 1);
    paginationDiv.appendChild(prevBtn);

    // Hiển thị thông tin trang (VD: Trang 1 / 10)
    const infoSpan = document.createElement('span');
    infoSpan.style.padding = '8px';
    infoSpan.innerText = `Trang ${currentPage} / ${totalPages}`;
    paginationDiv.appendChild(infoSpan);

    // Nút Sau
    const nextBtn = document.createElement('button');
    nextBtn.innerText = '>';
    nextBtn.disabled = currentPage === totalPages || totalPages === 0;
    nextBtn.onclick = () => changePage(currentPage + 1);
    paginationDiv.appendChild(nextBtn);
}

// --- 5. XỬ LÝ SẮP XẾP (Sort) ---
function handleSort(key) {
    // Đảo ngược chiều sắp xếp hiện tại
    const currentDir = sortDirection[key];
    const newDir = currentDir === 'asc' ? 'desc' : 'asc';
    sortDirection[key] = newDir;

    // Logic sắp xếp
    filteredProducts.sort((a, b) => {
        let valA = a[key];
        let valB = b[key];

        // Nếu là chuỗi thì so sánh chuỗi
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();

        if (valA < valB) return newDir === 'asc' ? -1 : 1;
        if (valA > valB) return newDir === 'asc' ? 1 : -1;
        return 0;
    });

    renderTable();
}

// --- KHỞI CHẠY KHI TRANG LOAD ---
document.addEventListener('DOMContentLoaded', getAllProducts);