import passport, { strategies } from "passport"
import local from 'passport-local'
import userModel from "./dao/models/userModel.js"
import { createHash, isValidPassword } from "./utils.js"
import GitHubStrategy from 'passport-github2'
import dotenv from 'dotenv';

dotenv.config();

const LocalStrategy = local.Strategy

//funcion que se utilzará en app.js y que contiene toda la configuración de passport
const initializePassport = () => {

    passport.use('register', new LocalStrategy({
        passReqToCallback: true,
        usernameField: 'email'
    }, async (req, username, password, done) => {
        const { first_name, last_name, email, age } = req.body
        try {
            if (email === process.env.ADMIN_EMAIL) {
                console.log(`No se puede registrar el usuario ${process.env.ADMIN_EMAIL}`)
                return done(null, false)
            } else { //consulto a la base de datos
                try {
                    const user = await userModel.model.findOne({ email: username })
                    if (user) {
                        console.log('User already exists')
                        return done(null, false) //callback done para respuesta en el caso de que ya exista el usuario
                    }
                    //si el usuario no esta ocupado en la base de datos, creo uno hasheando el pass
                    const newUser = {
                        first_name,
                        last_name,
                        email,
                        age,
                        password: createHash(password),
                        role: 'user'
                    }


                    //guardo en base de datos el usuario
                    const result = await userModel.model.create(newUser)

                    //retorno el resultado al router
                    return done(null, result)

                } catch (error) {
                    return done(error);
                }
            }
        } catch (error) {
            return done('Error al leer la DB')
        }
    }))

    passport.use('login', new LocalStrategy({
        usernameField: 'email'
    }, async (username, password, done) => {
        try {
            if (username === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASS) {
                const admin = {
                    email: username,
                    role: 'admin'
                }
                return done(null, admin)

            } else {

                const user = await userModel.model.findOne({ email: username });
                if (!user) {
                    console.log('User not found');
                    return done(null, false);
                }
                if (!isValidPassword(user, password)) {
                    return done(null, false);
                }
                return done(null, user);
            }
        } catch (error) {
            return done(error);
        }
    }));

    // ****datos a guardar en variables de entorno****
    passport.use('github', new GitHubStrategy({
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        callbackURL: process.env.CALLBACK_URL
    }, async (accessToken, refreshToken, profile, done) => {
        console.log(profile)
        try {
            const user = await userModel.model.findOne({ email: profile._json.email })
            if (user) return done(null, user) //si ya existe el usuario. lo retorno

            const newUser = await userModel.model.create({
                first_name: profile._json.name,
                last_name: profile._json.name,
                email: profile._json.email,
                age: 35,
                role: 'user'
            })
            return done(null, newUser)

        } catch (err) {
            return done('Error to login with Github')
        }

    }))

    //serialize y deserialize
    passport.serializeUser((user, done) => {
        if (user.role === 'admin') {
            done(null, user); // Serializo el objeto completo del administrador
        } else {
            done(null, user._id); // Serializo el ID del usuario normal
        }
    });

    passport.deserializeUser(async (id, done) => {
        try {
            if (typeof id === 'object' && id.role === 'admin') {
                // Si el ID es un objeto y el rol es 'admin', devuelvo el objeto completo del administrador
                done(null, id);
            } else {
                const user = await userModel.model.findOne({ _id: id });
                done(null, user);
            }
        } catch (error) {
            done(error);
        }
    });

}

export default initializePassport