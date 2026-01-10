// Open Edit Modal with category data
function openEditModal(categoryId, categoryName, categoryDescription, categoryImage) {
  const modal = new bootstrap.Modal(document.getElementById('editCategoryModal'));
  
  // Populate form fields
  document.getElementById('editCategoryId').value = categoryId;
  document.getElementById('editName').value = categoryName;
  document.getElementById('editDescription').value = categoryDescription || '';
  
  // Show current image if exists
  if (categoryImage) {
    document.getElementById('currentImagePreview').style.display = 'block';
    document.getElementById('editCurrentImage').src = categoryImage;
  } else {
    document.getElementById('currentImagePreview').style.display = 'none';
  }
  
  // Clear any previous errors
  clearEditErrorMessages();
  
  // Reset file input
  document.getElementById('editImage').value = '';
  
  modal.show();
}

// Handle Edit Form Submit
async function handleEditFormSubmit(event) {
  event.preventDefault();

  if (!validateEditForm()) {
    return false;
  }

  const form = event.target;
  const formData = new FormData(form);
  const categoryId = document.getElementById('editCategoryId').value;

  clearEditErrorMessages();

  try {
    const response = await fetch(`/admin/categories/edit/${categoryId}`, {
      method: 'PUT',
      body: formData
    });

    const data = await response.json();

    if (!response.ok) {
      if (data.error) {
        document.getElementById("editNameError").textContent = data.error;
        showToast('error', data.error)
      } else {
        const msg = "Something went wrong. Please try again.";
      document.getElementById("editNameError").textContent = msg;
      showToast('error', msg);
      }
      return false;
    }


    // Close modal
    const modalEl = document.getElementById('editCategoryModal');
    const modal = bootstrap.Modal.getInstance(modalEl);
    modal.hide();


    showToast('success', data.message || 'Category updated');

// reload
    setTimeout(() => {window.location.reload();}, 1000);

    return true;

  } catch (err) {
  console.error(err);
  const msg = "Something went wrong. Please try again.";
  document.getElementById("editNameError").textContent = msg;
  showToast('error', msg);
  return false;
  }
}

// Validate Edit Form
function validateEditForm() {
  clearEditErrorMessages();

  const nameInput = document.getElementById("editName");
  const descriptionInput = document.getElementById("editDescription");
  const imageInput = document.getElementById("editImage");
  const name = nameInput.value.trim();
  const description = descriptionInput.value.trim();

  let isValid = true;

  // NAME VALIDATION
  if (!name) {
    document.getElementById("editNameError").textContent = "Category name is required.";
    isValid = false;
  } else if (name.length < 3) {
    document.getElementById("editNameError").textContent = "Category name should be at least 3 characters.";
    isValid = false;
  } else if (!/^[a-zA-Z\s]+$/.test(name)) {
    document.getElementById("editNameError").textContent = "Category name should contain only alphabetic characters.";
    isValid = false;
  }

  // DESCRIPTION VALIDATION
  if (!description) {
    document.getElementById("editDescriptionError").textContent = "Please write a description.";
    isValid = false;
  } else if (description.length < 5) {
    document.getElementById("editDescriptionError").textContent = "Description should be at least 5 characters.";
    isValid = false;
  }

  // IMAGE VALIDATION (only if a new file is selected)
  if (imageInput && imageInput.files.length > 0) {
    const file = imageInput.files[0];
    const maxSize = 2 * 1024 * 1024; // 2MB

    if (!file.type.startsWith("image/")) {
      document.getElementById("editImageError").textContent = "Please upload a valid image file.";
      isValid = false;
    } else if (file.size > maxSize) {
      document.getElementById("editImageError").textContent = "Image size should be less than 2MB.";
      isValid = false;
    }
  }

  return isValid;
}

// Clear Edit Error Messages
function clearEditErrorMessages() {
  document.getElementById("editNameError").textContent = "";
  document.getElementById("editDescriptionError").textContent = "";
  document.getElementById("editImageError").textContent = "";
}

// Attach click handlers to edit buttons
document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.btn-edit-category').forEach(button => {
    button.addEventListener('click', function() {
      const categoryId = this.dataset.id;
      const categoryName = this.dataset.name;
      const categoryDescription = this.dataset.description;
      const categoryImage = this.dataset.image;
      
      openEditModal(categoryId, categoryName, categoryDescription, categoryImage);
    });
  });
});