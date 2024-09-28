import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import user from './models/user.js';
import bcrypt from 'bcrypt';

// Estrategia Local para login
passport.use(new LocalStrategy(
    {
        usernameField: 'email',
        passwordField: 'password'
    },
    async (email, password, done) => {
        try {
            const users = await user.findOne({ email });
            if (!users) {
                return done(null, false, { message: 'Usuario no encontrado' });
            }
            const isMatch = await bcrypt.compare(password, users.password); // Compara con la contraseña encriptada
            if (isMatch) {
                return done(null, users); // Retorna el usuario si la contraseña coincide
            } else {
                return done(null, false, { message: 'Contraseña incorrecta' });
            }
        } catch (error) {
            return done(error);
        }
    }
));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err);
    }
});

// Estrategia JWT para autenticación
passport.use(new JwtStrategy(
  {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: 'your_jwt_secret_key' // Usa una clave segura
  },
  async (jwtPayload, done) => {
    try {
      const user = await user.findById(jwtPayload.id);
      if (user) return done(null, user);
      return done(null, false);
    } catch (error) {
      return done(error, false);
    }
  }
));

export default passport;