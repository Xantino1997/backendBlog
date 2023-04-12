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
const uploadMiddleware = multer({ dest: 'uploads/' });
const fs = require('fs');
const dotenv = require('dotenv').config();

const port = process.env.REACT_APP_PORT;
const uri = process.env.REACT_APP_URI

const bodyParser = require('body-parser');

// Usar body-parser para procesar los datos en el cuerpo de las solicitudes entrantes
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));




const salt = bcrypt.genSaltSync(10);
const secret = 'asdfe45we45w345wegw345werjktjwertkj';

app.use(cors({ credentials: true, origin: 'http://localhost:3000' }));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(__dirname + '/uploads'));


mongoose.connect(uri, {
  useNewUrlParser: true,    // usa el nuevo parser de URL
  useUnifiedTopology: true, // utiliza la nueva topología unificada

}).then(() => {
  console.log('Conexión exitosa a la base de datos  Mongo DB:');
}).catch((error) => {
  console.log('Error al conectar a la base de datos', error);
});

app.post('/test', (req, res, next) => {
  res.JSON.send('HOLA MUNDO')
})


app.post('/register', uploadMiddleware.single('profilePicture'), async (req, res) => {
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
  });
});




app.post('/logout', (req, res) => {
  res.cookie('token', '').json('ok');
});

app.post('/post', uploadMiddleware.single('file'), async (req, res) => {
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
  let newPath = null;
  if (req.file) {
    const { originalname, path } = req.file;
    const parts = originalname.split('.');
    const ext = parts[parts.length - 1];
    newPath = path + '.' + ext;
    fs.renameSync(path, newPath);
  }

  const { token } = req.cookies;
  jwt.verify(token, secret, {}, async (err, info) => {
    if (err) throw err;
    const { id, title, summary, content } = req.body;
    const postDoc = await Post.findById(id);
    const isAuthor = JSON.stringify(postDoc.author) === JSON.stringify(info.id);
    if (!isAuthor) {
      return res.status(400).json('you are not the author');
    }
    await postDoc.update({
      title,
      summary,
      content,
      cover: newPath ? newPath : postDoc.cover,
    });

    res.json(postDoc);
  });

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
  console.log('Runnig SERVER')
});
//