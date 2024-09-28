import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import user from '../models/user.js';
import bcrypt from 'bcrypt';
const router = express.Router();

// Extractor de JWT desde la cookie
const cookieExtractor = (req) => {
    let token = null;
    if (req && req.cookies) {
      token = req.cookies['jwt'];
    }
    return token;
  };
  
  // Estrategia para validar al usuario logueado
  router.get('/current', (req, res, next) => {
    const token = cookieExtractor(req);
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
  
    jwt.verify(token, 'your_jwt_secret_key', async (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: 'Invalid token' });
      }
  
      try {
        const user = await user.findById(decoded.id);
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }
        res.json({ user });
      } catch (error) {
        next(error);
      }
    });
  });

// Ruta para login
router.post('/login', (req, res, next) => {
    passport.authenticate('local', { session: false }, (err, user, info) => {
      if (err) {
        console.error('Error en la autenticación:', err);
        return res.status(500).json({
          message: 'Error en el servidor',
          error: err
        });
      }
      if (!user) {
        return res.status(401).json({
          message: info.message || 'Credenciales incorrectas',
          user: user
        });
      }
      const token = jwt.sign({ id: user._id }, 'your_jwt_secret_key');
      res.cookie('jwt', token, { httpOnly: true });
      return res.json({ token, user });
    })(req, res, next);
  });

// Ruta para el registro de usuarios
router.post('/register', async (req, res) => {
    const { first_name, last_name, email, age, password } = req.body;
    try {
        // Verificar si el usuario ya existe
        const existingUser = await user.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'El usuario ya existe' });
        }

        // Encriptar la contraseña
        const hashedPassword = await bcrypt.hash(password, 10); // Asegúrate de usar await aquí

        // Crear el nuevo usuario
        const newUser = new user({
            first_name,
            last_name,
            email,
            age,
            password: hashedPassword, // Usa la contraseña encriptada
            role: 'user'
        });

        await newUser.save();
        res.status(201).json({ message: 'Usuario registrado exitosamente' });
    } catch (error) {
        console.error('Error al registrar el usuario:', error);
        res.status(500).json({ error: 'Error al registrar el usuario' });
    }
});
export default router;