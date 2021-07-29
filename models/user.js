const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const fundooNoteSchema = mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
}, {
  timestamps: true,
});

/**
 * @description     : It is converting password content to a encrypted to form using pre middleware
 *                    of mongoose and bcrypt npm package.
 * @middleware      : pre is the middleware of mongoose schema
 * @package         : bcrypt is used to encrpt the password we are getting from client side
*/
fundooNoteSchema.pre('save', async function (next) {
  try {
    const salt = await bcrypt.genSalt(10);
    const hassedPassword = await bcrypt.hash(this.password, salt);
    this.password = hassedPassword;
    next();
  } catch (error) {
    next(error);
  }
});

const FundooNoteModel = mongoose.model('User', fundooNoteSchema);

class Model {
  /**
   * @description     : It is use to create and save a new note in data base.
   * @param           : data, callback
   * @method          : save to save the coming data in data base
  */
  create = async (data, callback) => {
    const note = new FundooNoteModel({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: data.password,
    });
    const user = await FundooNoteModel.findOne({ email: data.email });
    if (user) {
      callback('User already exist');
    } else {
      const userData = await note.save();
      callback(null, userData);
    }

  FundooNoteModel.save({}, (err, data) => {
      return err ? callback(err, null) : callback(null, data);
  });
} 
//get all the data from the server
  findAll = (callback) => {
    try {
        FundooNoteModel.find({}, (err, data)=> {
            return err ? callback(err, null) : callback(null, data);
        });
    } catch (err) {
        callback(err, null);
    }
};

// get one user by id
getDataById = (userId, callback) => {
    try{
        FundooNoteModel.findById(userId, (err, data) => {
            return err ? callback(err, null) : callback(null, data);
        });
    } catch (err) {
        callback(err, null);
    }
};
}

//exporting the class        
module.exports = new Model();