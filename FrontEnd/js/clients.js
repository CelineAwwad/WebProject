// CLIENTS PAGE MODULE
// ========================================
window.App = window.App || {};

window.App.Clients = (function() {
  'use strict';

  // Import common utilities
  const { Modal, TikTok, Table, Form, API } = window.App.Common;

  // ========================================
  // DOM REFERENCES
  // ========================================
  const elements = {
    btnAddClient: null,
    addClientModal: null,
    viewClientModal: null,
    addClientForm: null,
    editClientForm: null,
    tiktokInput: null,
    filterSelect: null
  };

  // ========================================
  // CACHE DOM ELEMENTS
  // ========================================
  function cacheElements() {
    elements.btnAddClient = document.getElementById("btn-add-client");
    elements.addClientModal = document.getElementById("addClientModal");
    elements.viewClientModal = document.getElementById("viewClientModal");
    elements.addClientForm = document.getElementById("addClientForm");
    elements.editClientForm = document.getElementById("editClientForm");
    elements.tiktokInput = document.getElementById("tiktokLink");
    elements.filterSelect = document.getElementById("filterSelect");
  }

  // ========================================
  // ADD CLIENT FUNCTIONALITY
  // ========================================
  const AddClient = {
    setupModal() {
      if (elements.btnAddClient) {
        elements.btnAddClient.addEventListener("click", (e) => {
          e.preventDefault();
          Modal.open("addClientModal");
        });
      }
    },

    setupLiveValidation() {
      if (elements.tiktokInput) {
        elements.tiktokInput.addEventListener("input", (e) => {
          const errorEl = document.getElementById("tiktokError");
          if (e.target.value.length > 0) {
            TikTok.validateLink(e.target.value, "tiktokError");
          } else if (errorEl) {
            errorEl.textContent = "";
          }
        });
      }
    },

    setupFormSubmission() {
      if (!elements.addClientForm) return;

      elements.addClientForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const tiktokLink = document.getElementById("tiktokLink").value.trim();
        const clientName = document.getElementById("clientName").value.trim();
        const basePrice = document.getElementById("basePrice").value;

        // Validate TikTok link
        if (!TikTok.validateLink(tiktokLink, "tiktokError")) return;

        const username = TikTok.extractUsername(tiktokLink);

        const payload = {
          user_name: clientName,
          tiktok_link: tiktokLink,
          base_price: parseFloat(basePrice) || 0,
          username: username,
          manager_id: 1
        };

        try {
          await API.post("/app/clients", payload);
          window.location.reload();
        } catch (error) {
          console.error("Error adding client:", error);
          alert("An error occurred. Please try again.");
        }
      });
    }
  };

  // ========================================
  // VIEW CLIENT FUNCTIONALITY
  // ========================================
  const ViewClient = {
    setupViewButtons() {
      document.querySelectorAll('[data-action="view"]').forEach(btn => {
        btn.addEventListener("click", async (e) => {
          e.preventDefault();
          const clientId = e.target.dataset.clientId;
          await this.loadClientDetails(clientId);
        });
      });
    },

    async loadClientDetails(clientId) {
      try {
        const data = await API.get(`/app/clients/${clientId}/details`);
        this.populateModal(data);
        Modal.open("viewClientModal");
      } catch (error) {
        console.error("Error loading client details:", error);
        alert("Failed to load client details.");
      }
    },

    populateModal(data) {
      // Populate basic fields
      document.getElementById("editClientId").value = data.client.client_id;
      document.getElementById("editTiktokLink").value = data.client.tiktok_link || "";
      document.getElementById("editClientName").value = data.client.user_name;
      document.getElementById("editBasePrice").value = data.client.base_price;
      document.getElementById("editStatus").value = data.client.status;

      // Populate niches dropdown
      const nichesSelect = document.getElementById("editNiches");
      nichesSelect.innerHTML = "";
      data.allNiches.forEach(niche => {
        const option = document.createElement("option");
        option.value = niche.niche_id;
        option.textContent = niche.niche_name;
        option.selected = data.clientNiches.includes(niche.niche_id);
        nichesSelect.appendChild(option);
      });

      // Populate campaigns dropdown
      const campaignsSelect = document.getElementById("editCampaigns");
      campaignsSelect.innerHTML = "";
      data.allCampaigns.forEach(campaign => {
        const option = document.createElement("option");
        option.value = campaign.campaign_id;
        option.textContent = campaign.title;
        option.selected = data.clientCampaigns.includes(campaign.campaign_id);
        campaignsSelect.appendChild(option);
      });

      // Set to view mode
      EditClient.setViewMode();
    }
  };

  // ========================================
  // EDIT CLIENT FUNCTIONALITY
  // ========================================
  const EditClient = {
    setViewMode() {
      document.getElementById("modalTitle").textContent = "Client Details";
      document.getElementById("viewModeActions").style.display = "flex";
      document.getElementById("editModeActions").style.display = "none";
      Form.disableInputs("editClientForm");
    },

    setEditMode() {
      document.getElementById("modalTitle").textContent = "Edit Client";
      document.getElementById("viewModeActions").style.display = "none";
      document.getElementById("editModeActions").style.display = "flex";
      Form.enableInputs("editClientForm");
    },

    setupModeToggle() {
      const editModeBtn = document.getElementById("editModeBtn");
      const cancelEditBtn = document.getElementById("cancelEditBtn");

      if (editModeBtn) {
        editModeBtn.addEventListener("click", (e) => {
          e.preventDefault();
          this.setEditMode();
        });
      }

      if (cancelEditBtn) {
        cancelEditBtn.addEventListener("click", (e) => {
          e.preventDefault();
          this.setViewMode();
        });
      }
    },

    setupFormSubmission() {
      if (!elements.editClientForm) return;

      elements.editClientForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const clientId = document.getElementById("editClientId").value;
        const tiktokLink = document.getElementById("editTiktokLink").value.trim();
        const clientName = document.getElementById("editClientName").value.trim();
        const basePrice = document.getElementById("editBasePrice").value;
        const status = document.getElementById("editStatus").value;

        const niches = Array.from(document.getElementById("editNiches").selectedOptions)
          .map(o => parseInt(o.value));
        const campaigns = Array.from(document.getElementById("editCampaigns").selectedOptions)
          .map(o => parseInt(o.value));

        const username = TikTok.extractUsername(tiktokLink);

        const payload = {
          user_name: clientName,
          tiktok_link: tiktokLink,
          base_price: parseFloat(basePrice),
          status: status,
          username: username,
          niches: niches,
          campaigns: campaigns,
        };

        try {
          await API.put(`/app/clients/${clientId}`, payload);
          window.location.reload();
        } catch (error) {
          console.error("Error updating client:", error);
          alert("An error occurred. Please try again.");
        }
      });
    }
  };

  // ========================================
  // DELETE CLIENT FUNCTIONALITY
  // ========================================
  const DeleteClient = {
    setupDeleteButton() {
      const deleteBtn = document.getElementById("deleteClientBtn");
      if (!deleteBtn) return;

      deleteBtn.addEventListener("click", async (e) => {
        e.preventDefault();

        const clientId = document.getElementById("editClientId").value;
        const clientName = document.getElementById("editClientName").value;

        const confirmed = confirm(
          `Are you sure you want to delete "${clientName}"?\n\nThis action cannot be undone.`
        );

        if (!confirmed) return;

        try {
          await API.delete(`/app/clients/${clientId}`);
          window.location.reload();
        } catch (error) {
          console.error("Error deleting client:", error);
          alert("An error occurred. Please try again.");
        }
      });
    }
  };

  // ========================================
  // TABLE SORTING
  // ========================================
  const Sorting = {
    setup() {
      if (!elements.filterSelect) return;

      elements.filterSelect.addEventListener("change", () => {
        const order = elements.filterSelect.value;
        Table.applySorting("clientsTable", order);
      });
    }
  };

  // ========================================
  // INITIALIZATION
  // ========================================
  function init() {
    cacheElements();

    AddClient.setupModal();
    AddClient.setupLiveValidation();
    AddClient.setupFormSubmission();

    ViewClient.setupViewButtons();

    EditClient.setupModeToggle();
    EditClient.setupFormSubmission();

    DeleteClient.setupDeleteButton();

    Sorting.setup();

    console.log("✅ Clients page initialized");
  }

  // ========================================
  // PUBLIC API
  // ========================================
  return {
    init
  };
})();

// ========================================
// AUTO-INITIALIZE ON DOM READY
// ========================================
document.addEventListener("DOMContentLoaded", () => {
  if (window.App && window.App.Clients) {
    window.App.Clients.init();
  }
});