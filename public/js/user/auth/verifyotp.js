// Auto cursor and paste support
document.querySelectorAll('.code-input').forEach((input, idx, arr) => {
  input.addEventListener('input', () => {
    if(input.value && idx < arr.length - 1) arr[idx + 1].focus();
  });
  input.addEventListener('keydown', (e) => {
    if((e.key === "Backspace" || e.key === "Delete") && !input.value && idx > 0) arr[idx - 1].focus();
    if(e.key === "ArrowLeft" && idx > 0) arr[idx - 1].focus();
    if(e.key === "ArrowRight" && idx < arr.length - 1) arr[idx + 1].focus();
  });
  input.addEventListener('paste', (e) => {
    const data = (e.clipboardData || window.clipboardData).getData('text');
    if(data.length === arr.length) {
      e.preventDefault();
      arr.forEach((el, i) => el.value = data[i] || '');
      arr[arr.length - 1].focus();
    }
  });
});

// Timer Logic
let timeLeft = 59;
let timer;
const timerDisplay = document.getElementById("timervalue");
const resendBtn = document.getElementById("resendBtn");
const resendSection = document.getElementById("resendSection");

function startTimer() {
  clearInterval(timer);
  timeLeft = 59;
  resendSection.style.display = 'inline';
  resendBtn.disabled = true;
  resendBtn.style.display = 'none';
  timer = setInterval(() => {
    if (timeLeft > 0) {
      timeLeft--;
      timerDisplay.textContent = timeLeft;
    } else {
      clearInterval(timer);
      resendSection.style.display = 'none';
      resendBtn.disabled = false;
      resendBtn.style.display = 'inline';
    }
  }, 1000);
}
startTimer();

// Resend OTP
resendBtn.addEventListener('click', async () => {
  try {
    const res = await axios.get('/resend-otp');
    Swal.fire({
      icon: 'info',
      title: 'OTP Resent',
      text: res.data.message || 'A new verification code has been sent to your email.',
      timer: 2000,
      showConfirmButton: false
    });
    startTimer();
  } catch (err) {
    Swal.fire({
      icon: 'error',
      title: 'Failed to resend',
      text: err.response?.data?.message || 'Something went wrong, please try again.'
    });
  }
});

// Get success messages based on purpose
function getSuccessMessage(purpose) {
  const messages = {
    'signup': {
      title: 'Account Created Successfully!',
      text: 'Welcome to GlowAura! Your account has been verified.',
      icon: 'success'
    },
    'email-change': {
      title: 'Email Updated Successfully!',
      text: 'Your email address has been changed and verified.',
      icon: 'success'
    },
    'reset': {
      title: 'OTP Verified!',
      text: 'Please set your new password.',
      icon: 'success'
    }
  };
  
  return messages[purpose] || messages['signup'];
}

// OTP Validation
async function validateOTPForm(event) {
  event.preventDefault();
  const otpInputs = document.querySelectorAll(".code-input");
  let otpValue = Array.from(otpInputs).map(input => input.value.trim()).join('');

  if (otpValue.length !== otpInputs.length) {
    Swal.fire({
      icon: "warning",
      title: "Incomplete OTP",
      text: "Please fill all the fields for verification."
    });
    return;
  }

  // Disable submit button during verification
  const submitBtn = document.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = 'Verifying...';

  try {
    const response = await axios.post('/verify-otp', { otp: otpValue });

    if (response.data.success) {
      // Get the purpose from response or use default
      const purpose = response.data.purpose || 'signup';
      const message = getSuccessMessage(purpose);
      
      Swal.fire({
        icon: message.icon,
        title: message.title,
        text: message.text,
        showConfirmButton: false,
        timer: 2000,
      }).then(() => {
        window.location.href = response.data.redirectUrl;
      });
    } else {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
      
      Swal.fire({
        icon: "error",
        title: "Verification Failed",
        text: response.data.message || "Invalid OTP, please try again.",
      });
    }
  } catch (error) {
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
    
    if (error.response && error.response.data) {
      Swal.fire({
        icon: "error",
        title: "Verification Failed",
        text: error.response.data.message || "Invalid OTP, please try again."
      });
    } else {
      Swal.fire({
        icon: "error",
        title: "Server Error",
        text: "Please try again later."
      });
    }
  }
}