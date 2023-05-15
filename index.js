const express = require('express');
const cors = require('cors');
const mongoose = require("mongoose");
const User = require('./models/User');
const Post = require('./models/Post');
const bcrypt = require('bcryptjs');
const app = express();
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const uploadMiddleware = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024 // 10 megabytes
  }
});
const fs = require('fs');
const dotenv = require('dotenv').config();

const port = process.env.PORT || 4000;
const uri = process.env.REACT_APP_URI

const bodyParser = require('body-parser');

// Usar body-parser para procesar los datos en el cuerpo de las solicitudes entrantes
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


const salt = bcrypt.genSaltSync(10);
const secret = 'asdfe45we45w345wegw345werjktjwertkj';

app.use(cors({credentials:true,origin:'https://sentidos-blog.vercel.app'}));
// sin paquete cors 

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', 'https://sentidos-blog.vercel.app');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Credentials', 'true');

  next();
});

// const { createProxyMiddleware } = require('http-proxy-middleware');

// const apiProxy = createProxyMiddleware({
//   target: 'https://backendblog-production.up.railway.app',
//   changeOrigin: true,
// });

// app.use('/post', apiProxy);

// con el  paquete cors

// app.use(cors({
//   origin: 'https://sentidos-blog.vercel.app',
//   methods: ['POST', 'PUT', 'GET'],
//   allowedHeaders: ['Content-Type', 'Authorization']
// }));

app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(__dirname + '/uploads'));







mongoose.connect(uri, {
  useNewUrlParser: true,    // usa el nuevo parser de URL
  useUnifiedTopology: true, // utiliza la nueva topología unificada

}).then(() => {
  console.log('Conexión exitosa a la base Mongo database');
}).catch((error) => {
  console.log('Error al conectar a la base de datos:', error);
});

// app.post('/test', (req, res, next) => {
//   res.json({ message: 'Hello world' });
// });



app.post('/register', uploadMiddleware.single('profilePicture'), async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://sentidos-blog.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  const { username, password } = req.body;
  const { originalname, path } = req.file;
  const parts = originalname.split('.');
  const ext = parts[parts.length - 1];
  const newPath = path + '.' + ext;
  fs.renameSync(path, newPath);
  try {
    const userDoc = await User.create({
      username,
      password: bcrypt.hashSync(password, salt),
      profilePicture: newPath,
    });
    res.json(userDoc);
  } catch (e) {
    console.log(e);
    res.status(400).json(e);
  }
});



app.post('/login', async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://sentidos-blog.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'POST');

  const { username, password } = req.body;
  const userDoc = await User.findOne({ username });
  const passOk = bcrypt.compareSync(password, userDoc.password);
  if (passOk) {
    // logged in
    jwt.sign({ username, id: userDoc._id }, secret, {}, (err, token) => {
      if (err) throw err;
      res.cookie('token', token).json({
        id: userDoc._id,
        username,
        profilePicture: userDoc.profilePicture // agrega la propiedad profilePicture a la respuesta
      });
    });
  } else {
    res.status(400).json('wrong credentials');
  }
});





app.get('/profile', (req, res) => {

  const { token } = req.cookies;
  if (!token) {
    return res.status(401).json({ message: 'No se proporcionó un token' });
  }
  jwt.verify(token, secret, {}, (err, info) => {
    if (err) {
      return res.status(401).json({ message: 'Token inválido' });
    }
    res.json(info);
    // console.log(info);
  });
});




app.post('/logout', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://sentidos-blog.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.cookie('token', '').json('ok');
});

app.post('/post', uploadMiddleware.single('file'), async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://sentidos-blog.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'POST');

  const { originalname, path } = req.file;
  const parts = originalname.split('.');
  const ext = parts[parts.length - 1];
  const newPath = path + '.' + ext;
  fs.renameSync(path, newPath);

  const { token } = req.cookies;
  jwt.verify(token, secret, {}, async (err, info) => {
    if (err) throw err;
    const { title, summary, content } = req.body;
    const postDoc = await Post.create({
      title,
      summary,
      content,
      cover: newPath,
      author: info.id,
    });
    res.json(postDoc);
  });

});




app.put('/post', uploadMiddleware.single('file'), async (req, res) => {
  // Configurar los encabezados CORS
  res.setHeader('Access-Control-Allow-Origin', 'https://sentidos-blog.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'PUT');

  let newPath = null;
  if (req.file) {
    const { originalname, path } = req.file;
    const ext = originalname.split('.').pop(); // Obtener la extensión del archivo
    newPath = `${path}.${ext}`; // Agregar la extensión al final de la ruta del archivo
    fs.renameSync(path, newPath);
  }

  const { token } = req.cookies;
  try {
    const { id, title, summary, content } = req.body;
    const postDoc = await Post.findById(id);
    const isAuthor = JSON.stringify(postDoc.author) === JSON.stringify(info.id);
    if (!isAuthor) {
      return res.status(400).json({ message: 'you are not the author' });
    }
    await postDoc.update({
      title,
      summary,
      content,
      cover: newPath ? newPath : postDoc.cover,
    });

    res.status(204).end(); // Devolver un código de estado 204 (sin contenido)
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'server error' });
  }
});




app.get('/post', async (req, res) => {
  res.json(
    await Post.find()
      .populate('author', ['username'])
      .sort({ createdAt: -1 })
      .limit(50)
  );
});

app.get('/post/:id', async (req, res) => {
  const { id } = req.params;
  const postDoc = await Post.findById(id).populate('author', ['username']);
  res.json(postDoc);
})

app.listen(port, () => {
  console.log('Runnig SERVER ' + port);
});
//
