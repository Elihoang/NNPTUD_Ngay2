const fs = require('fs');

// Đọc file db.json
const data = JSON.parse(fs.readFileSync('db.json', 'utf8'));

// Map category to relevant image IDs from Picsum Photos
const categoryImageMap = {
    'Clothes': [
        'https://picsum.photos/seed/clothes1/600/400',
        'https://picsum.photos/seed/clothes2/600/400',
        'https://picsum.photos/seed/fashion1/600/400',
        'https://picsum.photos/seed/fashion2/600/400',
        'https://picsum.photos/seed/apparel/600/400'
    ],
    'Electronics': [
        'https://picsum.photos/seed/tech1/600/400',
        'https://picsum.photos/seed/tech2/600/400',
        'https://picsum.photos/seed/gadget1/600/400',
        'https://picsum.photos/seed/gadget2/600/400',
        'https://picsum.photos/seed/electronic/600/400'
    ],
    'Shoes': [
        'https://picsum.photos/seed/shoes1/600/400',
        'https://picsum.photos/seed/shoes2/600/400',
        'https://picsum.photos/seed/footwear1/600/400',
        'https://picsum.photos/seed/footwear2/600/400',
        'https://picsum.photos/seed/sneakers/600/400'
    ],
    'Miscellaneous': [
        'https://picsum.photos/seed/misc1/600/400',
        'https://picsum.photos/seed/misc2/600/400',
        'https://picsum.photos/seed/various1/600/400',
        'https://picsum.photos/seed/various2/600/400',
        'https://picsum.photos/seed/random/600/400'
    ],
    'Furniture': [
        'https://picsum.photos/seed/furniture1/600/400',
        'https://picsum.photos/seed/furniture2/600/400',
        'https://picsum.photos/seed/home1/600/400',
        'https://picsum.photos/seed/home2/600/400',
        'https://picsum.photos/seed/decor/600/400'
    ]
};

// Backup original file
fs.writeFileSync('db.json.backup', JSON.stringify(data, null, 4));
console.log('✅ Đã tạo backup: db.json.backup');

// Replace images
let replacedCount = 0;
data.forEach((product, index) => {
    const categoryName = product.category?.name || 'Miscellaneous';
    const imagePool = categoryImageMap[categoryName] || categoryImageMap['Miscellaneous'];
    
    // Get a consistent image for this product (based on product ID)
    const imageIndex = product.id % imagePool.length;
    const newImageUrl = imagePool[imageIndex];
    
    // Replace the images array
    product.images = [newImageUrl];
    replacedCount++;
});

// Write updated data back to db.json
fs.writeFileSync('db.json', JSON.stringify(data, null, 4));

console.log(`✅ Đã thay thế ${replacedCount} ảnh thành công!`);
console.log('✅ File db.json đã được cập nhật');
console.log('💡 Refresh trình duyệt để xem ảnh mới');
