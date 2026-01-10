let deleteCategoryId = null;

// Open delete modal
document.querySelectorAll('.btn-delete-category').forEach(btn => {
  btn.addEventListener('click', function () {
    deleteCategoryId = this.dataset.id;
    const name = this.dataset.name;

    document.getElementById('deleteConfirmText').textContent =
      `Are you sure you want to permanently delete the category "${name}"? This action cannot be undone.`;

    new bootstrap.Modal(
      document.getElementById('deleteConfirmModal')
    ).show();
  });
});

// Confirm delete
document.getElementById('confirmDeleteBtn').addEventListener('click', async function () {
  if (!deleteCategoryId) return;

  try {
    const res = await fetch(`/admin/categories/${deleteCategoryId}`, {
      method: 'DELETE'
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      showToast('Failed to delete category');
      
      return;
    }



// Remove row from DOM
const row = document.getElementById(`category-row-${deleteCategoryId}`);
if (row) row.remove();

// Close modal
bootstrap.Modal.getInstance(
  document.getElementById('deleteConfirmModal')
).hide();

showToast('success', 'Category deleted');

// If table is empty → show placeholder row
const tbody = document.querySelector("table tbody");
if (!tbody.querySelector("tr")) {
  tbody.innerHTML = `
    <tr>
      <td colspan="5" class="text-center text-muted py-4">
        No categories found
      </td>
    </tr>
  `;
}

deleteCategoryId = null;


  } catch (err) {
    console.error(err);
    showToast('Network error. Please try again.');
  }
});