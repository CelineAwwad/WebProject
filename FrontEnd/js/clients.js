// FrontEnd/js/clients.js
// UPDATE YOUR AddClient.setupFormSubmission function

window.App = window.App || {};

window.App.Clients = (function() {
  'use strict';

  const { Modal, TikTok, Table, Form, API } = window.App.Common;

  // ... keep all your existing code ...

  const AddClient = {
    // ... keep setupModal and setupLiveValidation ...

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
          const data = await API.post("/app/clients", payload);
          
          // Show the generated password to the manager
          if (data.generated_password) {
            alert(
              `✅ Client created successfully!\n\n` +
              `Username: ${data.username}\n` +
              `Password: ${data.generated_password}\n\n` +
              `⚠️ IMPORTANT: Save this password! The client will need it to log in.\n` +
              `You won't be able to see this password again.`
            );
          }
          
          window.location.reload();
        } catch (error) {
          console.error("Error adding client:", error);
          alert("An error occurred. Please try again.");
        }
      });
    }
  };

  // ... keep all your other existing code (ViewClient, EditClient, etc.) ...

  // Keep your existing init function
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

  return { init };
})();

document.addEventListener("DOMContentLoaded", () => {
  if (window.App && window.App.Clients) {
    window.App.Clients.init();
  }
});