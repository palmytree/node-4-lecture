module.exports = {
  checkSession: (req, res) => {
    if (!req.session.refreshCount) {
      req.session.refreshCount = 1
    } else {
      req.session.refreshCount++
    }

    if (!req.session.history) {
      req.session.history = [
        {
          method: 'GET',
          endpoint: '/session',
          mostRecentAccess: new Date(),
          count: 1
        }
      ]
    } else {
      const index = req.session.history.findIndex(e => e.endpoint === '/session')
      req.session.history[index].count++
      req.session.history[index].mostRecentAccess = new Date()
    }
    req.session.showMeTheMoney = true
    res.send(req.session)
  }
}
