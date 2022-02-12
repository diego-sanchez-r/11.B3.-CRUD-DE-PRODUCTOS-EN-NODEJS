const express = require('express');
require('dotenv').config();
const { dbConnection } = require('../database/config')
const Usuario = require('./usuario');
const Equipo = require('./equipo');
const Rol = require('./rol');
const bcryptjs = require('bcryptjs');
const { body,validationResult,check} = require('express-validator');
const port = process.env.PORT;
class Server {
    constructor(){
        this.app = express();
        this.conectarDB();
        this.middlewares();
        this.rutas();
    }
    middlewares(){
        this.app.use(express.json())//Middleware para leer json;
        this.app.use(express.static('public'));
        //^Middleware para servir la carpeta public
    }
    async conectarDB(){
        await dbConnection()
    }
    rutas(){
    /******* RUTAS DEL EQUIPO *****/ 
    //Get muestra el equipo y hay que pasarle la id.
    this.app.get('/webresources/generic/equipos/:id', async function (req, res) {
        const id = req.params.id;
        let equipos = await Equipo.findById(id);
        res.json(
            equipos

        )
      })
      //Get muestas todos los EQUIPOS
    this.app.get('/webresources/generic/equipos', async function (req, res) {
        let equipos = await Equipo.find();
            res.json(
            equipos
            //[{"categoria":"chucherias","id":30,"imagen":"chuches.jpg","nombre":"chupa chus de naranja","precio":0.0},{"categoria":"chucherias","id":31,"imagen":"chuches.jpg","nombre":"chicle de melón","precio":0.0},{"categoria":"postres","id":33,"imagen":"melon.jpg","nombre":"Melon de chino","precio":2.0},{"categoria":"postres","id":34,"imagen":"melon.jpg","nombre":"Melon de sapo","precio":2.0},{"categoria":"bebidas","id":35,"imagen":"burger/fanta.png","nombre":"Coca cola de melón","precio":3.0},{"categoria":"refrescos","id":38,"imagen":"sandia.jpg","nombre":"refresco de kiwi","precio":2.0},{"categoria":"bocadillos","id":39,"imagen":"cod-1659603340642614231-bocadillo.jfif","nombre":"Bocadillo de calamares","precio":5.0},{"categoria":"bebidas","id":40,"imagen":"cod-737444841162795513-bocata2.jpg","nombre":"cerveza","precio":2.0}]
        )
      })
      /*Post equipos */
    this.app.post('/webresources/generic/equipos',function (req, res) {
        const body = req.body;
        let miEquipo = new Equipo(body);
        miEquipo.save();
        res.json({
            ok:true,
            msg: 'post API Equipos',
            miEquipo
        })
      })
      //put-EQUIPOS
      this.app.put('/webresources/generic/equipos/:id',async function (req, res) {
        const body = req.body;
        const id = req.params.id;
        await Equipo.findByIdAndUpdate(id,body);
        res.json({
            ok:true,
            msg: 'post API Equipos',
            body
        })
      })
      //delete EQUIPOS
      this.app.delete('/webresources/generic/equipos/:id', async function (req, res) {
        const id = req.params.id;
        await Equipo.findByIdAndDelete(id);
        res.status(200).json({
            ok:true,
            msg: 'delete API'
        })
      })
    /******* RUTAS DEL USUARIO */    
    this.app.get('/', function (req, res) {
        
          })
    this.app.get('/api', async function (req, res) {
            let usuarios = await Usuario.find();
            res.status(403).json({
                ok:true,
                msg: 'get API',
                usuarios
            })
          })
    this.app.get('/suma', function (req, res) {
            const num1= Number(req.query.num1);
            const num2= Number(req.query.num2);
            res.send(`La suma de ${num1} y ${num2} es ${(num1)+(num2)}`)
          })

    this.app.post('/api',
            body('correo').isEmail(),
            check('nombre','El nombre es obligatorio').not().isEmpty(),
            check('password','El password debe tener al menos 6 caracteres').isLength({min:6}),
            //check('rol','El rol no es válido').isIn(['ADMIN_ROLE','USER_ROLE']),
            check('rol').custom(
                    async function(rol) {
                        const existeRol = await Rol.findOne({rol});
                        if (!existeRol ) {
                            throw new Error(`El rol ${rol} no está en la BD`)
                        }
                    }

            ),
            check('correo').custom(
                async function(correo) {
                    const existeCorreo = await Usuario.findOne({correo});
                    if (existeCorreo ) {
                        throw new Error(`El correo ${correo} YA está en la BD`)
                    }
                }

        ),
            

            function (req, res) {
            const body = req.body;
            let usuario = new Usuario(body);
            //valida el correo
            const erroresVal = validationResult(req);
                if ( !erroresVal.isEmpty()){
                    return res.status(400).json({ msg:erroresVal.array()});
                }
            //**** le hago el hash a la contraseña */
            const salt = bcryptjs.genSaltSync();
            usuario.password = bcryptjs.hashSync(usuario.password,salt)
            usuario.save();
            res.json({
                ok:true,
                msg: 'post API',
                usuario
            })
          })
    this.app.put('/api/:id', async function (req, res) {
        const id = req.params.id;
        let { password, ...resto } = req.body;
        //**** le hago el hash a la contraseña */
        const salt = bcryptjs.genSaltSync();
        password = bcryptjs.hashSync(password,salt);
        resto.password = password;
        await Usuario.findByIdAndUpdate(id, resto);
            res.status(403).json({
                ok:true,
                msg: 'put API',
                id,
                resto
            })
          })
    this.app.delete('/api/:id', async function (req, res) {
            const id = req.params.id;
            await Usuario.findByIdAndDelete(id);
            res.status(403).json({
                ok:true,
                msg: 'delete API'
            })
          })
    this.app.get('/saludo', function (req, res) {
              res.send('<h1>Hola 2DAW</h1>')
            })
    this.app.get('*', function (req, res) {
              res.sendFile(__dirname + '/404.html')
            })
    }

    listen(){
        this.app.listen(port, function() { 
            console.log('Escuchando el puerto',port)});
    }
}
module.exports = Server;