require('dotenv').config()
const express = require('express'),
  session = require('express-session'),
  massive = require('massive'),
  authCtrl = require('./controllers/authController'),
  sessionCtrl = require('./controllers/sessionController'),
  checkForSession = require('./middlewares/checkForSession'),
  authenticateUser = require('./middlewares/authenticateUser'),
  app = express(),
  { SERVER_PORT, CONNECTION_STRING, SESSION_SECRET } = process.env

app.use(express.json())
app.use(
  session({
    resave: false,
    saveUninitialized: true,
    secret: SESSION_SECRET,
    cookie: { maxAge: 1000 * 60 * 60 * 24 } // time in milliseconds
  })
)

app.get('/session', sessionCtrl.checkSession)
app.post('/auth/register', authCtrl.register)
// REQUEST LEVEL MIDDLEWARE ASSIGNED ON PER ENDPOINT BASIS
app.post('/auth/login', checkForSession, authCtrl.login)
app.delete('/auth/logout', authCtrl.logout)

//SECRET STUFF
app.get('/api/secrets', authenticateUser, (req, res) => res.send('Secret'))

massive({
  connectionString: CONNECTION_STRING,
  ssl: { rejectUnauthorized: false }
}).then(db => {
  app.set('db', db)
  console.log('Database connected')
  app.listen(SERVER_PORT, () => console.log(`Server running on port: ${SERVER_PORT}`))
})
