import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { engine } from 'express-handlebars';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import cartRoutes from './routes/carts.js';
import productRoutes from './routes/products.js';
import Product from './models/product.js';
import sessionRoutes from './routes/sessions.js';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import passport from 'passport';
import './passport-config.js'; // Asegúrate de que la ruta sea correcta



// Para obtener __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Configuración de Handlebars
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Configuración de la sesión
app.use(session({
    secret: 'tu_secreto',
    resave: false,
    saveUninitialized: false
}));

// Inicializar Passport
app.use(passport.initialize());
app.use(passport.session());

// Conexión a MongoDB con opciones recomendadas
mongoose.connect("mongodb+srv://1234562024:1234562024@cluster0.e0kzhzg.mongodb.net/ProyectoBackend1?retryWrites=true&w=majority&appName=Cluster0", {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Conectado a MongoDB'))
.catch(err => console.error('Error al conectar a MongoDB:', err));

// Usar las rutas de carts y products
app.use('/api/carts', cartRoutes);
app.use('/api/products', productRoutes);
app.use('/api/sessions', sessionRoutes);

// Manejo de conexiones socket
let productos = []; // Cambiar a let para poder reasignar

// Manejo de conexiones socket
io.on('connection', async (socket) => {
    console.log('Nuevo cliente conectado');

    try {
        // Obtener la lista de productos desde la base de datos
        const productos = await Product.find();

        // Enviar lista de productos al nuevo cliente
        socket.emit('updateProducts', productos);
    } catch (error) {
        console.error('Error al obtener productos de la base de datos:', error);
    }

    // Escuchar la creación de un nuevo producto
    socket.on('nuevoProducto', async (producto) => {
        try {
            // Guardar el producto en la base de datos MongoDB
            const newProduct = new Product({
                id: producto.id,
                nombre: producto.nombre,
                precio: producto.precio
            });
            await newProduct.save(); // Guardar en MongoDB

            console.log('Producto agregado a la base de datos:', newProduct);

            // Obtener la lista actualizada de productos desde la base de datos
            const productosActualizados = await Product.find();

            // Emitir a todos los clientes la lista actualizada de productos
            io.emit('updateProducts', productosActualizados);

        } catch (error) {
            console.error('Error al agregar el producto a la base de datos:', error);
        }
    });

// Escuchar la eliminación de un producto
socket.on('eliminarProducto', async (id) => {
    try {
        // Convertir el ID a ObjectId correctamente usando 'new'
        const objectId = new mongoose.Types.ObjectId(id);

        // Eliminar el producto de la base de datos MongoDB usando _id
        const deletedProduct = await Product.findByIdAndDelete(objectId);

        if (deletedProduct) {
            console.log(`Producto con ID ${id} eliminado de la base de datos.`);

            // Obtener la lista actualizada de productos desde la base de datos
            const productosActualizados = await Product.find();

            // Emitir la lista actualizada a todos los clientes
            io.emit('updateProducts', productosActualizados);
        } else {
            console.log(`Producto con ID ${id} no encontrado en la base de datos.`);
        }
    } catch (error) {
        console.error('Error al eliminar el producto de la base de datos:', error);
    }
});
});

// Iniciar el servidor
server.listen(3000, () => {
    console.log('Servidor escuchando en http://localhost:3000');
});