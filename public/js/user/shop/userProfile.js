document.addEventListener("DOMContentLoaded", () => {
  const editBtn = document.getElementById("editBtn");
  const cancelBtn = document.getElementById("cancelBtn");
  const actionButtons = document.getElementById("actionButtons");
  const editImageBtn = document.getElementById("editImageBtn");
  const imageInput = document.getElementById("imageInput");
  const profileImage = document.getElementById("profileImage");

  const profileForm = document.getElementById("profileForm");
  const passwordForm = document.getElementById("changePasswordForm");
  
  console.log("Profile form found:", !!profileForm);
  console.log("Password form found:", !!passwordForm);
  
  const inputs = profileForm.querySelectorAll("input[type='text'], input[type='email']");

  const initialValues = {};
  inputs.forEach(i => initialValues[i.name] = i.value);

  // EDIT MODE
  editBtn.addEventListener("click", () => {
    inputs.forEach(i => i.removeAttribute("readonly"));
    actionButtons.classList.remove("d-none");
    editImageBtn.classList.remove("d-none");
    editBtn.classList.add("d-none");
  });

  // CANCEL EDIT
  cancelBtn.addEventListener("click", () => {
    inputs.forEach(i => {
      i.value = initialValues[i.name];
      i.setAttribute("readonly", true);
    });
    imageInput.value = "";
    actionButtons.classList.add("d-none");
    editImageBtn.classList.add("d-none");
    editBtn.classList.remove("d-none");
    clearErrors();
  });

  // IMAGE UPLOAD
  editImageBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    imageInput.click();
  });

  imageInput.addEventListener("change", () => {
    const file = imageInput.files[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    const maxSize = 2 * 1024 * 1024;

    clearError("imageError");

    if (!validTypes.includes(file.type)) {
      showError("imageError", "Only JPG, PNG or WEBP allowed");
      imageInput.value = "";
      return;
    }

    if (file.size > maxSize) {
      showError("imageError", "Image size must be under 2MB");
      imageInput.value = "";
      return;
    }

    // Preview the image
    const reader = new FileReader();
    reader.onload = function(e) {
      profileImage.src = e.target.result;
    };
    reader.readAsDataURL(file);
    
    console.log("Image selected:", file.name);
  });

  // PROFILE FORM SUBMIT
  profileForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log("Form submitting...");
    clearErrors();

    const saveBtn = profileForm.querySelector('button[type="submit"]');
    const originalBtnText = saveBtn.textContent;
    saveBtn.disabled = true;
    saveBtn.textContent = "Saving...";

    const name = profileForm.fullName.value.trim();
    const email = profileForm.email.value.trim();
    const phone = profileForm.phone.value.trim();

    let isValid = true;

    if (!/^[a-zA-Z ]{3,20}$/.test(name)) {
      showError("nameError", "Enter a valid name (3-20 characters, letters only)");
      isValid = false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showError("emailError", "Invalid email address");
      isValid = false;
    }

    if (!/^[6-9]\d{9}$/.test(phone)) {
      showError("phoneError", "Invalid phone number (must start with 6-9)");
      isValid = false;
    }

    if (!isValid) {
      saveBtn.disabled = false;
      saveBtn.textContent = originalBtnText;
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("phone", phone);

    if (imageInput.files[0]) {
      formData.append("profileImage", imageInput.files[0]);
      console.log("Image included in submission:", imageInput.files[0].name);
    }

    try {
      const res = await fetch("/profile/update", {
        method: "POST",
        body: formData
      });

      const data = await res.json();

      if (!res.ok) {
        showToastMessage(data.message || "Profile update failed", 'error');
        saveBtn.disabled = false;
        saveBtn.textContent = originalBtnText;
        return;
      }

      if (data.otpRequired) {
        showToastMessage(data.message || "OTP sent to new email", 'success');
        setTimeout(() => {
          window.location.href = data.redirectUrl;
        }, 1500);
        return;
      }

      // Success - update UI
      showToastMessage(data.message || "Profile updated successfully", 'success');
      
      // Update initial values with new values
      inputs.forEach(i => {
        initialValues[i.name] = i.value;
      });

      // Exit edit mode after short delay
      setTimeout(() => {
        exitEditMode();
      }, 800);

    } catch (err) {
      console.error("Profile update error:", err);
      showToastMessage('Something went wrong. Please try again.', 'error');
      saveBtn.disabled = false;
      saveBtn.textContent = originalBtnText;
    }
  });

  // CHANGE PASSWORD FORM
  if (passwordForm) {
    passwordForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      clearPasswordErrors();

      const currentPassword = document.getElementById("currentPassword");
      const newPassword = document.getElementById("newPassword");
      const confirmPassword = document.getElementById("confirmPassword");

      if (!currentPassword || !newPassword || !confirmPassword) {
        console.error("Password form fields not found");
        return;
      }

      const currentPwd = currentPassword.value.trim();
      const newPwd = newPassword.value.trim();
      const confirmPwd = confirmPassword.value.trim();

      const submitBtn = passwordForm.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = "Updating...";

      let isValid = true;

      // Validate current password
      if (!currentPwd) {
        showError("oldpasswoedError", "Current password is required");
        isValid = false;
      }

      // Validate new password
      if (!newPwd) {
        showError("newpasswordError", "New password is required");
        isValid = false;
      } else if (newPwd.length < 8 || newPwd.length > 15) {
        showError("newpasswordError", "Password must be 8-15 characters long");
        isValid = false;
      } else if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(newPwd)) {
        showError("newpasswordError", "Password must contain letters and numbers");
        isValid = false;
      }

      // Validate confirm password
      if (!confirmPwd) {
        showError("confirmpassword", "Please confirm your password");
        isValid = false;
      } else if (newPwd !== confirmPwd) {
        showError("confirmpassword", "Passwords do not match");
        isValid = false;
      }

      if (!isValid) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
        return;
      }

      try {
        const res = await fetch("/profile/change-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            currentPassword: currentPwd,
            newPassword: newPwd
          })
        });

        const data = await res.json();

        if (!res.ok) {
          // Show specific error from backend
          if (data.message.includes("Current password")) {
            showError("oldpasswoedError", data.message);
          } else {
            showToastMessage(data.message || "Password update failed", 'error');
          }
          submitBtn.disabled = false;
          submitBtn.textContent = originalBtnText;
          return;
        }

        showToastMessage(data.message || 'Password updated successfully', 'success');
        
        // Reset form after delay
        setTimeout(() => {
          passwordForm.reset();
          submitBtn.disabled = false;
          submitBtn.textContent = originalBtnText;
        }, 1000);

      } catch (err) {
        console.error("Password change error:", err);
        showToastMessage('Something went wrong. Please try again.', 'error');
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
      }
    });
  } else {
    console.error("Password form not found! Check element ID.");
  }

  // HELPER FUNCTIONS
  function showError(id, msg) {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = msg;
      el.classList.remove("d-none");
    }
  }

  function clearError(id) {
    const el = document.getElementById(id);
    if (el) {
      el.classList.add("d-none");
    }
  }

  function clearErrors() {
    ["nameError", "emailError", "phoneError", "imageError"].forEach(id => {
      clearError(id);
    });
  }

  function clearPasswordErrors() {
    ["oldpasswoedError", "newpasswordError", "confirmpassword"].forEach(id => {
      clearError(id);
    });
  }

  function exitEditMode() {
    inputs.forEach(i => i.setAttribute("readonly", true));
    actionButtons.classList.add("d-none");
    editImageBtn.classList.add("d-none");
    editBtn.classList.remove("d-none");
    imageInput.value = "";
    
    // Re-enable save button
    const saveBtn = profileForm.querySelector('button[type="submit"]');
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.textContent = "Save Changes";
    }
  }

  // Toast function
  function showToastMessage(message, type = 'success') {
    // Check if global showToast exists
    if (typeof showToast === 'function') {
      showToast(message, type);
    } else {
      // Fallback toast implementation
      let toast = document.getElementById('global-toast');
      if (!toast) {
        toast = document.createElement('div');
        toast.id = 'global-toast';
        toast.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          min-width: 260px;
          padding: 14px 18px;
          border-radius: 10px;
          background: ${type === 'error' ? '#e74c3c' : '#4caf50'};
          color: white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          z-index: 9999;
          display: block;
          opacity: 1;
          transition: opacity 0.3s ease;
        `;
        document.body.appendChild(toast);
      }
      
      toast.className = type;
      toast.style.background = type === 'error' ? '#e74c3c' : '#4caf50';
      toast.style.display = 'block';
      toast.style.opacity = '1';
      toast.textContent = message;

      setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
          toast.style.display = 'none';
        }, 300);
      }, 3000);
    }
  }
});