import express from 'express';
import Product from '../models/product.js';

const router = express.Router();

let productos = [];

// Endpoint para obtener productos con paginación, filtro y ordenamiento
router.get('/', async (req, res) => {
    const { limit = 10, page = 1, query, sort } = req.query;

    try {
        // Construir los filtros de búsqueda
        const filters = {};
        if (query) {
            if (query === 'disponible') {
                filters.disponibilidad = true;
            } else if (query === 'no disponible') {
                filters.disponibilidad = false;
            } else {
                filters.categoria = query.toLowerCase();
            }
        }

        // Validar y configurar el ordenamiento
        let sortOption = {};
        if (sort === 'asc') {
            sortOption = { precio: 1 }; // Ordenar por precio ascendente
        } else if (sort === 'desc') {
            sortOption = { precio: -1 }; // Ordenar por precio descendente
        } else {
            sortOption = {}; // No aplicar ordenamiento si sort está vacío o es inválido
        }

        // Obtener productos desde la base de datos usando paginación
        const products = await Product.paginate(filters, {
            page: Number(page),
            limit: Number(limit),
            sort: sortOption
        });

        // Construir la respuesta
        const response = {
            status: 'success',
            payload: products.docs,
            totalPages: products.totalPages,
            prevPage: products.prevPage,
            nextPage: products.nextPage,
            page: products.page,
            hasPrevPage: products.hasPrevPage,
            hasNextPage: products.hasNextPage,
            prevLink: products.hasPrevPage ? `/?limit=${limit}&page=${products.prevPage}&query=${query || ''}&sort=${sort || ''}` : null,
            nextLink: products.hasNextPage ? `/?limit=${limit}&page=${products.nextPage}&query=${query || ''}&sort=${sort || ''}` : null,
        };

        res.json(response);
    } catch (error) {
        console.error('Error al obtener productos:', error);
        res.status(500).json({ status: 'error', message: 'Error al obtener productos' });
    }
});
// Endpoint para renderizar la vista de productos en tiempo real
router.get('/realtimeproducts', (req, res) => {
    res.render('realTimeProducts', { productos });
});

export default router;
