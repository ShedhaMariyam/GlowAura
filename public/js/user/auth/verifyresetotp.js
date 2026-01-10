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
