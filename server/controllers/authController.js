const bcrypt = require('bcryptjs')

module.exports = {
  register: async (req, res) => {
    const db = req.app.get('db'),
      { email, password } = req.body

    // db.get_user_by_email(email).then(user => ...)
    // this method would require all logic to be inside .then()
    const existingUser = await db.get_user_by_email(email)

    // MASSIVE ALWAYS RETURNS AN ARRAY
    // if user DOES exist, send this response
    if (existingUser[0]) {
      return res.status(409).send('User already exists')
    }

    // Salt and hash
    const salt = bcrypt.genSaltSync(10)
    const hash = bcrypt.hashSync(password, salt)

    const newUser = await db.create_user([email, hash])

    req.session.user = newUser[0]

    res.status(200).send(req.session.user)
  },
  login: async (req, res) => {
    if (req.session.attemptCount >= 5) {
      return res.status(403).send('Too many attempts')
    }
    const { email, password } = req.body,
      db = req.app.get('db')

    // Make sure user exists
    const existingUser = await db.get_user_by_email(email)

    // If user does NOT exist, send response
    if (!existingUser[0]) {
      return res.status(404).send('User does not exist')
    }

    // if they do exist, we need to authenticate them
    const authenticated = bcrypt.compareSync(password, existingUser[0].hash)

    if (!authenticated) {
      !req.session.attemptCount ? (req.session.attemptCount = 1) : req.session.attemptCount++
      return res
        .status(403)
        .send(`Incorrect password, ${6 - req.session.attemptCount} attempts remaining`)
    }

    delete existingUser[0].hash

    req.session.user = existingUser[0]

    res.status(200).send(req.session)
  },
  logout: (req, res) => {
    req.session.destroy()

    res.sendStatus(200)
  }
}