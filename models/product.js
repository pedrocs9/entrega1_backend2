import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
const productSchema = new mongoose.Schema({
    nombre: String,
    precio: Number,
    categoria: String,
    disponibilidad: Boolean,
    cart: {
        type: [
          {
            car: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "cart",
            },
          },
        ],
        default: [],
    },
});
// Añadir el plugin de paginación al esquema
productSchema.plugin(mongoosePaginate);
const Product = mongoose.model('Product', productSchema);

export default Product;