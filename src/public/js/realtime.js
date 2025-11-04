(() => {
  const $ = (sel) => document.querySelector(sel);
  const listEl = $("#products-list");
  const emptyMsg = $("#empty-msg");

  const socket = io();

  function renderProducts(products) {
    if (!products || !Array.isArray(products)) return;
    if (products.length === 0) {
      if (listEl) {
        listEl.innerHTML = "";
        listEl.hidden = true;
      }
      if (emptyMsg) emptyMsg.hidden = false;
      return;
    }

    if (emptyMsg) emptyMsg.hidden = true;
    if (listEl) listEl.hidden = false;

    listEl.innerHTML = products
      .map(
        (p) => `
        <li data-id="${p.id}">
          <strong>${escapeHtml(p.title)}</strong> — $${p.price}<br/>
          <small>ID: ${p.id} | Código: ${p.code} | Stock: ${p.stock} | Categoría: ${p.category}</small>
          <p>${escapeHtml(p.description || "")}</p>
        </li>`
      )
      .join("");
  }

  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  socket.on("productsUpdated", (products) => {
    renderProducts(products);
  });

  // Forms
  const createForm = $("#create-form");
  if (createForm) {
    createForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const fd = new FormData(createForm);
      const payload = {
        title: fd.get("title")?.toString().trim(),
        description: fd.get("description")?.toString().trim(),
        code: fd.get("code")?.toString().trim(),
        price: Number(fd.get("price")),
        stock: Number(fd.get("stock")),
        category: fd.get("category")?.toString().trim(),
        thumbnails: (fd.get("thumbnails")?.toString().trim() || "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      };

      try {
        const res = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          alert("Error al crear: " + (err.error || res.statusText));
          return;
        }
        createForm.reset();
      } catch (err) {
        console.error(err);
        alert("Error de red al crear producto");
      }
    });
  }

  const deleteForm = $("#delete-form");
  if (deleteForm) {
    deleteForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const id = Number(new FormData(deleteForm).get("id"));
      if (!id) return alert("ID inválido");
      try {
        const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          alert("Error al eliminar: " + (err.error || res.statusText));
          return;
        }
        deleteForm.reset();
      } catch (err) {
        console.error(err);
        alert("Error de red al eliminar producto");
      }
    });
  }
})();
