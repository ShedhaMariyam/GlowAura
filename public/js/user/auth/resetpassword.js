function togglePassword(id, element) {
      const input = document.getElementById(id);
      const icon = element.querySelector('i');
      if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('bi-eye');
        icon.classList.add('bi-eye-slash');
      } else {
        input.type = 'password';
        icon.classList.remove('bi-eye-slash');
        icon.classList.add('bi-eye');
      }
    }

    const password = document.getElementById('password');
    const confirmpassword = document.getElementById('confirmpassword')

    function passwordValidateChecking() {
        const passwordval = password.value || "";
        const confirmpasswordval = confirmpassword.value || "";
        const alpha = /[a-zA-Z]/;
        const digit = /\d/;

        if (passwordval.trim() === "") {
            error3.style.display = "block";
            error3.innerHTML = "Password is mandatory";
            return false;
        } else if (passwordval.length < 8) {
            error3.style.display = "block";
            error3.innerHTML = "Should contain at least 8 characters";
            return false;
        } else if (!alpha.test(passwordval) || !digit.test(passwordval)) {
            error3.style.display = "block";
            error3.innerHTML = "Should contain alpha numeric characters";
            return false;
        } else {
            error3.style.display = "none";
            error3.innerHTML = "";
        }

        if (confirmpasswordval.trim() === "") {
            error4.style.display = "block";
            error4.innerHTML = "Confirm Password is mandatory";
            return false;
        } else if (passwordval !== confirmpasswordval) {
            error4.style.display = "block";
            error4.innerHTML = "Password and Confirm Password should be same";
            return false;
        } else {
            error4.style.display = "none";
            error4.innerHTML = "";
            return true;
        }
    }

     resetform.addEventListener("submit", async function(e) {
        e.preventDefault();

         const okPass = passwordValidateChecking();

        if (!okPass) {
            return; // don't submit if client validation fails
        }

        // prevent double submits
        submitBtn.disabled = true;
        submitBtn.textContent = "Resetting...";


     })