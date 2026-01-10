// IMAGE GALLERY
  function changeImage(el) {
    document.getElementById("mainImage").src = el.src;
    document.querySelectorAll(".thumb-img").forEach(img => img.classList.remove("active"));
    el.classList.add("active");
  }

  document.addEventListener('DOMContentLoaded', () => {
    // Get variants from data attribute
    const container = document.getElementById('mainContainer');
    const variants = JSON.parse(container.getAttribute('data-variants'));

    let currentIndex = 0;
    const priceNow = document.getElementById('priceNow');
    const priceOld = document.getElementById('priceOld');
    const offerBadge = document.getElementById('offerBadge');
    const stockInfo = document.getElementById('stockInfo');
    const qtyInput = document.getElementById('qtyInput');
    const qtyMinus = document.getElementById('qtyMinus');
    const qtyPlus = document.getElementById('qtyPlus');
    const qtyError = document.getElementById('qtyError');
    const addToCartBtn = document.getElementById('addToCartBtn');
    const buyNowBtn = document.getElementById('buyNowBtn');

    function updateUI() {
      const v = variants[currentIndex];

      // price
      if (v.sale_price !== v.regular_price) {
        priceNow.textContent = v.sale_price;
        priceOld.textContent = v.regular_price;
        priceOld.classList.remove('d-none');
        offerBadge.classList.remove('d-none');
      } else {
        priceNow.textContent = v.regular_price;
        priceOld.classList.add('d-none');
      }

      // stock
      if (v.quantity > 0) {
        stockInfo.innerHTML = 'In stock: ' + v.quantity;
        stockInfo.classList.remove('stock-out');
      } else {
        stockInfo.innerHTML = '<span class="stock-out">Out of stock</span>';
        stockInfo.classList.add('stock-out');
      }

      // quantity limits
      let q = parseInt(qtyInput.value) || 1;
      if (q > v.quantity) q = v.quantity || 1;
      if (q < 1) q = 1;
      qtyInput.value = q;

      qtyMinus.disabled = q <= 1;
      qtyPlus.disabled = q >= v.quantity || v.quantity === 0;

      qtyError.classList.toggle('d-none', q < v.quantity);

      const disabled = v.quantity === 0;
      addToCartBtn.disabled = disabled;
      buyNowBtn.disabled = disabled;
    }

    // size click
    document.querySelectorAll('.size-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentIndex = parseInt(btn.dataset.index);
        updateUI();
      });
    });

    // quantity controls
    qtyMinus.addEventListener('click', () => {
      let q = parseInt(qtyInput.value) || 1;
      if (q > 1) {
        qtyInput.value = q - 1;
        updateUI();
      }
    });

    qtyPlus.addEventListener('click', () => {
      let q = parseInt(qtyInput.value) || 1;
      const max = variants[currentIndex].quantity;
      if (q < max) {
        qtyInput.value = q + 1;
        updateUI();
      }
    });

    qtyInput.addEventListener('input', () => {
      updateUI();
    });

    // initial state
    updateUI();
  });