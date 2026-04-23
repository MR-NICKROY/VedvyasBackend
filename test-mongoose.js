const mongoose = require('mongoose');
const schema = new mongoose.Schema({ name: String });

schema.pre('save', async function(next) {
  try {
    next();
  } catch (err) {
    console.error(err.message);
  }
});

const Model = mongoose.model('Test', schema);
const doc = new Model({ name: 'hello' });
doc.save().catch(err => console.log('Mongoose throw:', err.message));
