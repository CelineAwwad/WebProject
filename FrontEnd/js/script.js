// ========================================
// NAMESPACE: Global App Object
// ========================================
window.App = window.App || {};

// ========================================
// COMMON UTILITIES MODULE
// ========================================
window.App.Common = (function() {
  'use strict';

  // ========================================
  // MODAL UTILITIES
  // ========================================
  const Modal = {
    open(modalId) {
      const modal = document.getElementById(modalId);
      if (modal) modal.classList.add("show");
    },

    close(modalId) {
      const modal = document.getElementById(modalId);
      if (modal) modal.classList.remove("show");
    },

    closeAll() {
      document.querySelectorAll(".modal.show").forEach(modal => {
        modal.classList.remove("show");
      });
    },

    setupCloseHandlers() {
      // Close button (X)
      document.querySelectorAll(".close").forEach(closeBtn => {
        closeBtn.addEventListener("click", (e) => {
          const modal = e.target.closest(".modal");
          if (modal) modal.classList.remove("show");
        });
      });

      // Cancel buttons with [data-modal] attribute
      document.querySelectorAll("[data-modal]").forEach(btn => {
        btn.addEventListener("click", (e) => {
          const modalId = e.target.dataset.modal;
          if (modalId) this.close(modalId);
        });
      });

      // Click outside modal to close
      window.addEventListener("click", (e) => {
        if (e.target.classList.contains("modal")) {
          e.target.classList.remove("show");
        }
      });
    }
  };

  // ========================================
  // TIKTOK USERNAME UTILITIES
  // ========================================
  const TikTok = {
    extractUsername(url) {
      try {
        url = url.trim();
        const patterns = [
          /@([a-zA-Z0-9_.]+)/,
          /tiktok\.com\/@([a-zA-Z0-9_.]+)/
        ];

        for (const pattern of patterns) {
          const match = url.match(pattern);
          if (match && match[1]) return match[1];
        }
        return null;
      } catch {
        return null;
      }
    },

    validateLink(url, errorElementId) {
      const username = this.extractUsername(url);
      const errorEl = document.getElementById(errorElementId);

      if (!username) {
        if (errorEl) {
          errorEl.textContent = "Invalid TikTok link. Please use format: https://www.tiktok.com/@username";
          errorEl.style.color = "#ff6b6b";
        }
        return false;
      }

      if (errorEl) {
        errorEl.textContent = `✓ Username detected: @${username}`;
        errorEl.style.color = "#0f693e";
      }
      return true;
    },

    isValid(url) {
      return this.extractUsername(url) !== null;
    }
  };

  // ========================================
  // TABLE SORTING UTILITIES
  // ========================================
  const Table = {
    sortByName(rows, order = 'az') {
      return rows.sort((a, b) => {
        const nameA = a.querySelector(".namebox__title")?.innerText.toLowerCase() || "";
        const nameB = b.querySelector(".namebox__title")?.innerText.toLowerCase() || "";
        return order === "az" ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
      });
    },

    sortByDate(rows, order = 'newest') {
      return rows.sort((a, b) => {
        const dateA = new Date(a.dataset.created);
        const dateB = new Date(b.dataset.created);
        return order === "newest" ? dateB - dateA : dateA - dateB;
      });
    },

    applySorting(tableId, filterValue) {
      const rows = Array.from(document.querySelectorAll(`#${tableId} tbody tr.row`));
      let sortedRows;

      if (filterValue === "az" || filterValue === "za") {
        sortedRows = this.sortByName(rows, filterValue);
      } else if (filterValue === "newest" || filterValue === "oldest") {
        sortedRows = this.sortByDate(rows, filterValue);
      } else {
        return; // No sorting
      }

      const tbody = document.querySelector(`#${tableId} tbody`);
      sortedRows.forEach(r => tbody.appendChild(r));
    }
  };

  // ========================================
  // FORM UTILITIES
  // ========================================
  const Form = {
    getFormData(formId) {
      const form = document.getElementById(formId);
      if (!form) return null;
      return new FormData(form);
    },

    resetForm(formId) {
      const form = document.getElementById(formId);
      if (form) form.reset();
    },

    disableInputs(formId) {
      const form = document.getElementById(formId);
      if (!form) return;
      form.querySelectorAll("input, select, textarea").forEach(el => {
        if (el.type !== "hidden") el.disabled = true;
      });
    },

    enableInputs(formId) {
      const form = document.getElementById(formId);
      if (!form) return;
      form.querySelectorAll("input, select, textarea").forEach(el => {
        if (el.type !== "hidden") el.disabled = false;
      });
    },

    disable(form) {
      if (!form) return;
      form.querySelectorAll("input, button, textarea, select").forEach(el => {
        el.disabled = true;
      });
    },

    enable(form) {
      if (!form) return;
      form.querySelectorAll("input, button, textarea, select").forEach(el => {
        el.disabled = false;
      });
    },

    clear(form) {
      if (form) form.reset();
    }
  };

  // ========================================
  // API UTILITIES
  // ========================================
  const API = {
    async request(url, options = {}) {
      try {
        const response = await fetch(url, {
          headers: {
            "Content-Type": "application/json",
            ...options.headers
          },
          ...options
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
      } catch (error) {
        console.error("API request failed:", error);
        throw error;
      }
    },

    async get(url) {
      return this.request(url, { method: "GET" });
    },

    async post(url, data) {
      return this.request(url, {
        method: "POST",
        body: JSON.stringify(data)
      });
    },

    async put(url, data) {
      return this.request(url, {
        method: "PUT",
        body: JSON.stringify(data)
      });
    },

    async delete(url) {
      return this.request(url, { method: "DELETE" });
    }
  };

  // ========================================
  // INITIALIZATION
  // ========================================
  function init() {
    Modal.setupCloseHandlers();
    console.log("✅ Common utilities initialized");
  }

  // ========================================
  // PUBLIC API
  // ========================================
  return {
    init,
    Modal,
    TikTok,
    Table,
    Form,
    API
  };
})();

// ========================================
// AUTO-INITIALIZE ON DOM READY
// ========================================
document.addEventListener("DOMContentLoaded", () => {
  if (window.App && window.App.Common) {
    window.App.Common.init();
  }
});