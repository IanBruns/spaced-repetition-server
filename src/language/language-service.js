const LanguageService = {
  getUsersLanguage(db, user_id) {
    return db
      .from('language')
      .select(
        'language.id',
        'language.name',
        'language.user_id',
        'language.head',
        'language.total_score',
      )
      .where('language.user_id', user_id)
      .first()
  },

  getLanguageWords(db, language_id) {
    return db
      .from('word')
      .select(
        'id',
        'language_id',
        'original',
        'translation',
        'next',
        'memory_value',
        'correct_count',
        'incorrect_count',
      )
      .where({ language_id })
  },

  getHeadWord(db, head_id) {
    return db
      .from('word')
      .select(
        'id',
        'language_id',
        'original',
        'translation',
        'next',
        'memory_value',
        'correct_count',
        'incorrect_count',
      )
      .where({ id: head_id })
      .first();
  },

  async makeLinkedlist(db, language_id, list) {
    const arr = await db
      .from('word')
      .select(
        'id',
        'language_id',
        'original',
        'translation',
        'next',
        'memory_value',
        'correct_count',
        'incorrect_count'
      )
      .where({ language_id });

    arr.map((word) => list.insertLast(word));

    return arr;
  },

  async insertNewLinkedList(db, ll) {
    //editing over the database with the values in our linked list, making the entire
    //operation O(n) time, if we just edited the next's and sorted, that ups time to
    //O(nlogn)
    for (let i = 0; i < ll.length; i++) {
      await db('word').where('id', '=', ll[i].id).update(ll[i]);
    }
    return;
  },

  async updateLanguagetotalScore(db, language) {
    await db('language')
      .where({ user_id: language.user_id })
      .update(language);
  }
}

module.exports = LanguageService
