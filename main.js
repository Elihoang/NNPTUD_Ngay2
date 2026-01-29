document.addEventListener('DOMContentLoaded', () => {
    const productList = document.getElementById('product-list');

    // Mặc định sử dụng đường dẫn tương đối
    const DATA_URL = 'db.json';

    async function loadProducts() {
        try {
            const response = await fetch(DATA_URL);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const products = await response.json();
            renderProducts(products);
        } catch (error) {
            console.error('Lỗi khi tải dữ liệu:', error);
            handleError(error);
        }
    }

    function handleError(error) {
        productList.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 2rem; color: #ef4444; background: #fef2f2; border-radius: 12px;">
                <h3 style="margin-bottom: 0.5rem">Không thể tải dữ liệu</h3>
                <p>Vui lòng đảm bảo bạn đang chạy tệp này thông qua một máy chủ web (Live Server) thay vì mở trực tiếp (file://).</p>
                <p style="font-size: 0.8rem; margin-top: 1rem; color: #991b1b;">Chi tiết lỗi: ${error.message}</p>
            </div>
        `;
    }

    function renderProducts(products) {
        productList.innerHTML = ''; // Clear loading state

        products.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card';

            // --- Logic Xử Lý Hình Ảnh Cải Tiến ---
            let imageUrl = 'https://placehold.co/600x400?text=No+Image';
            
            // Hàm trợ giúp để làm sạch URL
            const cleanUrl = (url) => {
                if (!url || typeof url !== 'string') return null;
                // Loại bỏ các ký tự brackets và quote thừa nếu có
                const cleaned = url.replace(/[\[\]"]/g, '');
                return cleaned.startsWith('http') ? cleaned : null;
            };

            // 1. Thử lấy từ mảng images
            if (product.images) {
                let images = product.images;
                
                // Trường hợp API trả về chuỗi JSON stringified (ví dụ: '["url"]')
                if (typeof images === 'string') {
                    try {
                        images = JSON.parse(images);
                    } catch (e) {
                        // Nếu không parse được, coi như là một string URL đơn
                        images = [product.images];
                    }
                }

                if (Array.isArray(images) && images.length > 0) {
                    // Cố gắng tìm URL hợp lệ đầu tiên
                    for (let img of images) {
                        const validUrl = cleanUrl(img);
                        if (validUrl) {
                            imageUrl = validUrl;
                            break;
                        }
                    }
                }
            }

            // 2. Fallback: Nếu không tìm thấy ảnh trong images, thử dùng category.image
            if ((imageUrl === 'https://placehold.co/600x400?text=No+Image' || !imageUrl) && product.category && product.category.image) {
                const catImg = cleanUrl(product.category.image);
                if (catImg) {
                    imageUrl = catImg;
                }
            }
            // -------------------------------------

            // Xử lý giá tiền
            const price = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD'
            }).format(product.price);

            card.innerHTML = `
                <span class="category-badge">${product.category ? product.category.name : 'Uncategorized'}</span>
                <div class="card-image-container">
                    <img src="${imageUrl}" 
                         alt="${product.title}" 
                         class="card-image" 
                         loading="lazy"
                         onerror="this.onerror=null; this.src='https://placehold.co/600x400?text=Image+Error';">
                </div>
                <div class="card-content">
                    <h3 class="product-title" title="${product.title}">${product.title}</h3>
                    <p class="product-description" title="${product.description}">${product.description}</p>
                    <div class="card-footer">
                        <span class="product-price">${price}</span>
                        <button class="add-btn">
                            <i class="fa-solid fa-cart-shopping"></i>
                            Add to Cart
                        </button>
                    </div>
                </div>
            `;

            productList.appendChild(card);
        });
    }

    loadProducts();
});
