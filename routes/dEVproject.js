const express = require('express')
const router = express.Router()
const { ensureAuth } = require('../middleware/auth')

const Code = require('../models/Code')

// @desc    Show add page
// @route   GET /dEVproject/add
router.get('/add', ensureAuth, (req, res) => {
  res.render('dEVproject/add')
})

// @desc    Process add form
// @route   POST /dEVproject
router.post('/', ensureAuth, async (req, res) => {
  try {
    req.body.user = req.user.id
    await Code.create(req.body)
    res.redirect('/dashboard')
  } catch (err) {
    console.error(err)
    res.render('error/500')
  }
})

// @desc    Show all dEVproject
// @route   GET /dEVproject
router.get('/', ensureAuth, async (req, res) => {
  try {
    const dEVproject = await Code.find({ status: 'public' })
      .populate('user')
      .sort({ createdAt: 'desc' })
      .lean()

    res.render('dEVproject/index', {
      dEVproject,
    })
  } catch (err) {
    console.error(err)
    res.render('error/500')
  }
})

// @desc    Show single code
// @route   GET /dEVproject/:id
router.get('/:id', ensureAuth, async (req, res) => {
  try {
    let code = await Code.findById(req.params.id).populate('user').lean()

    if (!code) {
      return res.render('error/404')
    }

    if (code.user._id != req.user.id && code.status == 'private') {
      res.render('error/404')
    } else {
      res.render('dEVproject/show', {
        code,
      })
    }
  } catch (err) {
    console.error(err)
    res.render('error/404')
  }
})

// @desc    Show edit page
// @route   GET /dEVproject/edit/:id
router.get('/edit/:id', ensureAuth, async (req, res) => {
  try {
    const code = await Code.findOne({
      _id: req.params.id,
    }).lean()

    if (!code) {
      return res.render('error/404')
    }

    if (code.user != req.user.id) {
      res.redirect('/dEVproject')
    } else {
      res.render('dEVproject/edit', {
        code,
      })
    }
  } catch (err) {
    console.error(err)
    return res.render('error/500')
  }
})

// @desc    Update code
// @route   PUT /dEVproject/:id
router.put('/:id', ensureAuth, async (req, res) => {
  try {
    let code = await Code.findById(req.params.id).lean()

    if (!code) {
      return res.render('error/404')
    }

    if (code.user != req.user.id) {
      res.redirect('/dEVproject')
    } else {
      code = await Code.findOneAndUpdate({ _id: req.params.id }, req.body, {
        new: true,
        runValidators: true,
      })

      res.redirect('/dashboard')
    }
  } catch (err) {
    console.error(err)
    return res.render('error/500')
  }
})

// @desc    Delete code
// @route   DELETE /dEVproject/:id
router.delete('/:id', ensureAuth, async (req, res) => {
  try {
    let code = await Code.findById(req.params.id).lean()

    if (!code) {
      return res.render('error/404')
    }

    if (code.user != req.user.id) {
      res.redirect('/dEVproject')
    } else {
      await Code.remove({ _id: req.params.id })
      res.redirect('/dashboard')
    }
  } catch (err) {
    console.error(err)
    return res.render('error/500')
  }
})

// @desc    User dEVproject
// @route   GET /dEVproject/user/:userId
router.get('/user/:userId', ensureAuth, async (req, res) => {
  try {
    const dEVproject = await Code.find({
      user: req.params.userId,
      status: 'public',
    })
      .populate('user')
      .lean()

    res.render('dEVproject/index', {
      dEVproject,
    })
  } catch (err) {
    console.error(err)
    res.render('error/500')
  }
})

module.exports = router
