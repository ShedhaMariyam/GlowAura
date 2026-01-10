const forgotForm = document.getElementById("forgotForm");
    const emailField = document.getElementById("email");
    const errorMsg = document.getElementById("errorMsg");
    const sendBtn = document.getElementById("sendBtn");

    forgotForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = emailField.value.trim();
      if (email === "") {
        showError("Email is required.");
        return;
      }

      // Disable button while processing
      sendBtn.disabled = true;
      sendBtn.textContent = "Sending...";

      try {
        const response = await axios.post("/forgot-password", { email }, { validateStatus: () => true });

        // If OTP sent successfully, the backend renders verify-otp, so redirect manually
        if (response.request.responseURL.includes("/verify-otp")) {
          window.location.href = "/verify-otp";
          return;
        }

        // If server returns HTML, just replace current content
        if (typeof response.data === "string" && response.data.includes("<!DOCTYPE html>")) {
          document.open();
          document.write(response.data);
          document.close();
          return;
        }

        // If error message exists in response
        if (response.data && response.data.message) {
          showError(response.data.message);
        } else {
          showError("Something went wrong. Please try again.");
        }

      } catch (error) {
        console.error("Error sending reset OTP:", error);
        showError("Server error. Please try again later.");
      }

      sendBtn.disabled = false;
      sendBtn.textContent = "Send Verification Code";
    });

    function showError(msg) {
      errorMsg.textContent = msg;
      errorMsg.style.display = "block";
    }