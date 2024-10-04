window.onload = function() {
  const url = new URL(window.location.href);
  const qValue = url.searchParams.get('q');
  if (qValue) {
    const inputBusqueda = document.getElementById("inputBusqueda");
    inputBusqueda.value = qValue
    buscar(qValue);
  }
};