async function handleFormSubmit(event) {
    event.preventDefault();

    if (!validateForm()) {
      return false; 
    }

    const form = event.target;
    const formData = new FormData(form);

    clearErrorMessages(); 

    try {
      const response = await fetch(form.action, {
        method: form.method,
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
      
        if (data.error) {
          document.getElementById("nameError").textContent = data.error;
        } else {
          document.getElementById("nameError").textContent =
            "Something went wrong. Please try again.";
        }
        return false;
      }

     
      // close modal and reload page to show new category in table
      const modalEl = document.getElementById('addCategoryModal');
      const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
      modal.hide();

      // Optional: clear form
      form.reset();


      showToast('success', data.message || 'Category added successfully');

      // reload after short delay so user can see toast
      setTimeout(() => {
        window.location.reload();
    }, 1000);

      return true;

    } catch (err) {
      console.error(err);
       showToast('error', 'Something went wrong. Please try again.');
      return false;
    }
  }

  function validateForm() {
    clearErrorMessages();

    const nameInput = document.getElementsByName("name")[0];
    const descriptionInput = document.getElementsByName("description")[0];
    const imageInput = document.getElementsByName("image")[0];
    const name = nameInput.value.trim();
    const description = descriptionInput.value.trim();

    let isValid = true;

    // NAME VALIDATION
    if (!name) {
      document.getElementById("nameError").textContent = "Category name is required.";
      isValid = false;
    } else if (name.length < 3) {
      document.getElementById("nameError").textContent = "Category name should be at least 3 characters.";
      isValid = false;
    } else if (!/^[a-zA-Z\s]+$/.test(name)) {
      document.getElementById("nameError").textContent = "Category name should contain only alphabetic characters.";
      isValid = false;
    }

    // DESCRIPTION VALIDATION
    if (!description) {
      document.getElementById("descriptionError").textContent = "Please write a description.";
      isValid = false;
    } else if (description.length < 5) {
      document.getElementById("descriptionError").textContent = "Description should be at least 5 characters.";
      isValid = false;
    }

    // IMAGE VALIDATION 
    if (!imageInput || imageInput.files.length === 0) {
    document.getElementById("imageError").textContent = "Category image is required.";
    isValid = false;
  } else {
    const file = imageInput.files[0];
    const maxSize = 2 * 1024 * 1024; // 2MB

    if (!file.type.startsWith("image/")) {
      document.getElementById("imageError").textContent = "Please upload a valid image file.";
      isValid = false;
    } else if (file.size > maxSize) {
      document.getElementById("imageError").textContent = "Image size should be less than 2MB.";
      isValid = false;
    }
  }
     return isValid;
  }
  function clearErrorMessages() {
    document.getElementById("nameError").textContent = "";
    document.getElementById("descriptionError").textContent = "";
    document.getElementById("imageError").textContent = "";
  }
