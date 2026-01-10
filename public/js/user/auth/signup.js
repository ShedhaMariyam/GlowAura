
  

    // Elements
    const name = document.getElementById("name");
    const email = document.getElementById("email");
    const phone = document.getElementById("phone");
    const password = document.getElementById("password");
    const confirmpassword = document.getElementById("confirmpassword");
    const error1 = document.getElementById ("error1");
    const error2 = document.getElementById ("error2");
    const error3 = document.getElementById ("error3");
    const error4 = document.getElementById ("error4");
    const error5 = document.getElementById ("error5");
    const signform = document.getElementById("signform");
    const referralCode = document.getElementById("referralCode");
    const submitBtn = document.getElementById("submitBtn");



    // validation helpers
    function nameValidateChecking() {
        const nameval = (name.value || "").trim();
        const namepattern = /^[A-Za-z\s]+$/;

        if (nameval === "") {
            error1.style.display = "block";
            error1.innerHTML = "Name is mandatory";
            return false;
        } else if (!namepattern.test(nameval)) {
            error1.style.display = "block";
            error1.innerHTML = "Name must contain alphabets only";
            return false;
        }else if(nameval.length>20){
            error1.style.display = "block";
            error1.innerHTML = "Name must not exceed 20 characters";
            return false;
        } else {
            error1.style.display = "none";
            error1.innerHTML = "";
            return true;
        }
    }

    function emailValidateChecking() {
        const emailval = (email.value || "").trim();
        const emailpattern = /^[A-Za-z0-9_\-.]+@[a-zA-Z]+\.[a-z]{2,4}$/;

        if (emailval === "") {
            error2.style.display = "block";
            error2.innerHTML = "Email is mandatory";
            return false;
        } else if (!emailpattern.test(emailval)) {
            error2.style.display = "block";
            error2.innerHTML = "Invalid email format";
            return false;
        } else {
            error2.style.display = "none";
            error2.innerHTML = "";
            return true;
        }
    }

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

    function phoneValidateChecking() {
    const phoneval = (phone.value || "").trim();
    const phonepattern = /^[6-9]\d{9}$/;   // Indian mobile: starts 6–9 + 10 digits

    if (phoneval === "") {
        error5.style.display = "block";
        error5.innerHTML = "Phone number is mandatory";
        return false;
    } else if (!phonepattern.test(phoneval)) {
        error5.style.display = "block";
        error5.innerHTML = "Enter a valid 10-digit phone number";
        return false;
    } else {
        error5.style.display = "none";
        error5.innerHTML = "";
        return true;
    }
}
   

    
    signform.addEventListener("submit", async function(e) {
        e.preventDefault();

        // perform client-side validation
        const okName = nameValidateChecking();
        const okEmail = emailValidateChecking();
        const okPass = passwordValidateChecking();
        const okPhone = phoneValidateChecking();

        if (!okName || !okEmail || !okPass || !okPhone) {
            return;
        }

     
        submitBtn.disabled = true;
        submitBtn.textContent = "Submitting...";

        // prepare payload
        const payload = {
            name: name.value.trim(),
            email: email.value.trim(),
            phone:phone.value.trim(),
            password: password.value,
            confirmpassword: confirmpassword.value,
            referralCode: referralCode.value ? referralCode.value.trim() : undefined
        };

        try {
            // send POST to /signup using axios
            const response = await axios.post('/signup', payload, {
                validateStatus: () => true 
            });

            const respUrl = response.request && response.request.responseURL;

            if (response.data && response.data.success && response.data.redirectUrl) {
                 window.location.href = response.data.redirectUrl; // handle JSON redirect
                  return;
                }
          
            if (response.data === "email-error" || (typeof response.data === "object" && response.data === "email-error")) {
                alert("Failed to send verification email. Please try again or contact support.");
                submitBtn.disabled = false;
                submitBtn.textContent = "Create Account";
                return;
            }


            if (response.status >= 400 && response.data && typeof response.data === 'object' && response.data.message) {
                alert(response.data.message);
                submitBtn.disabled = false;
                submitBtn.textContent = "Create Account";
                return;
            }

            const data = response.data;
            console.log(data);

          
            if (respUrl && respUrl.includes('/verify-otp')) {
             
                window.location.href = respUrl;
                return;
            }


            if (typeof response.data === 'string' && response.data.trim().startsWith('<')) {
                // replace current document with server-rendered HTML (fallback)
                document.open();
                document.write(response.data);
                document.close();
                return;
            }

            // As a last attempt, if status is 200 assume success and navigate to /verify-otp
            if (response.status === 200) {
                window.location.href = '/verify-otp';
                return;
            }

            // Unexpected response
            alert("Unexpected server response. Please try again.");
            submitBtn.disabled = false;
            submitBtn.textContent = "Create Account";

        } catch (err) {
            console.error("Signup error:", err);
            alert("Server error. Please try again later.");
            submitBtn.disabled = false;
            submitBtn.textContent = "Create Account";
        }
    });