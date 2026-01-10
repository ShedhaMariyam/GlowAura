let selectedAction = null;
// Open confirmation modal
document.querySelectorAll('.toggle-status').forEach(button => {
  button.addEventListener('click', function () {

    selectedCategoryId = this.dataset.id;
    selectedAction = this.dataset.action;
    const name = this.dataset.name;

    document.getElementById('statusConfirmText').textContent =
      selectedAction === "inactivate"
        ? `Are you sure you want to deactivate the category "${name}"?`
        : `Are you sure you want to activate the category "${name}"?`;

    new bootstrap.Modal(
      document.getElementById('statusConfirmModal')
    ).show();
  });
});

// Confirm action
document.getElementById('statusConfirmForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  if (!selectedCategoryId || !selectedAction) return;

  try {
    const res = await fetch(
      `/admin/categories/${selectedCategoryId}/${selectedAction}`,
      { method: 'PATCH' }
    );

    const data = await res.json();

    if (!res.ok || !data.success) {
      showToast('error', data.message || 'Failed to update status');
      return;
    }

    bootstrap.Modal.getInstance(
      document.getElementById('statusConfirmModal')
    ).hide();

    const msg = selectedAction === 'inactivate'
  ? 'Category deactivated'
  : 'Category activated';

showToast('success', msg);

const row = document.getElementById(`category-row-${selectedCategoryId}`);
const statusCell = row.querySelector('.toggle-status');

if (selectedAction === 'inactivate') {
  statusCell.textContent = 'Inactive';
  statusCell.classList.remove('status-active');
  statusCell.classList.add('status-blocked');
  statusCell.dataset.action = 'activate';
} else {
  statusCell.textContent = 'Active';
  statusCell.classList.remove('status-blocked');
  statusCell.classList.add('status-active');
  statusCell.dataset.action = 'inactivate';
}


  } catch (err) {
    console.error(err);
  showToast('error', 'Network error. Please try again.');
  }
});