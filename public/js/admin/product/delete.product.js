document.addEventListener("DOMContentLoaded", () => {
  let deleteProductId = null;

  // Open delete modal
  document.addEventListener("click", function (e) {
    if (e.target.closest(".btn-delete-product")) {
      const btn = e.target.closest(".btn-delete-product");
      deleteProductId = btn.dataset.id;
      const name = btn.dataset.name;

      document.getElementById('deleteProductText').textContent =
        `Are you sure you want to delete the product "${name}"? This will unlist the product.`;

      new bootstrap.Modal(
        document.getElementById('deleteProductModal')
      ).show();
    }
  });

  // Confirm delete
  document
    .getElementById('confirmDeleteProductBtn')
    .addEventListener('click', async () => {

      if (!deleteProductId) return;

      try {
        const res = await fetch(`/admin/products/${deleteProductId}`, {
          method: 'DELETE'
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          showToast('error', data.message || 'Failed to delete product');
          return;
        }

        // ✅ Remove row from DOM
        const row = document.getElementById(`product-row-${deleteProductId}`);
        if (row) row.remove();

        // Close modal
        bootstrap.Modal.getInstance(
          document.getElementById('deleteProductModal')
        ).hide();

        showToast('success', 'Product deleted');

        // ✅ If table empty → show placeholder
        const tbody = document.querySelector("table tbody");
        if (!tbody.querySelector("tr")) {
          tbody.innerHTML = `
            <tr>
              <td colspan="6" class="text-center text-muted py-4">
                No products found
              </td>
            </tr>
          `;
        }

        deleteProductId = null;

      } catch (err) {
        console.error(err);
        showToast('error', 'Network error. Please try again.');
      }
    });
});
