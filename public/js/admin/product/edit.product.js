let TOTAL_EXISTING_IMAGES = 0;

document.addEventListener('DOMContentLoaded', () => {
  TOTAL_EXISTING_IMAGES =
    document.querySelectorAll('[name="removeImages[]"]').length;

  updateImageCount();
});


let selectedImages = [];
let cropper = null;

document.addEventListener('DOMContentLoaded', function() {
    updateImageCount();


document.getElementById('saveProductBtn')
  .addEventListener('click', () => {
    validateForm();
  });

    // Add Variant Button Handler
    document.getElementById('addVariantBtn').addEventListener('click', function() {
        const container = document.getElementById('variantContainer');
        const variantRow = container.querySelector('.variant-row');
        
        const newVariant = document.createElement('div');
        newVariant.className = 'mb-3';
        newVariant.innerHTML = `
            <div class="d-flex gap-3 align-items-start">
                <div class="flex-fill">
                    <input type="text" name="variantName[]" class="form-control" placeholder="Size (e.g., 50ml)">
                    <div class="variant-error text-danger small"></div>
                </div>
                <div class="flex-fill">
                    <input type="number" name="variantPrice[]" step="0.01" class="form-control" placeholder="Price ($)">
                    <div class="variant-error text-danger small"></div>
                </div>
                <div class="flex-fill">
                    <input type="number" name="variantStock[]" class="form-control" placeholder="Stock">
                    <div class="variant-error text-danger small"></div>
                </div>
                <button type="button" class="btn btn-light border removeVariant" style="min-width: 40px;">
                    <i class="bi bi-x-lg"></i>
                </button>
            </div>
        `;
        variantRow.appendChild(newVariant);
    });

    // Remove Variant Handler
    document.getElementById('variantContainer').addEventListener('click', function(e) {
        if (e.target.closest('.removeVariant')) {
            const allVariants = document.querySelectorAll('#variantContainer .d-flex.gap-3');
            if (allVariants.length > 1) {
                e.target.closest('.mb-3').remove();
            } else {
                showError('variant-main-error', 'At least one variant is required');
                setTimeout(() => clearError('variant-main-error'), 3000);
            }
        }
    });

    // Track removed existing images
    document.getElementById('imageThumbnails').addEventListener('change', function(e) {
        if (e.target.name === 'removeImages[]') {
            updateImageCount();
        }
    });

    // New Image Upload Handler
    const imageInput = document.getElementById('productImages');
    if (imageInput) {
        imageInput.addEventListener('change', function(e) {
            handleImageSelection(e.target.files);
            e.target.value = '';
        });
    }
});

// Handle new image selection
function handleImageSelection(files) {
    const remainingExisting = getRemainingExistingImagesCount();
    const currentTotal = remainingExisting + selectedImages.length;
    const availableSlots = 3 - currentTotal;

    if (availableSlots <= 0) {
        showError('imageError', 'Remove existing images first');
        return;
    }

    for (let i = 0; i < Math.min(files.length, availableSlots); i++) {
        selectedImages.push(files[i]);
    }

    displayNewImageThumbnails();
    updateImageCount();
}


// Get count of existing images that are NOT marked for removal
function getRemainingExistingImagesCount() {
    const markedForRemoval = document.querySelectorAll('[name="removeImages[]"]:checked').length;
    return TOTAL_EXISTING_IMAGES - markedForRemoval;
}


// Display thumbnails for newly uploaded images
function displayNewImageThumbnails() {
    // Remove previous new image thumbnails
    document.querySelectorAll('[data-new-image]').forEach(el => el.remove());
    
    const container = document.getElementById('imageThumbnails');
    
    selectedImages.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const col = document.createElement('div');
            col.className = 'col-3';
            col.setAttribute('data-new-image', index);
            col.innerHTML = `
                <div class="position-relative">
                    <img src="${e.target.result}" class="img-fluid rounded" style="height: 120px; object-fit: cover; width: 100%;">
                    <button type="button" class="btn btn-sm btn-danger position-absolute top-0 end-0 m-1 remove-new-image" data-index="${index}" title="Remove">
                        <i class="bi bi-x"></i>
                    </button>
                    <span class="badge bg-success position-absolute bottom-0 start-0 m-1">New</span>
                </div>
            `;
            container.appendChild(col);
        };
        reader.readAsDataURL(file);
    });

    // Attach remove handlers for new images
    setTimeout(() => {
        document.querySelectorAll('.remove-new-image').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                selectedImages.splice(index, 1);
                displayNewImageThumbnails();
                updateImageCount();
            });
        });
    }, 100);
}

// Update image count display
function updateImageCount() {
    const countElement = document.getElementById('imageCount');
    const errorElement = document.getElementById('imageError');
    
    const remainingExisting = getRemainingExistingImagesCount();
    const totalImages = remainingExisting + selectedImages.length;
    
    // Clear previous error if count is valid
    if (totalImages >= 3) {
        errorElement.textContent = '';
    }
    
    if (totalImages === 0) {
        countElement.textContent = 'No images selected. 3 images required.';
        countElement.className = 'text-danger small mt-2';
    } else if (totalImages < 3) {
        countElement.textContent = `${totalImages}/3 images selected. ${3 - totalImages} more needed.`;
        countElement.className = 'text-warning small mt-2';
    } else if (totalImages === 3) {
        countElement.textContent = `${totalImages}/3 images selected ✓`;
        countElement.className = 'text-success small mt-2';
    } else {
        countElement.textContent = `${totalImages}/3 images - Too many! Remove ${totalImages - 3}.`;
        countElement.className = 'text-danger small mt-2';
    }
}

// Form Validation
function validateForm() {
    let isValid = true;
    clearErrors();

    // Validate Product Name
    const productName = document.querySelector('[name="productName"]').value.trim();
    if (!productName) {
        showError('error-productName', 'Product name is required');
        isValid = false;
    } else if (productName.length < 3) {
        showError('error-productName', 'Product name must be at least 3 characters');
        isValid = false;
    }

    // Validate Description
    const description = document.querySelector('[name="description"]').value.trim();
    if (!description) {
        showError('error-description', 'Description is required');
        isValid = false;
    } else if (description.length < 10) {
        showError('error-description', 'Description must be at least 10 characters');
        isValid = false;
    }

    // Validate Category
    const category = document.querySelector('[name="category"]').value;
    if (!category) {
        showError('error-category', 'Category is required');
        isValid = false;
    }

    // Validate Variants
    const variantNames = document.querySelectorAll('[name="variantName[]"]');
    const variantPrices = document.querySelectorAll('[name="variantPrice[]"]');
    const variantStocks = document.querySelectorAll('[name="variantStock[]"]');

    if (variantNames.length === 0) {
        showError('variant-main-error', 'At least one variant is required');
        isValid = false;
    }

    variantNames.forEach((input, index) => {
        const name = input.value.trim();
        const price = variantPrices[index].value;
        const quantity = variantStocks[index].value;

        if (!name) {
            input.nextElementSibling.textContent = 'Variant name required';
            isValid = false;
        }
        if (!price || price <= 0) {
            variantPrices[index].nextElementSibling.textContent = 'Valid price required';
            isValid = false;
        }
        if (!quantity || quantity < 0) {
            variantStocks[index].nextElementSibling.textContent = 'Valid stock required';
            isValid = false;
        }
    });

    // Validate Images - MUST BE EXACTLY 3
    const remainingExisting = getRemainingExistingImagesCount();
    const totalImages = remainingExisting + selectedImages.length;
    
if (totalImages !== 3) {
   showError('imageError', 'Exactly 3 images required');
   isValid=false;
}

    // Validate new image files (if any)
    if (selectedImages.length > 0) {
        for (let i = 0; i < selectedImages.length; i++) {
            const file = selectedImages[i];
            if (!file.type.match('image/jpeg') && !file.type.match('image/png') && !file.type.match('image/jpg')) {
                showError('imageError', 'Only PNG, JPG, JPEG files are allowed');
                isValid = false;
                break;
            }
            if (file.size > 2 * 1024 * 1024) {
                showError('imageError', 'Each image must be less than 2MB');
                isValid = false;
                break;
            }
        }
    }

    if (isValid) {
        submitForm();
    } else {
        // Scroll to first error
        const firstError = document.querySelector('.text-danger:not(:empty)');
        if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
}

// Submit Form with AJAX
async function submitForm() {
    const productId = document.getElementById('productId').value;
    const formData = new FormData();

    const submitBtn = document.getElementById('saveProductBtn');
    const originalBtnText = submitBtn.innerHTML;

    submitBtn.disabled = true;
    submitBtn.innerHTML =
      '<span class="spinner-border spinner-border-sm me-2"></span>Updating...';

    try {
        formData.append('productName', document.querySelector('[name="productName"]').value.trim());
        formData.append('description', document.querySelector('[name="description"]').value.trim());
        formData.append('category', document.querySelector('[name="category"]').value);
        formData.append('status', document.querySelector('[name="status"]').value);
        formData.append('featured', document.querySelector('[name="featured"]').checked);

        const variantNames = document.querySelectorAll('[name="variantName[]"]');
        const variantPrices = document.querySelectorAll('[name="variantPrice[]"]');
        const variantStocks = document.querySelectorAll('[name="variantStock[]"]');

        const variants = [];
        variantNames.forEach((input, index) => {
            variants.push({
                size: input.value.trim(),
                price: parseFloat(variantPrices[index].value),
                quantity: parseInt(variantStocks[index].value)
            });
        });
        formData.append('variants', JSON.stringify(variants));

        document.querySelectorAll('[name="removeImages[]"]:checked')
          .forEach(cb => formData.append('removeImages[]', cb.value));

        selectedImages.forEach(img => formData.append('images', img));

        const response = await fetch(`/admin/products/edit/${productId}`, {
            method: 'PUT',
            body: formData
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            alert(data.message || 'Failed to update product');
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
            return;
        }

        showToast('success', 'Product updated successfully!');
        setTimeout(() => window.location.href = '/admin/products', 1000);

    } catch (error) {
        console.error(error);
        showToast('error', 'An error occurred');
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
    }
}


function showError(id, message) {
    const errorElement = document.getElementById(id);
    if (errorElement) {
        errorElement.textContent = message;
    }
}

function clearError(id) {
    const errorElement = document.getElementById(id);
    if (errorElement) {
        errorElement.textContent = '';
    }
}

function clearErrors() {
    document.querySelectorAll('.text-danger').forEach(el => el.textContent = '');
    document.querySelectorAll('.variant-error').forEach(el => el.textContent = '');
}