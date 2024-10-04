var UltimaBusqueda = "";

async function buscar(url) {
  if(UltimaBusqueda == url)
    return null;
  else
    UltimaBusqueda = url;
  
  const btnBuscar = document.getElementById("btnBuscar");
  
  const resultadoError = document.getElementById("resultadoError");
  resultadoError.innerText = "";
  if (urlValida(url)) {
    btnBuscar.disabled = true;
    btnBuscar.style.cursor = "default";
    btnBuscar.style.opacity = 0.5;
    try {
      const response = await fetch(`/proxy?url=${encodeURIComponent(url)}`);
      if (!response.ok) {
        throw new Error("Error al acceder a la página");
      }
      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      const iframe = doc.querySelector("iframe");

      if (iframe) {
        const iframeSrc = iframe.src;
        const idMatch = iframeSrc.match(/id=(\d+)/);

        if (idMatch) {
          resultadoError.innerText = `El ID de la serie/película es: ${idMatch[1]}`; //Obteniendo links...
          getLinks(idMatch[1]);
        } else {
          resultadoError.innerText = "No se encontró la serie/pelicula";
          let divLinks = document.getElementById("links");
          divLinks.innerHTML = "";
          
          btnBuscar.disabled = false;
          btnBuscar.style.cursor = "pointer";
          btnBuscar.style.opacity = 1;
        }
      } else {
        resultadoError.innerText = "No se encontró la serie/pelicula";
        let divLinks = document.getElementById("links");
        divLinks.innerHTML = "";
        
        btnBuscar.disabled = false;
        btnBuscar.style.cursor = "pointer";
        btnBuscar.style.opacity = 1;
      }
    } catch (error) {
      resultadoError.innerText = error.message;
      let divLinks = document.getElementById("links");
      divLinks.innerHTML = "";
      
      btnBuscar.disabled = false;
      btnBuscar.style.cursor = "pointer";
      btnBuscar.style.opacity = 1;
    }
  } else {
    resultadoError.innerText = "Dominio no valido";
    let divLinks = document.getElementById("links");
    divLinks.innerHTML = "";
  }
}

function urlValida(url) {
  return !url.startsWith("https://seriesmega.org") ? false : true;
}

async function getLinks(id) {
  const btnBuscar = document.getElementById("btnBuscar");
  
  const resultadoError = document.getElementById("resultadoError");
  try {
    const response = await fetch(`/check-status?id=${id}`)
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        let links = data;
        if (links.length > 1)
          mostrarLinks(links);
        else
          throw new Error("Error al acceder a la página");
      })
      .catch((err) => {
        resultadoError.innerText = "Error al obtener los links!";
        
        btnBuscar.disabled = false;
    btnBuscar.style.cursor = "pointer";
    btnBuscar.style.opacity = 1;
      });
  } catch (error) {
    resultadoError.innerText = error.message;
    
    btnBuscar.disabled = false;
    btnBuscar.style.cursor = "pointer";
    btnBuscar.style.opacity = 1;
  }
}


function mostrarLinks(links) {
  const btnBuscar = document.getElementById("btnBuscar");
  
  let enlaceVer = document.getElementById("enlaceVer");
  let divLinks = document.getElementById("links");
  divLinks.innerHTML = "";
  let contadorDescargas = 1;
  links.forEach(function (link) {
    if (link.link == 0) {
      
      let linkVer = document.createElement("a");
      linkVer.href = link.url;
      linkVer.textContent = `Ver`;
      linkVer.target = "_blank";
      
      // Añadir el nuevo enlace al div
      divLinks.appendChild(linkVer);

    } else {
      let linkDescargar = document.createElement("a");
      linkDescargar.href = link.url;
      linkDescargar.textContent = `Descargar ${contadorDescargas}`;
      linkDescargar.target = "_blank";
      
      divLinks.appendChild(linkDescargar);
      contadorDescargas++;
    }
  });
  
  btnBuscar.disabled = false;
    btnBuscar.style.cursor = "pointer";
    btnBuscar.style.opacity = 1;
}
