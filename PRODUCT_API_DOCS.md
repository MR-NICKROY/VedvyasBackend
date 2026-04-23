# 🌾 Vedvyas Product API Documentation

## **Updated Product Schema**

The Product model has been completely redesigned to support rich product information with multiple sections.

### **Product Fields Overview**

```javascript
{
  // Basic Information
  title: String (required),
  tags: [String] (optional),
  name: String (required),
  slug: String (required, unique),

  // Images
  mainImages: [String], // Multiple product images
  description: String (required),
  descriptionImages: [String], // Multiple description images (optional)

  // Pricing
  oldPrice: Number (optional),
  newPrice: Number (required),

  // Variants
  weights: [
    { value: String } // e.g., "250ml", "500ml", "1L"
  ],
  availableQuantity: Number (required),

  // Additional Details
  descriptionDetails: [
    { 
      title: String,
      description: String
    }
  ],

  // Nutritional Information
  nutritionalImages: [String], // (optional)
  nutritionalInfo: [
    {
      name: String,
      value: String // e.g., "Energy", "897kcal"
    }
  ],

  // Lists
  ingredients: [String],
  healthBenefits: [String],

  // Manufacturing Info
  howItsMade: String (optional),

  // Status & Ratings
  isActive: Boolean (default: true),
  averageRating: Number (0-5),
  totalReviews: Number,

  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

---

## **API Endpoints**

### **1. CREATE PRODUCT**

**Endpoint:** `POST /api/products`

**Authentication:** Required (Admin)

**Form Data Example:**

```
title: "Pure Golden A2 Ghee"
tags: ["organic", "ayurvedic", "farm-fresh"]
name: "Pure Golden Ghee - Bilona Method"
slug: "pure-golden-ghee-bilona"
description: "100% pure A2 Gir Cow Ghee made using ancient Bilona method"
newPrice: 599
oldPrice: 699
availableQuantity: 100
weights: [{"value": "250ml"}, {"value": "500ml"}, {"value": "1L"}]

descriptionDetails: [
  {"title": "Pure & Natural", "description": "No additives or preservatives"},
  {"title": "Hand-Churned", "description": "Made using traditional Bilona method"}
]

nutritionalInfo: [
  {"name": "Energy", "value": "897 kcal"},
  {"name": "Total Fat", "value": "99.8g"},
  {"name": "Saturated Fat", "value": "62g"}
]

ingredients: ["100% A2 Gir Cow Milk Butterfat"]

healthBenefits: [
  "Rich in Omega-3 fatty acids",
  "Improves digestion",
  "Boosts immunity",
  "High smoke point - safe for cooking"
]

howItsMade: "Our A2 Ghee is crafted using the ancient Vedic Bilona method..."

isActive: true

// Files (multipart/form-data)
mainImages: [file1.jpg, file2.jpg]
descriptionImages: [file3.jpg]
nutritionalImages: [file4.jpg]
```

**cURL Example:**

```bash
curl -X POST http://localhost:5000/api/products \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "title=Pure Golden A2 Ghee" \
  -F "tags[0]=organic" \
  -F "tags[1]=ayurvedic" \
  -F "name=Pure Golden Ghee - Bilona Method" \
  -F "slug=pure-golden-ghee-bilona" \
  -F "description=100% pure A2 Gir Cow Ghee" \
  -F "newPrice=599" \
  -F "oldPrice=699" \
  -F "availableQuantity=100" \
  -F "weights=[{\"value\":\"250ml\"},{\"value\":\"500ml\"}]" \
  -F "mainImages=@product1.jpg" \
  -F "mainImages=@product2.jpg" \
  -F "descriptionImages=@desc.jpg" \
  -F "nutritionalImages=@nutrition.jpg" \
  -F "isActive=true"
```

**Success Response (201):**

```json
{
  "success": true,
  "statusCode": 201,
  "data": {
    "_id": "65f1a2b3c4d5e6f7a8b9c0d1",
    "title": "Pure Golden A2 Ghee",
    "tags": ["organic", "ayurvedic", "farm-fresh"],
    "name": "Pure Golden Ghee - Bilona Method",
    "slug": "pure-golden-ghee-bilona",
    "mainImages": ["https://cloudinary.com/..."],
    "description": "100% pure A2 Gir Cow Ghee made using ancient Bilona method",
    "descriptionImages": ["https://cloudinary.com/..."],
    "newPrice": 599,
    "oldPrice": 699,
    "weights": [
      { "value": "250ml" },
      { "value": "500ml" },
      { "value": "1L" }
    ],
    "availableQuantity": 100,
    "descriptionDetails": [
      {
        "title": "Pure & Natural",
        "description": "No additives or preservatives"
      }
    ],
    "nutritionalInfo": [
      { "name": "Energy", "value": "897 kcal" },
      { "name": "Total Fat", "value": "99.8g" }
    ],
    "ingredients": ["100% A2 Gir Cow Milk Butterfat"],
    "healthBenefits": [
      "Rich in Omega-3 fatty acids",
      "Improves digestion"
    ],
    "howItsMade": "Our A2 Ghee is crafted...",
    "isActive": true,
    "averageRating": 0,
    "totalReviews": 0,
    "createdAt": "2024-03-15T10:30:00Z",
    "updatedAt": "2024-03-15T10:30:00Z"
  },
  "message": "Product created successfully"
}
```

---

### **2. GET ALL PRODUCTS**

**Endpoint:** `GET /api/products?page=1&limit=10&keyword=ghee&sort=price`

**Query Parameters:**
- `page` (optional, default: 1)
- `limit` (optional, default: 10)
- `keyword` (optional) - searches in title, name, tags
- `sort` (optional) - "price" to sort by newPrice, otherwise by newest

**Response:**

```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "products": [
      {
        "_id": "65f1a2b3c4d5e6f7a8b9c0d1",
        "title": "Pure Golden A2 Ghee",
        "tags": ["organic", "ayurvedic"],
        "name": "Pure Golden Ghee - Bilona Method",
        "slug": "pure-golden-ghee-bilona",
        "mainImages": ["https://..."],
        "newPrice": 599,
        "oldPrice": 699,
        "availableQuantity": 100,
        "weights": [{"value": "250ml"}, {"value": "500ml"}],
        "isActive": true
      }
    ],
    "page": 1,
    "pages": 5,
    "total": 47
  }
}
```

---

### **3. GET SINGLE PRODUCT**

**Endpoint:** `GET /api/products/:id` or `GET /api/products/:slug`

**Example:**
```
GET /api/products/pure-golden-ghee-bilona
GET /api/products/65f1a2b3c4d5e6f7a8b9c0d1
```

**Response:** Full product object with all fields

---

### **4. UPDATE PRODUCT**

**Endpoint:** `PUT /api/products/:id`

**Authentication:** Required (Admin)

**Behavior:**
- Images are **appended** to existing images (not replaced)
- Other fields are **replaced** completely
- Slug uniqueness is validated

**Form Data Example:**

```
title: "Pure Golden A2 Ghee - Special"
newPrice: 549
availableQuantity: 150
healthBenefits: [
  "Rich in Omega-3 fatty acids",
  "Improves digestion",
  "Boosts immunity",
  "Glowing skin benefits"
]
mainImages: [file1.jpg] // This will be ADDED to existing images
```

**Response:** Updated product object

---

### **5. DELETE PRODUCT**

**Endpoint:** `DELETE /api/products/:id`

**Authentication:** Required (Admin)

**Response:**

```json
{
  "success": true,
  "statusCode": 200,
  "data": null,
  "message": "Product removed successfully"
}
```

---

## **Field Details**

### **title**
- **Type:** String
- **Required:** Yes
- **Purpose:** Main product title displayed prominently
- **Example:** "Pure Golden A2 Ghee"

### **tags**
- **Type:** Array of Strings
- **Required:** No
- **Purpose:** Categorize products with multiple tags
- **Example:** `["organic", "ayurvedic", "farm-fresh"]`
- **Search:** Tags are searchable

### **name**
- **Type:** String
- **Required:** Yes
- **Purpose:** Full product name/description
- **Example:** "Pure Golden Ghee - Bilona Method"

### **slug**
- **Type:** String (unique, indexed)
- **Required:** Yes
- **Purpose:** URL-friendly identifier
- **Example:** "pure-golden-ghee-bilona"
- **Validation:** Must be unique

### **mainImages**
- **Type:** Array of Cloudinary URLs
- **Required:** Yes (at least 1 on creation)
- **Purpose:** Product display images
- **Upload:** Multiple files via multipart/form-data

### **description**
- **Type:** String
- **Required:** Yes
- **Purpose:** Short product description
- **Max Length:** No limit (recommend 500 chars)

### **descriptionImages**
- **Type:** Array of URLs
- **Optional:** Yes
- **Purpose:** Additional images for product description section

### **newPrice**
- **Type:** Number
- **Required:** Yes
- **Purpose:** Current selling price in ₹
- **Example:** 599

### **oldPrice**
- **Type:** Number
- **Optional:** Yes
- **Purpose:** Original/strikethrough price for discounts
- **Example:** 699

### **weights**
- **Type:** Array of Objects
- **Structure:** `{ value: String }`
- **Optional:** No (but can be empty)
- **Purpose:** Size/quantity variants available
- **Examples:**
  ```javascript
  [
    { "value": "250ml" },
    { "value": "500ml" },
    { "value": "1L" }
  ]
  ```

### **availableQuantity**
- **Type:** Number
- **Required:** Yes
- **Purpose:** Total stock available
- **Validation:** Must be >= 0

### **descriptionDetails**
- **Type:** Array of Objects
- **Structure:** `{ title: String, description: String }`
- **Optional:** Yes
- **Purpose:** Structured details sections
- **Example:**
  ```javascript
  [
    {
      "title": "Pure & Natural",
      "description": "No additives or preservatives"
    },
    {
      "title": "Hand-Churned",
      "description": "Made using traditional Bilona method"
    }
  ]
  ```

### **nutritionalImages**
- **Type:** Array of URLs
- **Optional:** Yes
- **Purpose:** Display images for nutritional information

### **nutritionalInfo**
- **Type:** Array of Objects
- **Structure:** `{ name: String, value: String }`
- **Optional:** Yes
- **Purpose:** Nutritional facts
- **Example:**
  ```javascript
  [
    { "name": "Energy", "value": "897 kcal" },
    { "name": "Total Fat", "value": "99.8g" },
    { "name": "Saturated Fat", "value": "62g" },
    { "name": "Cholesterol", "value": "256mg" }
  ]
  ```

### **ingredients**
- **Type:** Array of Strings
- **Optional:** Yes
- **Purpose:** List of ingredients
- **Example:**
  ```javascript
  [
    "100% A2 Gir Cow Milk Butterfat"
  ]
  ```

### **healthBenefits**
- **Type:** Array of Strings
- **Optional:** Yes
- **Purpose:** List of health benefits
- **Example:**
  ```javascript
  [
    "Rich in Omega-3 fatty acids",
    "Improves digestion",
    "Boosts immunity",
    "Glowing skin",
    "High smoke point"
  ]
  ```

### **howItsMade**
- **Type:** String
- **Optional:** Yes
- **Purpose:** Description of manufacturing process
- **Example:** "Our A2 Ghee is crafted using the ancient Vedic Bilona method..."

### **isActive**
- **Type:** Boolean
- **Default:** true
- **Purpose:** Control product visibility
- **Note:** Only active products shown to public users

---

## **Complete Example - Creating a Product**

### **JavaScript/Node.js Example:**

```javascript
const FormData = require('form-data');
const fs = require('fs');
const axios = require('axios');

async function createProduct() {
  const formData = new FormData();

  // Add text fields
  formData.append('title', 'Pure Golden A2 Ghee');
  formData.append('tags', JSON.stringify(['organic', 'ayurvedic']));
  formData.append('name', 'Pure Golden Ghee - Bilona Method');
  formData.append('slug', 'pure-golden-ghee-bilona');
  formData.append('description', '100% pure A2 Gir Cow Ghee made using ancient Bilona method');
  formData.append('newPrice', 599);
  formData.append('oldPrice', 699);
  formData.append('availableQuantity', 100);

  // Add JSON arrays
  formData.append('weights', JSON.stringify([
    { value: '250ml' },
    { value: '500ml' },
    { value: '1L' }
  ]));

  formData.append('nutritionalInfo', JSON.stringify([
    { name: 'Energy', value: '897 kcal' },
    { name: 'Total Fat', value: '99.8g' }
  ]));

  formData.append('ingredients', JSON.stringify([
    '100% A2 Gir Cow Milk Butterfat'
  ]));

  formData.append('healthBenefits', JSON.stringify([
    'Rich in Omega-3 fatty acids',
    'Improves digestion',
    'Boosts immunity'
  ]));

  // Add files
  formData.append('mainImages', fs.createReadStream('image1.jpg'));
  formData.append('mainImages', fs.createReadStream('image2.jpg'));
  formData.append('nutritionalImages', fs.createReadStream('nutrition.jpg'));

  try {
    const response = await axios.post(
      'http://localhost:5000/api/products',
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          'Authorization': `Bearer ${token}`
        }
      }
    );

    console.log('Product created:', response.data.data);
  } catch (error) {
    console.error('Error:', error.response.data);
  }
}

createProduct();
```

### **HTML Form Example:**

```html
<form enctype="multipart/form-data" id="productForm">
  <input type="text" name="title" placeholder="Product Title" required>
  <input type="text" name="name" placeholder="Product Name" required>
  <input type="text" name="slug" placeholder="Product Slug" required>
  <textarea name="description" placeholder="Description" required></textarea>
  <input type="number" name="newPrice" placeholder="New Price" required>
  <input type="number" name="oldPrice" placeholder="Old Price">
  <input type="number" name="availableQuantity" placeholder="Available Quantity" required>
  
  <!-- For arrays, send as JSON -->
  <input type="hidden" name="weights" value='[{"value":"250ml"},{"value":"500ml"}]'>
  <input type="hidden" name="tags" value='["organic","ayurvedic"]'>
  
  <input type="file" name="mainImages" multiple accept="image/*" required>
  <input type="file" name="descriptionImages" multiple accept="image/*">
  <input type="file" name="nutritionalImages" multiple accept="image/*">
  
  <button type="submit">Create Product</button>
</form>

<script>
document.getElementById('productForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  
  const response = await fetch('/api/products', {
    method: 'POST',
    body: formData,
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const data = await response.json();
  console.log(data);
});
</script>
```

---

## **Error Responses**

### **400 Bad Request**

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Missing required fields: title, name, slug, description, newPrice, availableQuantity"
}
```

### **400 Slug Already Exists**

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Product with this slug already exists"
}
```

### **404 Not Found**

```json
{
  "success": false,
  "statusCode": 404,
  "message": "Product not found"
}
```

### **401 Unauthorized**

```json
{
  "success": false,
  "statusCode": 401,
  "message": "Authentication required"
}
```

---

## **Testing with Postman**

1. **Create new POST request** to `http://localhost:5000/api/products`
2. **Set header:** `Authorization: Bearer YOUR_TOKEN`
3. **Select Body:** form-data
4. **Add fields:**
   - Text: title, name, slug, description, newPrice, availableQuantity
   - File: mainImages, descriptionImages, nutritionalImages
   - Text (for arrays): weights, tags, nutritionalInfo, etc. (as JSON strings)

---

## **Database Migration Notes**

If migrating from old schema:
1. Old `productImages` → New `mainImages`
2. Old `quantities` → New `weights` (just keep the label as value)
3. Old `prices` → New `newPrice` (use first price value)
4. Old `stock` → New `availableQuantity`

**Migration Script (optional):**
```javascript
db.products.updateMany({}, [
  {
    $set: {
      mainImages: { $ifNull: ['$productImages', []] },
      weights: {
        $map: {
          input: { $ifNull: ['$quantities', []] },
          as: 'q',
          in: { value: '$$q.label' }
        }
      },
      newPrice: { $arrayElemAt: ['$prices.value', 0] },
      availableQuantity: '$stock'
    }
  }
]);
```

---

## **Best Practices**

1. **Slug Format:** Use lowercase with hyphens (e.g., `pure-golden-ghee-bilona`)
2. **Images:** Compress before upload for faster loading
3. **JSON Fields:** Always send as JSON strings in form data
4. **Prices:** Store as numbers, format in frontend
5. **Quantities:** Keep track of actual stock levels
6. **Tags:** Use consistent, predefined tags for filtering

