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
    try {
      const { guess } = req.body;
      const postGuess = xss(guess)

      if (!postGuess) {
        return res.status(400).send({
          error: `Missing 'guess' in request body`
        })
      }

      const linkedWords = new LinkedList();

      const words = await LanguageService.makeLinkedlist(
        req.app.get('db'),
        req.language.id,
        linkedWords
      )

      let lang = await LanguageService.getUsersLanguage(
        req.app.get('db'),
        req.user.id
      );

      let response = {
        answer: words[0].translation,
        nextWord: words[1].original,
        totalScore: lang.total_score,
        wordCorrectCount: words[1].correct_count,
        wordIncorrectCount: words[1].incorrect_count,
        isCorrect: false,
      }

      if (postGuess == linkedWords.head.value.translation) {
        lang.total_score += 1;
        response.totalScore += 1;
        linkedWords.head.value.correct_count += 1;
        linkedWords.head.value.memory_value *= 2;

        response = { ...response, isCorrect: true }
      } else {
        // console.log('failure');
        linkedWords.head.value.incorrect_count += 1;
        linkedWords.head.value.memory_value = 1;

        response = { ...response, isCorrect: false }
      }

      let m = linkedWords.head.value.memory_value;

      store = linkedWords.head;

      //Linked List manipulation
      while (store.next !== null && m > 0) {
        //create store variables
        let soriginal = store.value.original;
        let stranslation = store.value.translation;
        let scorrect_count = store.value.correct_count;
        let sincorrect_count = store.value.incorrect_count;
        let sm = store.value.memory_value;

        //move positions based on mem val to new location
        store.value.original = store.next.value.original;
        store.value.translation = store.next.value.translation;
        store.value.correct_count = store.next.value.correct_count;
        store.value.incorrect_count = store.next.value.incorrect_count;
        store.value.memory_value = store.next.value.memory_value;

        //reassign values to correct positions
        store.next.value.original = soriginal;
        store.next.value.translation = stranslation;
        store.next.value.correct_count = scorrect_count;
        store.next.value.incorrect_count = sincorrect_count;
        store.next.value.memory_value = sm;
        store = store.next;
        m--;
      }

      let arrTemp = linkedWords.head;

      let linkedWordsArr = [];

      while (arrTemp) {
        linkedWordsArr.push(arrTemp.value);
        arrTemp = arrTemp.next;
      }

      //update databases
      LanguageService.insertNewLinkedList(req.app.get('db'), linkedWordsArr);
      LanguageService.updateLanguagetotalScore(req.app.get('db'), lang);

      return res.json(response);
    } catch (error) {
      next(error);
    }
  })

module.exports = languageRouter
