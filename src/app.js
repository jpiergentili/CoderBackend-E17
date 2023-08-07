import express from 'express'
import mongoose from 'mongoose'
import handlebars from 'express-handlebars'
import session from 'express-session'
import MongoStore from 'connect-mongo' 
import passport from 'passport'
import initializePassport from './passport.config.js'
import dotenv from 'dotenv';

import viewsRouter from './routes/views.router.js'
import cartsRouter from './routes/carts.router.js'
import cartRouter from './routes/cart.router.js'
import sessionRouter from './routes/session.router.js'

const app = express();
const PORT = process.env.PORT || 8080

dotenv.config();

app.use(express.json())
app.use(express.urlencoded({extended:true}))

/* const uri = 'mongodb+srv://javypier1:Q1w2e3r4@jp-backend-coder01.bavi18s.mongodb.net/'
 */
//configuracion del motor de plantillas
app.engine('handlebars', handlebars.engine())
app.set('views', './src/views')
app.set('view engine', 'handlebars')

//Grabación de las sessions
app.use(session({
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URL,
        dbName: process.env.MONGO_DBNAME
    }),
    secret: process.env.SECRET,
    resave: true,
    saveUninitialized: true
}))
app.use('/sessions', sessionRouter)

//aplicamos passport como middleware en el servidor
initializePassport()
app.use(passport.initialize())
app.use(passport.session())

//configuracion de la carpeta publica
app.use(express.static('./src/public'))

app.use('/api/carts', cartsRouter);
app.use('/products', viewsRouter);
app.use('/carts', cartRouter);


mongoose.set('strictQuery', false)

//Conexión a la DB
try{
    await mongoose.connect(process.env.MONGO_URL, {dbName: process.env.MONGO_DBNAME})
    console.log('DB connected!')    
} catch (error) {
    console.log("No se pudo conectar con la base de datos!!")
}

app.listen(PORT, () => console.log('Server UP'))