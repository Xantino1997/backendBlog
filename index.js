const express = require('express');
const cors = require('cors');
const mongoose = require("mongoose");
const User = require('./models/User');
const Post = require('./models/Post');
const Suscriptor = require('./models/Suscribe');
const Desuscriptor = require('./models/Desuscripto');
const Event = require('./models/Event');
const bcrypt = require('bcryptjs');
const app = express();
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const nodemailer = require('nodemailer');

const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
});


const uploadMiddleware = multer({
  storage: multer.diskStorage({}), // Configuración vacía para evitar guardar localmente
  limits: {
    fileSize: 40 * 1024 * 1024 // 40 megabytes
  }
});



// 


const port = process.env.PORT || 4000;
const uri = process.env.REACT_APP_URI;

const bodyParser = require('body-parser');

const jsonParser = bodyParser.json({ limit: '50mb' });
const urlencodedParser = bodyParser.urlencoded({ limit: '50mb', extended: true });

app.use(jsonParser);
app.use(urlencodedParser);

app.use(cors({
  origin: "https://sentidos.vercel.app",
  credentials: true
}));

const salt = bcrypt.genSaltSync(10);
const secret = 'asdfe45we45w345wegw345werjktjwertkj';

app.use(express.json());
app.use(cookieParser());

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Conexión exitosa a la base de datos de Mongo');
}).catch((error) => {
  console.log('Error al conectar a la base de datos:', error);
});

app.post('/register', uploadMiddleware.single('profilePicture'), async (req, res) => {
  const { username, password } = req.body;
  const { path } = req.file;

  try {
    const cloudinaryUploadResult = await cloudinary.uploader.upload(path);
    const { secure_url } = cloudinaryUploadResult;

    const userDoc = await User.create({
      username,
      password: bcrypt.hashSync(password, salt),
      profilePicture: secure_url,
    });

    res.json(userDoc);
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
});

// config para el mouse
const config = {
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'sentidospadres@gmail.com',
    pass: "iescuoxwerackzdr"
  },
};

const transport = nodemailer.createTransport(config);
let lastSubscriberId = 0;


// suscriptores

app.post('/suscriptors', async (req, res) => {

  const { name, email, terms } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ error: 'El email no puede ser nulo' });
    }

    const existingSubscriber = await Suscriptor.findOne({ email });

    if (existingSubscriber) {
      return res.status(400).json({ error: 'El suscriptor ya existe' });
    }

    const lastSubscriber = await Suscriptor.findOne().sort({ id: -1 });

    if (lastSubscriber) {
      lastSubscriberId = lastSubscriber.id;
    }

    const newSuscriptor = new Suscriptor({ name, email, terms });

    // Incrementar el lastSubscriberId antes de guardar
    lastSubscriberId++;
    newSuscriptor.id = lastSubscriberId;

    await newSuscriptor.save();

    const wts = "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/800px-WhatsApp.svg.png";
    const inst = "https://img.freepik.com/vector-gratis/icono-redes-sociales-vector-instagram-7-junio-2021-bangkok-tailandia_53876-136728.jpg?w=360";
    const fb = "https://png.pngtree.com/png-vector/20221018/ourmid/pngtree-facebook-social-media-icon-png-image_6315968.png";

    const sentidos = "https://igtrigo.com/wp-content/uploads/2018/11/labio-leporino-y-paladar-hendido.jpg";
    const year = new Date().getFullYear();

    const mailOptions = {
      from: 'sentidospadres@gmail.com',
      to: email,
      subject: 'Gracias por suscribirte al Post de Sentidos Padres',
      html: `
        <p>¡Hola <b>${name}, como estas?<b>!</p>
        <p>Gracias por suscribirte a Sentidos Padres. A partir de ahora, recibirás un correo electrónico cada vez que se publique un nuevo post.</p>
        <p>Visita nuestra web: <a href="https://sentidos.vercel.app"><b>https://sentidos.vercel.app<b></a></p>
    
        <p>O ingresa a nuestras redes : 😎
          <footer>
            <div className="footer-content">
              <div><img className="titulo-footer" src="${sentidos}" style="width: 300px; height: 150px;" alt="Sentidos"></div>
              <h2>Estamos felices de tenerte</h2>
              <div className="footer-social">
              <h4>Nuestras Redes</h4>
              <a className="footer-whatsapp" href="whatsapp://send?phone=5493413353744&text=Hola%20me%20encontré%20con%20esta%20página%20y%20quería%20recibir%20información%20sobre%20Sentidos" target="_blank">
                <img className="footer-whatsapp" src="${wts}" alt="WhatsApp" style="width: 50px; height: 50px;" />
              </a>
              <a className="footer-instagram" href="https://www.instagram.com/sentidos_padres_ong/" target="_blank">
                <img className="footer-instagram" src="${inst}" alt="Instagram" style="width: 50px; height: 50px;" />
              </a>
              <a className="footer-facebook" href="https://www.facebook.com/SentidosAsociacion/" target="_blank">
                <img className="footer-facebook" src="${fb}" alt="Facebook" style="width: 50px; height: 50px;" />
              </a>
            </div>
            
            
            </div> 
            <p className="copy">&copy; ${year} <b>Sentidos</b></p>
          </footer>
      `
    };

    transport.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        res.status(500).json({ error: 'Error al enviar el correo electrónico' });
      } else {
        res.status(200).json({ message: 'Suscriptor agregado correctamente' });
      }
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: 'Error al procesar la solicitud' });
  }
});

const desuscritos = [];

// Ruta para desuscribir al suscriptor
app.post('/desuscribir', async (req, res) => {
  try {
    const { email, name } = req.body;
    const Suscriptor = require('./models/Suscribe'); // Importar el modelo de suscriptor
    const Desuscriptor = require('./models/Desuscripto');

    // Verificar si el suscriptor existe en la base de datos
    const suscriptor = await Suscriptor.findOne({ email, name });

    if (!suscriptor) {
      return res.status(404).json({ message: 'El suscriptor no existe' });
    }

    // Verificar si el correo electrónico ya existe en Desuscriptor y reemplazarlo o crear uno nuevo
    let desuscriptor = await Desuscriptor.findOne({ email });
    if (desuscriptor) {
      desuscriptor.name = name;
    } else {
      desuscriptor = new Desuscriptor({ name, email });
    }

    // Guardar los datos de desuscriptor en la base de datos
    await desuscriptor.save();

    // Actualizar el suscriptor en la base de datos
    suscriptor.name = name;
    suscriptor.email = `desuscripto${desuscritos.length + 1}@gmail.com`;
    await suscriptor.save();

    // Agregar el correo electrónico desuscrito al array
    desuscritos.push(email);

    // Resto del código para enviar el correo electrónico y devolver la respuesta adecuada

    const config = {
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: 'sentidospadres@gmail.com',
        pass: "iescuoxwerackzdr"
      },
    };
    const wts = "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/800px-WhatsApp.svg.png";
    const inst = "https://img.freepik.com/vector-gratis/icono-redes-sociales-vector-instagram-7-junio-2021-bangkok-tailandia_53876-136728.jpg?w=360";
    const fb = "https://png.pngtree.com/png-vector/20221018/ourmid/pngtree-facebook-social-media-icon-png-image_6315968.png";

    const sentidos = "https://igtrigo.com/wp-content/uploads/2018/11/labio-leporino-y-paladar-hendido.jpg";
    const year = new Date().getFullYear();

    const transporter = nodemailer.createTransport(config);
    const mailOptions = {
      from: 'sentidospadres@gmail.com',
      to: email,
      subject: 'Desuscripción al Post de Sentidos Padres',
      html: `
        <p>¡Hola <b>${name}</b>!</p>
        <h2>Te has desuscripto exitosamente. ¡Esperamos verte de vuelta pronto!</h2>
        <p>Visita nuestra web: <a href="https://sentidos.vercel.app"><b>https://sentidos.vercel.app</b></a></p>
  
        <p>Ingresa a nuestras redes:</p>
        <footer>
        <div className="footer-content">
          <div><img className="titulo-footer" src="${sentidos}" style="width: 300px; height: 150px;" alt="Sentidos"></div>
          <div className="footer-social">
            <h4>Nuestras Redes</h4>
            <a className="footer-whatsapp" href="https://api.whatsapp.com/send?phone=543462529718&text=Hola%20me%20encontré%20con%20esta%20página%20y%20quería%20recibir%20información%20sobre%20Sentidos" target="_blank">
           <img className="footer-whatsapp" src="${wts}" alt="WhatsApp" style="width: 50px; height: 50px;" /></a>
            <a className="footer-instagram" href="https://www.instagram.com" target="_blank"><img className="footer-instagram" src="${inst}" alt="Instagram" style="width: 50px; height: 50px;" /></a>
            <a className="footer-facebook" href="https://www.facebook.com/SentidosAsociacion/" target="_blank"><img className="footer-facebook" src="${fb}" alt="Facebook" style="width: 50px; height: 50px;" /></a>
          </div>
        </div> 
        <p className="copy">&copy; ${year} <b>Sentidos</b></p>
      </footer>
      `
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
        res.status(500).json({ message: 'Ocurrió un error al enviar el correo electrónico' });
      } else {
        console.log('Correo electrónico enviado:', info.response);
        res.json({ message: 'Suscriptor desuscrito correctamente' });
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ocurrió un error al desuscribir al suscriptor' });
  }
});


app.get('/post/:id', async (req, res) => {
  const { id } = req.params;
  const postDoc = await Post.findById(id).populate('author', ['username']);
  res.json(postDoc);
})


app.get('/post/:id', async (req, res) => {
  const { id } = req.params;
  const postDoc = await Post.findById(id).populate('author', ['username']);

  if (!postDoc) {
    return res.status(404).json({ error: 'Post not found' });
  }

  const { category } = postDoc;

  // Obtener otros posts con la misma categoría
  const relatedPosts = await Post.find({ category }).populate('author', ['username']);

  res.json({ post: postDoc, relatedPosts });
});


// edit the post



app.post('/post', uploadMiddleware.single('file'), async (req, res) => {

  const { path } = req.file;

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token de autorización no proporcionado' });
  }

  const token = authHeader.split(' ')[1];

  jwt.verify(token, secret, {}, async (err, info) => {
    if (err) throw err;
    const { title, summary, content, profileAvatar, category } = req.body;

    try {
      const cloudinaryUploadResult = await cloudinary.uploader.upload(path);
      const { secure_url } = cloudinaryUploadResult;

      const postDoc = await Post.create({
        title,
        summary,
        content,
        cover: secure_url, // Guarda la URL de Cloudinary en lugar de la ruta local
        profilePicture: profileAvatar,
        author: info.id,
        category,
      });

      const subscribers = await Suscriptor.find({}, 'email');

      for (const subscriber of subscribers) {
        const subscriberEmail = subscriber.email;

        // Enlace al post
        const postId = postDoc._id;
        const link = `https://sentidos.vercel.app/post/${postId}`;

        // Envío del correo electrónico al suscriptor actual
        const mailOptions = {
          from: 'sentidospadres@gmail.com', // Tu dirección de correo electrónico
          to: subscriberEmail,
          subject: 'Nuevo post creado',
          html: `Hola, ¿cómo estás? Queríamos contarte que se creó un nuevo post:<br><br>
          <h2>Título: ${title}</h2><br>
          Dale click en el siguiente enlace:<br><br>
          <hr>
          <button style="background-color: #66b3ff; color: white; font-weight: bold; border-radius: 15px">
            <a href="${link}" style="color: white; text-decoration: none;">VER EL ARTÍCULO</a>
          </button>`,
        };

        transport.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.log(error);
          } else {
            console.log('Correo enviado:', info.response);
          }
        });
      }

      res.json(postDoc);
    } catch (e) {
      console.log(e);
      res.status(400).json(e);
    }
  });
});

app.put('/post/:id', uploadMiddleware.single('file'), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, summary, content, category } = req.body;
    let newPath = null;

    if (req.file) {
      const { path } = req.file;
      newPath = path;
    }

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Token de autorización no proporcionado' });
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, secret, {}, async (err, info) => {
      if (err) throw err;

      const postDoc = await Post.findById(id);
      const isAuthor = JSON.stringify(postDoc.author) === JSON.stringify(info.id);

      if (!isAuthor) {
        return res.status(400).json('No eres el autor');
      }

      let updatedCover = postDoc.cover;

      if (newPath) {
        const cloudinaryUploadResult = await cloudinary.uploader.upload(newPath);
        updatedCover = cloudinaryUploadResult.secure_url;
      }

      postDoc.title = title;
      postDoc.summary = summary;
      postDoc.content = content;
      postDoc.cover = updatedCover;
      postDoc.category = category;

      await postDoc.save();

      res.json(postDoc);
    });
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
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
      res.cookie('token', token, {
        httpOnly: true, // La cookie solo es accesible por el servidor
        path: '/', // La cookie es válida en todo el sitio
        secure: true // La cookie solo se enviará en conexiones HTTPS
      }).json({
        token,
        id: userDoc._id,
        username,
        profilePicture: userDoc.profilePicture
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
  const previousToken = req.cookies.token;
  const newToken = ''; // Aquí puedes establecer el nuevo valor del token

  res.cookie('token', newToken).json();
});




app.get('/post', async (req, res) => {

  res.json(
    await Post.find()
      .populate('author', ['username'])
      .sort({ createdAt: -1 })
      .limit(20)
  );
});

app.get('/post/:id', async (req, res) => {
  const { id } = req.params;
  const postDoc = await Post.findById(id).populate('author', ['username']);
  res.json(postDoc);
})



// lo nuevo del menu


// 


app.post("/nosotros", (req, res) => {
  const { titulo, reseña } = req.body;
  // Actualizar los datos de nosotros con los valores enviados en la solicitud
  infoNosotros.titulo = titulo;
  infoNosotros.reseña = reseña;

  res.send("Información de Nosotros actualizada correctamente");
});

app.post("/events", (req, res) => {
  const { titulo, reseña } = req.body;
  // Actualizar los datos de nosotros con los valores enviados en la solicitud
  infoNosotros.titulo = titulo;
  infoNosotros.reseña = reseña;

  res.send("Información de Nosotros actualizada correctamente");
});


// Ruta para crear un nuevo evento
app.post("/createadvice", uploadMiddleware.single("image"), verifyToken, async (req, res) => {
  const { title, description, eventDate } = req.body;

  try {
    const cloudinaryUploadResult = await cloudinary.uploader.upload(req.file.path);
    const { secure_url } = cloudinaryUploadResult;

    const newEvent = new Event({
      title,
      image: secure_url,
      description,
      eventDate,
    });

    const event = await newEvent.save();

    res.status(201).json(event);
  } catch (error) {
    console.error("Error al crear el evento:", error);
    res.status(500).json({ error: "Error al crear el evento" });
  }
});

// Ruta para eliminar un evento
app.delete("/deleteadvice/:id", verifyToken, async (req, res) => {
  const eventId = req.params.id;

  try {
    const deletedEvent = await Event.findByIdAndDelete(eventId);
    if (!deletedEvent) {
      return res.status(404).json({ error: "No se encontró el evento" });
    }
    res.status(200).json({ message: "Evento eliminado exitosamente" });
  } catch (error) {
    console.error("Error al eliminar el evento:", error);
    res.status(500).json({ error: "Error al eliminar el evento" });
  }
});

// Ruta para actualizar un evento
app.put('/updateadvice/:id', uploadMiddleware.single('image'), verifyToken, async (req, res) => {
  const eventId = req.params.id;
  const { title, description, eventDate } = req.body;

  try {
    // Obtener el evento existente en la base de datos
    const existingEvent = await Event.findById(eventId);

    if (!existingEvent) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }

    // Actualizar los datos del evento existente
    existingEvent.title = title;
    existingEvent.description = description;
    existingEvent.eventDate = eventDate;

    // Actualizar la imagen del evento si se adjuntó una nueva
    if (req.file) {
      // Subir la nueva imagen a Cloudinary
      const result = await cloudinary.uploader.upload(req.file.path);

      // Eliminar la imagen anterior de Cloudinary
      if (existingEvent.image) {
        await cloudinary.uploader.destroy(existingEvent.image);
      }

      existingEvent.image = result.secure_url;
    }

    const updatedEvent = await existingEvent.save();

    return res.json(updatedEvent);
  } catch (error) {
    console.error('Error al actualizar el evento:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Middleware para verificar y decodificar el token de autorización
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token de autorización no proporcionado' });
  }

  const token = authHeader.split(' ')[1];

  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Token de autorización inválido' });
    }

    // Agregar la información del usuario decodificada a la solicitud
    req.user = decoded;
    next();
  });
}

app.get("/getadvice", async (req, res) => {
  try {
    const events = await Event.find();
    res.status(200).json(events);
  } catch (error) {
    console.error("Error al obtener los eventos:", error);
    res.status(500).json({ error: "Error al obtener los eventos" });
  }
});



app.listen(port, () => {
  console.log('Runnig SERVER ' + port);
});
