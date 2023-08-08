import express from 'express'
import mongoose from 'mongoose'
import handlebars from 'express-handlebars'
import session from 'express-session'
import MongoStore from 'connect-mongo' 
import passport from 'passport'
import initializePassport from './passport.config.js'
import dotenv from 'dotenv';

import viewsRouter from './routers/products.views.router.js'
import cartsRouter from './routers/carts.router.js'
import cartRouter from './routers/cart.router.js'
import sessionRouter from './routers/session.router.js'
import mockingRouter from './routers/mocking.router.js'

const app = express();
const PORT = process.env.PORT || 8080

dotenv.config();

app.use(express.json())
app.use(express.urlencoded({extended:true}))

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
app.use('/mockingproducts', mockingRouter);


mongoose.set('strictQuery', false)

//Conexión a la DB
try{
    await mongoose.connect(process.env.MONGO_URL, {dbName: process.env.MONGO_DBNAME})
    console.log('DB connected!')    
} catch (error) {
    console.log("No se pudo conectar con la base de datos!!")
}

app.listen(PORT, () => console.log('Server UP'))