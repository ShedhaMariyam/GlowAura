 // Mobile sidebar toggle
  const menuBtn = document.getElementById('menuBtn');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('overlay');

  menuBtn?.addEventListener('click', () => {
    sidebar.classList.toggle('show');
    overlay.classList.toggle('show');
  });
  overlay?.addEventListener('click', () => {
    sidebar.classList.remove('show');
    overlay.classList.remove('show');
  });

  // Example: wire search input to console (replace with real behavior)
  document.querySelector('.search-card input[type="search"]')?.addEventListener('input', (e) => {
    // debounce / fetch filtered results in production
    console.log('search:', e.target.value);
  });

document.addEventListener("click", async function (e) {

  // BLOCK USER
  if (e.target.classList.contains("confirm-block-btn")) {
    const id = e.target.dataset.id;

    const res = await fetch(`/admin/blockUser?id=${id}`);
    const data = await res.json();

    if (!data.success) return alert("Failed");

    updateUserRow(id, true);
    bootstrap.Modal.getInstance(e.target.closest(".modal")).hide();
  }

  // UNBLOCK USER
  if (e.target.classList.contains("confirm-unblock-btn")) {
    const id = e.target.dataset.id;

    const res = await fetch(`/admin/unblockUser?id=${id}`);
    const data = await res.json();

    if (!data.success) return alert("Failed");

    updateUserRow(id, false);
    bootstrap.Modal.getInstance(e.target.closest(".modal")).hide();
  }
});

// DOM updater
function updateUserRow(userId, isBlocked) {
  const row = document.querySelector(`[data-user-id="${userId}"]`);

  // status cell
  const statusCell = row.querySelector(".status-pill");

  if (isBlocked) {
    statusCell.textContent = "Blocked";
    statusCell.classList.remove("status-active");
    statusCell.classList.add("status-blocked");
  } else {
    statusCell.textContent = "Active";
    statusCell.classList.remove("status-blocked");
    statusCell.classList.add("status-active");
  }
}