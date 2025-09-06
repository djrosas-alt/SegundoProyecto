document.addEventListener("DOMContentLoaded", () => {

  const fechaInput = document.getElementById("Fecha") || document.getElementById("fecha");
  const descInput  = document.getElementById("Descripcion") || document.getElementById("descripcion");
  const btnAgregar = document.getElementById("agregar");

  const buscarInput = document.getElementById("buscar");

  const btnLimpiarTodo =
    document.getElementById("limpiar Todo") ||
    document.getElementById("limpiarTodo");


  const lista = document.getElementById("lista-tareas");


  const completadasSpan = document.getElementById("completadas");
  const pendientesSpan  = document.getElementById("pendientes");


  let tareas = cargar() || [];


  function guardar() {
    localStorage.setItem("tareas", JSON.stringify(tareas));
  }

  function cargar() {
    try {
      return JSON.parse(localStorage.getItem("tareas")) || [];
    } catch {
      return [];
    }
  }

  function render(filtroTexto = "") {
    lista.innerHTML = "";

    let pendientesCount = 0;
    let completadasCount = 0;


    const filtradas = tareas
      .filter(t => (t.descripcion || "")
        .toLowerCase()
        .includes((filtroTexto || "").toLowerCase()))
      .sort((a, b) => {

        const da = a.fecha ? new Date(a.fecha) : new Date(0);
        const db = b.fecha ? new Date(b.fecha) : new Date(0);
        return da - db;
      });

    filtradas.forEach((t, i) => {
      const item = document.createElement("div");
      item.className = "tarea" + (t.completada ? " completada" : "");
      item.dataset.index = i;

      const etiquetaEstado = `
        <span class="estado ${t.completada ? "completada" : "pendiente"}">
          ${t.completada ? "Completada" : "Pendiente"}
        </span>`;


      item.innerHTML = `
        <span>${t.fecha || "Sin fecha"} - ${t.descripcion || "(Sin descripción)"} ${etiquetaEstado}</span>
        <div>
          <button data-action="toggle">✔</button>
          <button data-action="delete">🗑</button>
        </div>
      `;

      lista.appendChild(item);

      if (t.completada) completadasCount++;
      else pendientesCount++;
    });

    completadasSpan.textContent = completadasCount;
    pendientesSpan.textContent  = pendientesCount;
  }

  function agregarTarea() {
    const fecha = (fechaInput && fechaInput.value) || "";
    const descripcion = (descInput && descInput.value.trim()) || "";

    if (!fecha || !descripcion) {
      alert("Por favor completa la fecha y la descripción.");
      if (fechaInput && !fecha) {
        fechaInput.style.border = "2px solid red";
        setTimeout(() => (fechaInput.style.border = ""), 1200);
      }
      if (descInput && !descripcion) {
        descInput.style.border = "2px solid red";
        setTimeout(() => (descInput.style.border = ""), 1200);
      }
      return;
    }

    tareas.push({
      fecha,
      descripcion,
      completada: false,
    });

    guardar();
    render(buscarInput ? buscarInput.value : "");

    if (fechaInput) fechaInput.value = "";
    if (descInput)  descInput.value = "";
  }


  lista.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;

    const action = btn.dataset.action;
    const contenedor = e.target.closest(".tarea");
    if (!contenedor) return;


    const spanTexto = contenedor.querySelector("span")?.textContent || "";

    const match = spanTexto.split(" - ");
    const fechaTxt = (match[0] || "").trim();
    const descTxt  = (match[1] || "").split(" Completada")[0].split(" Pendiente")[0].trim();

    const idxReal = tareas.findIndex(
      t => (t.fecha || "") === fechaTxt && (t.descripcion || "") === descTxt
    );
    if (idxReal === -1) return; 

    if (action === "toggle") {
      tareas[idxReal].completada = !tareas[idxReal].completada;
      guardar();
      render(buscarInput ? buscarInput.value : "");
    }

    if (action === "delete") {
      tareas.splice(idxReal, 1);
      guardar();
      render(buscarInput ? buscarInput.value : "");
    }
  });

  if (btnAgregar) btnAgregar.addEventListener("click", agregarTarea);


  if (descInput) {
    descInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") agregarTarea();
    });
  }

  if (buscarInput) {
    buscarInput.addEventListener("input", (e) => {
      render(e.target.value);
    });
  }

  if (btnLimpiarTodo) {
    btnLimpiarTodo.addEventListener("click", () => {
      if (confirm("¿Seguro que quieres borrar todas las tareas?")) {
        tareas = [];
        guardar();
        render("");
        if (buscarInput) buscarInput.value = "";
      }
    });
  }


  render("");
});

