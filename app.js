rconsole.log("Iniciando prueba de conexión...");

// Esperamos a que el HTML cargue
document.addEventListener('DOMContentLoaded', () => {
    const titulo = document.getElementById('titulo-prueba');
    
    if (titulo) {
        titulo.innerHTML = "¡HOLA MUNDO! 🚀<br> La conexión es un éxito.";
        titulo.style.color = "#D32F2F"; // Lo pinta de rojo
        console.log("El Javascript modificó el HTML correctamente.");
    } else {
        console.error("No se encontró el título.");
    }
});
