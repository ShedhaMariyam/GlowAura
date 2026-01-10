     
    document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector('form');
    const emailEl = document.getElementById('email');
    const passwordEl = document.getElementById('password');
    const error1 = document.getElementById('error1');
    const error2 = document.getElementById('error2');
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      // reset previous errors
      error1.style.display = 'none';
      error2.style.display = 'none';

      const email = emailEl.value.trim();
      const password = passwordEl.value.trim();
      let isValid = true;

      // Email validation
      if (email === '') {
        error1.style.display = 'block';
        error1.innerHTML = 'Email is mandatory';
        isValid = false;
      } else if (!emailPattern.test(email)) {
        error1.style.display = 'block';
        error1.innerHTML = 'Enter a valid email address';
        isValid = false;
      }

      // Password validation
      if (password === '') {
        error2.style.display = 'block';
        error2.innerHTML = 'Password is mandatory';
        isValid = false;
      } else if (password.length < 8) {
        error2.style.display = 'block';
        error2.innerHTML = 'Password should contain at least 8 characters';
        isValid = false;
      }

      // Submit if valid
      if (isValid) {
        form.submit();
      }
    });
  });