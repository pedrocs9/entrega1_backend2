const socket = io();

// Actualizar la lista de productos
socket.on('updateProducts', (productos) => {
    const lista = document.getElementById('lista-productos');
    lista.innerHTML = ''; // Limpiar la lista antes de agregar los nuevos elementos

    productos.forEach(producto => {
        const item = document.createElement('li');
        item.id = producto._id; // Usar el ID de MongoDB (_id)
        item.innerHTML = `${producto.nombre} - ${producto.precio} <button onclick="eliminarProducto('${producto._id}')">Eliminar</button>`;
        lista.appendChild(item);
    });
});
// Enviar nuevo producto
document.getElementById('form-agregar').addEventListener('submit', (e) => {
    e.preventDefault();
    const nombre = document.getElementById('nombre').value;
    const precio = document.getElementById('precio').value;
    const id = Date.now().toString();
    socket.emit('nuevoProducto', { id, nombre, precio });
    e.target.reset();
});

// Eliminar producto
function eliminarProducto(id) {
    socket.emit('eliminarProducto', id); // Emitir el _id al servidor
}
