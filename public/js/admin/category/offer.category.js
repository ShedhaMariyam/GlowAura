// EVENT: User toggles offer checkbox
document.querySelectorAll(".offer-toggle input").forEach(checkbox => {
  checkbox.addEventListener("change", function () {
    const wrapper = this.closest(".offer-toggle");
    const id = wrapper.dataset.id;
    const name = wrapper.dataset.name;
    const currentOffer = wrapper.dataset.offer || 0;

    if (this.checked) {
     
     const modalEl = document.getElementById("categoryOfferModal");
      modalEl.dataset.id = id;

    document.getElementById("offerCategoryTitle").textContent =
    `Add offer for: ${name}`;
  document.getElementById("categoryOfferValue").value = currentOffer;

 
  const modal = new bootstrap.Modal(modalEl);

 
  const checkbox = this;

  const onHide = () => {
    
    const offer = Number(wrapper.dataset.offer || 0);
    if (offer === 0) {
      checkbox.checked = false;
    }
    modalEl.removeEventListener("hidden.bs.modal", onHide);
  };

  modalEl.addEventListener("hidden.bs.modal", onHide);
  modal.show();

      
    } else {
      //TOGGLE OFF -Remove offer immediately
      removeOffer(id, wrapper, this);
    }
  });
});


//Toggle OFF logic
async function removeOffer(categoryId, wrapper, checkbox) {
  try {
    const res = await fetch(`/admin/categories/${categoryId}/offer`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ percent: 0 })  // reset everything
    });

    const data = await res.json();

    if (!data.success) {
      showToast('error', data.message || 'Failed to remove offer');
      checkbox.checked = true; // revert on failure
      return;
    }

    wrapper.querySelector(".offer-label").textContent = "";
    wrapper.dataset.offer = 0;

    showToast('success', 'Category offer removed');

  } catch (err) {
    console.error(err);
    showToast('error', 'Error removing offer');
    checkbox.checked = true;
  }
}


// SAVE OFFER BUTTON
document.getElementById("saveCategoryOfferBtn").addEventListener("click", async () => {
  const percent = Number(document.getElementById("categoryOfferValue").value) || 0;
  const modalEl = document.getElementById("categoryOfferModal");
  const categoryId = modalEl.dataset.id;   
 

  if (!categoryId) {
    showToast('error',"Category not selected");
    return;
  }

  try {
    const res = await fetch(`/admin/categories/${categoryId}/offer`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ percent })
    });

    const data = await res.json();

    if (!data.success) {
      showToast('error', data.message || 'Server error');
      return;
    }

    const msg = percent > 0 ? 'Offer added to category ' : 'Offer removed from category';
    showToast('success', msg);

    bootstrap.Modal.getInstance(modalEl).hide();

    const wrapper = document.querySelector(
  `.offer-toggle[data-id="${categoryId}"]`
);

wrapper.dataset.offer = percent;

const checkbox = wrapper.querySelector('input');
const label = wrapper.querySelector('.offer-label');

checkbox.checked = percent > 0;
label.textContent = percent > 0 ? `${percent}% off` : '';

  } catch (err) {
    console.error("Offer save error:", err);
    showToast('error', 'Server error');
  }
});