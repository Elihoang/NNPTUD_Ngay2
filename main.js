document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.getElementById('productTableBody');
    const searchInput = document.getElementById('searchInput');
    const productCount = document.getElementById('productCount');
    const itemsPerPageSelect = document.getElementById('itemsPerPage');
    const paginationElement = document.getElementById('pagination');
    
    // Sort buttons
    const sortNameAsc = document.getElementById('sortNameAsc');
    const sortNameDesc = document.getElementById('sortNameDesc');
    const sortPriceAsc = document.getElementById('sortPriceAsc');
    const sortPriceDesc = document.getElementById('sortPriceDesc');

    // Data storage
    let allProducts = [];
    let filteredProducts = [];
    
    // Pagination state
    let currentPage = 1;
    let itemsPerPage = 10;

    const DATA_URL = 'db.json';

    // Load products from JSON
    async function loadProducts() {
        try {
            const response = await fetch(DATA_URL);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            allProducts = await response.json();
            filteredProducts = [...allProducts];
            renderTable();
        } catch (error) {
            console.error('Lỗi khi tải dữ liệu:', error);
            handleError(error);
        }
    }

    function handleError(error) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-5">
                    <div class="alert alert-danger mx-3" role="alert">
                        <h5 class="alert-heading">
                            <i class="fas fa-exclamation-triangle me-2"></i>
                            Không thể tải dữ liệu
                        </h5>
                        <p class="mb-0">Vui lòng đảm bảo bạn đang chạy tệp này thông qua một máy chủ web (Live Server).</p>
                        <hr>
                        <p class="mb-0 small">Chi tiết lỗi: ${error.message}</p>
                    </div>
                </td>
            </tr>
        `;
    }

    // Helper function to clean image URL
    function cleanUrl(url) {
        if (!url || typeof url !== 'string') return null;
        const cleaned = url.replace(/[\[\]"]/g, '');
        return cleaned.startsWith('http') ? cleaned : null;
    }

    // Get image URL from product.images only
    function getImageUrl(product) {
        let imageUrl = 'https://placehold.co/100x80?text=No+Image';
        
        if (product.images) {
            let images = product.images;
            
            if (typeof images === 'string') {
                try {
                    images = JSON.parse(images);
                } catch (e) {
                    images = [product.images];
                }
            }

            if (Array.isArray(images) && images.length > 0) {
                for (let img of images) {
                    const validUrl = cleanUrl(img);
                    if (validUrl) {
                        imageUrl = validUrl;
                        break;
                    }
                }
            }
        }

        return imageUrl;
    }

    // Format price
    function formatPrice(price) {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0
        }).format(price * 23000); // Convert USD to VND (approximate)
    }

    // Truncate text
    function truncate(text, maxLength = 60) {
        if (!text) return '';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }

    // Get paginated products
    function getPaginatedProducts() {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredProducts.slice(startIndex, endIndex);
    }

    // Render table
    function renderTable() {
        const paginatedProducts = getPaginatedProducts();
        
        if (filteredProducts.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center py-5">
                        <i class="fas fa-inbox fa-3x text-muted mb-3"></i>
                        <p class="text-muted">Không tìm thấy sản phẩm nào</p>
                    </td>
                </tr>
            `;
            productCount.textContent = '0';
            renderPagination();
            return;
        }

        tableBody.innerHTML = paginatedProducts.map(product => {
            const imageUrl = getImageUrl(product);
            const categoryName = product.category ? product.category.name : 'N/A';
            const categoryBadgeColor = getCategoryBadgeColor(categoryName);

            return `
                <tr>
                    <td class="fw-bold text-primary">#${product.id}</td>
                    <td>
                        <img 
                            src="${imageUrl}" 
                            alt="${product.title}" 
                            class="img-thumbnail"
                            style="width: 80px; height: 60px; object-fit: cover;"
                            onerror="this.onerror=null; this.src='https://placehold.co/100x80?text=Error';">
                    </td>
                    <td>
                        <strong>${product.title}</strong>
                    </td>
                    <td class="text-muted small">${truncate(product.description, 80)}</td>
                    <td>
                        <span class="badge ${categoryBadgeColor}">
                            ${categoryName}
                        </span>
                    </td>
                    <td class="fw-bold text-success">${formatPrice(product.price)}</td>
                    <td>
                        <div class="btn-group btn-group-sm" role="group">
                            <button type="button" class="btn btn-outline-info" title="Xem chi tiết">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button type="button" class="btn btn-outline-warning" title="Sửa">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button type="button" class="btn btn-outline-danger" title="Xóa">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

        productCount.textContent = filteredProducts.length;
        renderPagination();
    }

    // Render pagination
    function renderPagination() {
        const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
        
        if (totalPages <= 1) {
            paginationElement.innerHTML = '';
            return;
        }

        let paginationHTML = '';

        // Previous button
        paginationHTML += `
            <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="${currentPage - 1}">
                    <i class="fas fa-chevron-left"></i>
                </a>
            </li>
        `;

        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            // Show first, last, current, and adjacent pages
            if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
                paginationHTML += `
                    <li class="page-item ${i === currentPage ? 'active' : ''}">
                        <a class="page-link" href="#" data-page="${i}">${i}</a>
                    </li>
                `;
            } else if (i === currentPage - 2 || i === currentPage + 2) {
                paginationHTML += `
                    <li class="page-item disabled">
                        <span class="page-link">...</span>
                    </li>
                `;
            }
        }

        // Next button
        paginationHTML += `
            <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="${currentPage + 1}">
                    <i class="fas fa-chevron-right"></i>
                </a>
            </li>
        `;

        paginationElement.innerHTML = paginationHTML;

        // Add event listeners to pagination links
        paginationElement.querySelectorAll('a.page-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = parseInt(e.currentTarget.getAttribute('data-page'));
                if (page >= 1 && page <= totalPages) {
                    currentPage = page;
                    renderTable();
                }
            });
        });
    }

    // Get category badge color
    function getCategoryBadgeColor(categoryName) {
        const colorMap = {
            'Clothes': 'bg-primary',
            'Electronics': 'bg-info',
            'Shoes': 'bg-warning text-dark',
            'Miscellaneous': 'bg-secondary',
            'Furniture': 'bg-success'
        };
        return colorMap[categoryName] || 'bg-dark';
    }

    // Search functionality with onChange event
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase().trim();
        
        if (searchTerm === '') {
            filteredProducts = [...allProducts];
        } else {
            filteredProducts = allProducts.filter(product => 
                product.title.toLowerCase().includes(searchTerm)
            );
        }
        
        currentPage = 1; // Reset to first page
        renderTable();
    });

    // Items per page change
    itemsPerPageSelect.addEventListener('change', (e) => {
        itemsPerPage = parseInt(e.target.value);
        currentPage = 1; // Reset to first page
        renderTable();
    });

    // Sort by name ascending
    sortNameAsc.addEventListener('click', () => {
        filteredProducts.sort((a, b) => a.title.localeCompare(b.title, 'vi'));
        currentPage = 1;
        renderTable();
        setActiveSort(sortNameAsc);
    });

    // Sort by name descending
    sortNameDesc.addEventListener('click', () => {
        filteredProducts.sort((a, b) => b.title.localeCompare(a.title, 'vi'));
        currentPage = 1;
        renderTable();
        setActiveSort(sortNameDesc);
    });

    // Sort by price ascending
    sortPriceAsc.addEventListener('click', () => {
        filteredProducts.sort((a, b) => a.price - b.price);
        currentPage = 1;
        renderTable();
        setActiveSort(sortPriceAsc);
    });

    // Sort by price descending
    sortPriceDesc.addEventListener('click', () => {
        filteredProducts.sort((a, b) => b.price - a.price);
        currentPage = 1;
        renderTable();
        setActiveSort(sortPriceDesc);
    });

    // Set active sort button
    function setActiveSort(activeButton) {
        [sortNameAsc, sortNameDesc, sortPriceAsc, sortPriceDesc].forEach(btn => {
            btn.classList.remove('active');
        });
        activeButton.classList.add('active');
    }

    // Initialize
    loadProducts();
});
