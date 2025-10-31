document.addEventListener("DOMContentLoaded", () => {
  const addBtn = document.getElementById("btn-add-client");
  const form = document.getElementById("add-client-form");

  if (addBtn && form) {
    addBtn.addEventListener("click", () => {
      form.style.display = form.style.display === "none" ? "block" : "none";
    });
  }
});
