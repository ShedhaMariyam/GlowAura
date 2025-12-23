const Toast = {
  container: null,

  init() {
    // Create container for toasts if it doesn't exist
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'toast-container';
      this.container.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 10px;
      `;
      document.body.appendChild(this.container);
    }
  },

  show(message, type = 'success', duration = 3000) {
    this.init();

    const toast = document.createElement('div');
    toast.className = `custom-toast ${type}`;
    
    const icon = this.getIcon(type);
    
    toast.innerHTML = `
      <div class="custom-toast-icon">
        <span>${icon}</span>
      </div>
      <div class="custom-toast-content">
        <p class="custom-toast-title">${message}</p>
      </div>
      <button class="custom-toast-close">×</button>
    `;
    
    // Add close button functionality
    const closeBtn = toast.querySelector('.custom-toast-close');
    closeBtn.addEventListener('click', () => this.remove(toast));
    
    this.container.appendChild(toast);
    
    // Auto remove
    setTimeout(() => this.remove(toast), duration);
  },

  showWithDetails(title, message, type = 'success', duration = 3000) {
    this.init();

    const toast = document.createElement('div');
    toast.className = `custom-toast ${type}`;
    
    const icon = this.getIcon(type);
    
    toast.innerHTML = `
      <div class="custom-toast-icon">
        <span>${icon}</span>
      </div>
      <div class="custom-toast-content">
        <p class="custom-toast-title">${title}</p>
        <p class="custom-toast-message">${message}</p>
      </div>
      <button class="custom-toast-close">×</button>
    `;
    
    const closeBtn = toast.querySelector('.custom-toast-close');
    closeBtn.addEventListener('click', () => this.remove(toast));
    
    this.container.appendChild(toast);
    
    setTimeout(() => this.remove(toast), duration);
  },

  success(message, duration = 3000) {
    this.show(message, 'success', duration);
  },

  error(message, duration = 3000) {
    this.show(message, 'error', duration);
  },

  warning(message, duration = 3000) {
    this.show(message, 'warning', duration);
  },

  info(message, duration = 3000) {
    this.show(message, 'info', duration);
  },

  remove(toast) {
    toast.classList.add('hiding');
    setTimeout(() => {
      if (toast.parentElement) {
        toast.remove();
      }
    }, 300);
  },

  getIcon(type) {
    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };
    return icons[type] || icons.success;
  }
};

// Make it globally available
window.Toast = Toast;

