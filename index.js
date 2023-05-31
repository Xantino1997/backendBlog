// const express = require('express');
// const cors = require('cors');
// const mongoose = require("mongoose");
// const User = require('./models/User');
// const Post = require('./models/Post');
// const Suscriptor = require('./models/Suscribe');
// const bcrypt = require('bcryptjs');
// const app = express();
// const jwt = require('jsonwebtoken');
// const cookieParser = require('cookie-parser');
// const multer = require('multer');
// const nodemailer = require('nodemailer');
// const path = require('path');
// const { v4: uuidv4 } = require('uuid');

// const uploadMiddleware = multer({
//   dest: 'uploads/',
//   limits: {
//     fileSize: 10 * 1024 * 1024 // 10 megabytes
//   }
// });


// const fs = require('fs').promises;

// const storageDirectory = 'uploads/';

// fs.chmod(storageDirectory, 0o777)
//   .then(() => {
//     console.log('Los permisos del directorio se han configurado correctamente.');
//   })
//   .catch((err) => {
//     console.error(`Error al cambiar los permisos del directorio: ${err}`);
//   });



// const dotenv = require('dotenv').config();

// const port = process.env.PORT || 4000;
// const uri = process.env.REACT_APP_URI;

// const bodyParser = require('body-parser');

// const jsonParser = bodyParser.json({ limit: '50mb' });
// const urlencodedParser = bodyParser.urlencoded({ limit: '50mb', extended: true });

// app.use(jsonParser);
// app.use(urlencodedParser);

// app.use(cors({
//   origin: "https://sentidos.vercel.app",
//   credentials: true
// }));

// const salt = bcrypt.genSaltSync(10);
// const secret = 'asdfe45we45w345wegw345werjktjwertkj';

// app.use(express.json());
// app.use(cookieParser());
// app.use('/uploads', express.static(__dirname + '/uploads'));

// mongoose.connect(uri, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// }).then(() => {
//   console.log('Conexión exitosa a la base de datos de Mongo');
// }).catch((error) => {
//   console.log('Error al conectar a la base de datos:', error);
// });

// app.post('/register', uploadMiddleware.single('profilePicture'), async (req, res) => {
//   const { username, password } = req.body;
//   const { originalname, path } = req.file;
//   const parts = originalname.split('.');
//   const ext = parts[parts.length - 1];
//   const newPath = path + '.' + ext;
//   fs.renameSync(path, newPath);
//   try {
//     const userDoc = await User.create({
//       username,
//       password: bcrypt.hashSync(password, salt),
//       profilePicture: newPath,
//     });
//     res.json(userDoc);
//   } catch (e) {
//     console.log(e);
//     res.status(400).json(e);
//   }
// });

// const config = {
//   host: 'smtp.gmail.com',
//   port: 587,
//   secure: false,
//   auth: {
//     user: 'sentidospadres@gmail.com',
//     pass: "iescuoxwerackzdr"
//   },
// };

// const transport = nodemailer.createTransport(config);
// let lastSubscriberId = 0;

// app.post('/suscriptors', async (req, res) => {
//   const { name, email } = req.body;

//   try {
//     if (!email) {
//       return res.status(400).json({ error: 'El email no puede ser nulo' });
//     }

//     const existingSubscriber = await Suscriptor.findOne({ email });


//     if (existingSubscriber) {
//       return res.status(400).json({ error: 'El suscriptor ya existe' });
//     }

//     const newSuscriptor = new Suscriptor({ name, email });

//     // Incrementar el lastSubscriberId antes de guardar
//     lastSubscriberId++;
//     newSuscriptor.id = lastSubscriberId;

//     await newSuscriptor.save();

//     const wts = "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/800px-WhatsApp.svg.png";
//     const inst = "https://img.freepik.com/vector-gratis/icono-redes-sociales-vector-instagram-7-junio-2021-bangkok-tailandia_53876-136728.jpg?w=360";
//     const fb = "https://png.pngtree.com/png-vector/20221018/ourmid/pngtree-facebook-social-media-icon-png-image_6315968.png";

//     const sentidos = "https://igtrigo.com/wp-content/uploads/2018/11/labio-leporino-y-paladar-hendido.jpg";
//     const year = new Date().getFullYear();

//     const mailOptions = {
//       from: 'sentidospadres@gmail.com',
//       to: email,
//       subject: 'Gracias por suscribirte al Post de Sentidos Padres',
//       html: `
//         <p>¡Hola <b>${name}, como estas?<b>!</p>
//         <p>Gracias por suscribirte a Sentidos Padres. A partir de ahora, recibirás un correo electrónico cada vez que se publique un nuevo post.</p>
//         <p>Visita nuestra web: <a href="https://sentidos.vercel.app"><b>https://sentidos.vercel.app<b></a></p>
    
//         <p>O ingresa a nuestras redes : 😎
//           <footer>
//             <div className="footer-content">
//               <div><img className="titulo-footer" src="${sentidos}" style="width: 300px; height: 150px;" alt="Sentidos"></div>
//               <h2>Estamos felices de tenerte</h2>
//               <div className="footer-social">
//                 <h4>Nuestras Redes</h4>
//                 <a className="footer-whatsapp" href="https://api.whatsapp.com/send?phone=543462529718&text=Hola%20me%20encontré%20con%20esta%20página%20y%20quería%20recibir%20información%20sobre%20Sentidos" target="_blank">
//                <img className="footer-whatsapp" src="${wts}" alt="WhatsApp" style="width: 50px; height: 50px;" /></a>
//                 <a className="footer-instagram" href="https://www.instagram.com" target="_blank"><img className="footer-instagram" src="${inst}" alt="Instagram" style="width: 50px; height: 50px;" /></a>
//                 <a className="footer-facebook" href="https://www.facebook.com/SentidosAsociacion/" target="_blank"><img className="footer-facebook" src="${fb}" alt="Facebook" style="width: 50px; height: 50px;" /></a>
//               </div>
//             </div> 
//             <p className="copy">&copy; ${year} <b>Sentidos</b></p>
//           </footer>
//       `
//     };


//     transport.sendMail(mailOptions, (error, info) => {
//       if (error) {
//         console.log(error);
//         res.status(500).json({ error: 'Error al enviar el correo electrónico' });
//       } else {
//         res.status(200).json({ message: 'Suscriptor agregado correctamente' });
//       }
//     });
//   } catch (e) {
//     console.log(e);
//     res.status(500).json({ error: 'Error al procesar la solicitud' });
//   }
// });





// app.post('/login', async (req, res) => {
//   const { username, password } = req.body;
//   const userDoc = await User.findOne({ username });
  
//   if (!userDoc) {
//     return res.status(400).json('User not found');
//   }

//   const passOk = bcrypt.compareSync(password, userDoc.password);
//   if (passOk) {
//     // Generate JWT token
//     jwt.sign({ username, id: userDoc._id }, secret, {}, (err, token) => {
//       if (err) throw err;
      
//       // Set token as a cookie
//       res.cookie('token', token, {
//         httpOnly: true,
//         secure: true,
//         sameSite: 'none'
//       }).json({
//         id: userDoc._id,
//         username,
//         profilePicture: userDoc.profilePicture
//       });
//     });
//   } else {
//     res.status(400).json('Wrong credentials');
//   }
// });





// app.get('/profile', (req, res) => {

//   const { token } = req.cookies;
//   if (!token) {
//     return res.status(401).json({ message: 'No se proporcionó un token' });
//   }
//   jwt.verify(token, secret, {}, (err, info) => {
//     if (err) {
//       return res.status(401).json({ message: 'Token inválido' });
//     }
//     res.json(info);
//     // console.log(info);
//   });
// });




// app.post('/logout', (req, res) => {
//   res.cookie('token', '').json('ok');
// });


// app.get('/post', async (req, res) => {
//   res.json(
//     await Post.find()
//       .populate('author', ['username'])
//       .sort({ createdAt: -1 })
//       .limit(50)
//   );
// });

// app.get('/post/:id', async (req, res) => {
//   const { id } = req.params;
//   const postDoc = await Post.findById(id).populate('author', ['username']);
//   res.json(postDoc);
// })




// // edit the post


// app.post('/post', uploadMiddleware.single('file'), async (req, res) => {
//   const { originalname, path } = req.file;
//   const parts = originalname.split('.');
//   const ext = parts[parts.length - 1];
//   const newPath = path + '.' + ext;
//   fs.renameSync(path, newPath);

//   const { token } = req.cookies;
//   jwt.verify(token, secret, {}, async (err, info) => {
//     if (err) throw err;
//     const { title, summary, content, profileAvatar } = req.body;
//     const postDoc = await Post.create({
//       title,
//       summary,
//       content,
//       cover: newPath,
//       profilePicture: profileAvatar,
//       author: info.id,
//     });

//     const subscribers = await Suscriptor.find({}, 'email');
//     // const titulo = title
//     for (const subscriber of subscribers) {
//       const subscriberEmail = subscriber.email;

//       // Enlace al post
//       const postId = postDoc._id; // Suponiendo que el ID del post se encuentra en el campo _id
//       const link = `https://sentidos.vercel.app/post/${postId}`;

//       // Envío del correo electrónico al suscriptor actual
//       const mailOptions = {
//         from: 'sentidospadres@gmail.com', // Tu dirección de correo electrónico
//         to: subscriberEmail,
//         subject: 'Nuevo post creado',
//         html: `Hola como estas?, queriamos contarte que se creo un nuevo post:<br><br>
//         <h2>Título: ${title}</h2><br>
//         Dale click en el siguiente enlace: <br></br><hr><button style="background-color: #66b3ff; color: white; font-weight: bold;border-radius:15px"><a href="${link}" style="color: white; text-decoration: none;">VER EL ARTÍCULO</a></button>`,

//       };

//       transport.sendMail(mailOptions, (error, info) => {
//         if (error) {
//           console.log(error);
//         } else {
//           console.log('Correo enviado:', info.response);
//         }
//       });
//     }
//     res.json(postDoc);
//   });
// });


// app.put('/post/:id', uploadMiddleware.single('file'), async (req, res) => {
//   try {
//     let newPath = null;
//     if (req.file) {
//       const { originalname, path } = req.file;
//       const parts = originalname.split('.');
//       const ext = parts[parts.length - 1];
//       newPath = path + '.' + ext;
//       fs.renameSync(path, newPath);
//       console.log(req.headers);
//     }

//     const { token } = req.cookies;
//     jwt.verify(token, secret, {}, async (err, info) => {
//       if (err) throw err;

//       const { id } = req.params;
//       const { title, summary, content } = req.body;

//       const postDoc = await Post.findById(id);
//       const isAuthor = JSON.stringify(postDoc.author) === JSON.stringify(info.id);
//       if (!isAuthor) {
//         return res.status(400).json('You are not the author');
//       }

//       await postDoc.update({
//         title,
//         summary,
//         content,
//         cover: newPath ? newPath : postDoc.cover,
//       });

//       res.json(postDoc);
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json('An error occurred while updating the post');
//   }
// });


// app.listen(port, () => {
//   console.log('Runnig SERVER ' + port);
// });
//

const express = require('express');
const cors = require('cors');
const mongoose = require("mongoose");
const User = require('./models/User');
const Post = require('./models/Post');
const Suscriptor = require('./models/Suscribe');
const bcrypt = require('bcryptjs');
const app = express();
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const nodemailer = require('nodemailer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const uploadMiddleware = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024 // 10 megabytes
  }
});


const fs = require('fs').promises;

const storageDirectory = 'uploads/';

fs.chmod(storageDirectory, 0o777)
  .then(() => {
    console.log('Los permisos del directorio se han configurado correctamente.');
  })
  .catch((err) => {
    console.error(`Error al cambiar los permisos del directorio: ${err}`);
  });



const dotenv = require('dotenv').config();

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
app.use('/uploads', express.static(__dirname + '/uploads'));

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

app.post('/suscriptors', async (req, res) => {
  const { name, email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ error: 'El email no puede ser nulo' });
    }

    const existingSubscriber = await Suscriptor.findOne({ email });


    if (existingSubscriber) {
      return res.status(400).json({ error: 'El suscriptor ya existe' });
    }

    const newSuscriptor = new Suscriptor({ name, email });

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





app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const userDoc = await User.findOne({ username });
  
  if (!userDoc) {
    return res.status(400).json('User not found');
  }

  const passOk = bcrypt.compareSync(password, userDoc.password);
  if (passOk) {
    // Generate JWT token
    jwt.sign({ username, id: userDoc._id }, secret, {}, (err, token) => {
      if (err) throw err;
      
      // Set token as a cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none'
      }).json({
        id: userDoc._id,
        username,
        profilePicture: userDoc.profilePicture
      });
    });
  } else {
    res.status(400).json('Wrong credentials');
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

    // Establecer la cookie en la respuesta
    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none'
    });

    // Devolver el perfil del usuario
    res.json(info);

    // Mostrar alerta de token válido
    console.log('Token válido');
  });
});




app.post('/logout', (req, res) => {
  res.cookie('token', '').json('ok');
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




// edit the post


app.post('/post', uploadMiddleware.single('file'), async (req, res) => {
  const { originalname, path } = req.file;
  const parts = originalname.split('.');
  const ext = parts[parts.length - 1];
  const newPath = path + '.' + ext;
  fs.renameSync(path, newPath);

  const { token } = req.cookies;
  jwt.verify(token, secret, {}, async (err, info) => {
    if (err) throw err;
    const { title, summary, content, profileAvatar } = req.body;
    const postDoc = await Post.create({
      title,
      summary,
      content,
      cover: newPath,
      profilePicture: profileAvatar,
      author: info.id,
    });

    const subscribers = await Suscriptor.find({}, 'email');
    // const titulo = title
    for (const subscriber of subscribers) {
      const subscriberEmail = subscriber.email;

      // Enlace al post
      const postId = postDoc._id; // Suponiendo que el ID del post se encuentra en el campo _id
      const link = `https://sentidos.vercel.app/post/${postId}`;

      // Envío del correo electrónico al suscriptor actual
      const mailOptions = {
        from: 'sentidospadres@gmail.com', // Tu dirección de correo electrónico
        to: subscriberEmail,
        subject: 'Nuevo post creado',
        html: `Hola como estas?, queriamos contarte que se creo un nuevo post:<br><br>
        <h2>Título: ${title}</h2><br>
        Dale click en el siguiente enlace: <br></br><hr><button style="background-color: #66b3ff; color: white; font-weight: bold;border-radius:15px"><a href="${link}" style="color: white; text-decoration: none;">VER EL ARTÍCULO</a></button>`,

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
  });
});


app.put('/post', uploadMiddleware.single('file'), async (req, res) => {
  try {
    let newPath = null;
    if (req.file) {
      const { originalname, path } = req.file;
      const parts = originalname.split('.');
      const ext = parts[parts.length - 1];
      newPath = path + '.' + ext;
      fs.renameSync(path, newPath);
      console.log(req.headers);
    }

    const { token } = req.cookies;
    jwt.verify(token, secret, {}, async (err, info) => {
      if (err) throw err;

      const { id } = req.params;
      const { title, summary, content } = req.body;

      const postDoc = await Post.findById(id);
      const isAuthor = JSON.stringify(postDoc.author) === JSON.stringify(info.id);
      if (!isAuthor) {
        return res.status(400).json('You are not the author');
      }

      await postDoc.update({
        title,
        summary,
        content,
        cover: newPath ? newPath : postDoc.cover,
      });

      res.json(postDoc);
    });
  } catch (error) {
    console.log(error);
    res.status(500).json('An error occurred while updating the post');
  }
});


app.listen(port, () => {
  console.log('Runnig SERVER ' + port);
});
//

