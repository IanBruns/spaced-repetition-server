const express = require('express')
const LanguageService = require('./language-service')
const { requireAuth } = require('../middleware/jwt-auth')
const LinkedList = require('../structures/linkedlist')
const xss = require('xss')

const languageRouter = express.Router();
const jsonBodyParser = express.json();

languageRouter
  .use(requireAuth)
  .use(async (req, res, next) => {
    try {
      const language = await LanguageService.getUsersLanguage(
        req.app.get('db'),
        req.user.id,
      )

      if (!language)
        return res.status(404).json({
          error: `You don't have any languages`,
        })

      req.language = language
      next()
    } catch (error) {
      next(error)
    }
  })

languageRouter
  .get('/', async (req, res, next) => {
    try {
      const words = await LanguageService.getLanguageWords(
        req.app.get('db'),
        req.language.id,
      )

      res.json({
        language: req.language,
        words,
      })
      next()
    } catch (error) {
      next(error)
    }
  })

languageRouter
  .get('/head', async (req, res, next) => {
    // implement me
    try {
      const head = await LanguageService.getHeadWord(
        req.app.get('db'),
        req.language.head,
      )

      res.json({
        totalScore: req.language.total_score,
        nextWord: head.original,
        wordCorrectCount: head.correct_count,
        wordIncorrectCount: head.incorrect_count,
      })
    } catch (error) {
      next(error)
    }
  })

languageRouter
  .post('/guess', jsonBodyParser, async (req, res, next) => {
    const { guess } = req.body;
    const postGuess = xss(guess)

    if (!postGuess) {
      return res.status(400).send({
        error: `Missing 'guess' in request body`
      })
    }

    const linkedWords = new LinkedList();

    const words = LanguageService.makeLinkedlist(
      req.app.get('db'),
      req.language.id,
      linkedWords
    )

    let response = {
      answer: words[0].translation,
      nextWord: words[1].original,
      totalScore: req.language.total_score,
      wordCorrectCount: words[1].correct_count,
      wordIncorrectCount: words[1].incorrect_count,
      isCorrect: false,
    }

    if (postGuess == linkedWords.head.value.translation) {
      req.language.totalScore += 1;
      linkedWords.head.value.correct_count += 1;
      linkedWords.head.value.memory_value *= 2;

      response = { ...response, isCorrect: true }
    } else {
      // console.log('failure');
      linkedWords.head.value.incorrect_count += 1;
      linkedWords.head.value.memory_value = 1;

      response = { ...response, isCorrect: false }
    }

    //update database

    return res.status(200).json({ response });
  })

module.exports = languageRouter
