const notesService = require('../service/note');
const {notesCreationValidation, addingRemovingLabelValidation, verifyToken} = require('../utility/validation');
logger = require('../logger/user');
const redisClass = require('../utility/redis')
const redis = require('redis');
const { clear } = require('../logger/user');
const client = redis.createClient(process.env.REDIS_PORT);


class NotesController {
    /**
     * @description function written to create notes into the database
     * @param {*} a valid req body is expected
     * @param {*} res 
     * @returns response
     */
    async createNotes(req, res) {
        try {
            let dataValidation = notesCreationValidation.validate(req.body);
            if (dataValidation.error) {
                return res.status(400).send({
                    message: dataValidation.error.details[0].message
                });
            }
                let token = req.get('token')
                 //console.log(token)
                const tokenData = verifyToken(token);
                const notesData = {
                title: req.body.title,
                description: req.body.description,
                userId:tokenData.data._id
            };
            
            redisClass.clearCache();
            const notesCreated = await notesService.createNotes(notesData);
            res.send({success: true, message: "Notes Created!", data: notesCreated});
        }
           catch (error) {
            console.log(error);
            res.status(500).send({success: false, message: "Some error occurred while creating notes" });
        }
      
    }

    /**
      * @description function written to get label by ID
      * @param {*} req 
      * @param {*} res 
      */
     async getNoteById(req, res) {
        try {
            let notesId = req.params;
            const getNote = await notesService.getNoteById(notesId);
            const data = JSON.stringify(getNote);
            redisClass.setDataInCache("notesId", 3600, data)
            res.send({success: true, message: "Notes Retrieved!", data: getNote});
        } catch (error) {
            console.log(error);
            res.status(500).send({success: false, message: "Some error occurred while retrieving label"});
        }
    }

    /**
     * @description function written to get all the notes from the database
     * @param {*} req 
     * @param {*} res 
     * @returns response
     */
    async getAllNotes(req, res) {
        try {
            const getNotes = req.params;
            const getAllNotes = await notesService.getAllNotes();
            // const data = JSON.stringify(getAllNotes);
            // redisClass.setDataInCache("notes", 3600, data)
            res.send({success: true, message: "Notes Retrieved!", data: getAllNotes});
        } catch (error) {
            console.log(error);
            res.status(500).send({success: false, message: "Some error occurred while retrieving notes"});
        }
    }

    /**
     * @description function written to update notes using ID from the database
     * @param {*} req 
     * @param {*} res 
     * @returns response
     */
    async updateNotesById(req, res) {
        try {
            let dataValidation = notesCreationValidation.validate(req.body);
            if (dataValidation.error) {
                return res.status(400).send({
                    message: dataValidation.error.details[0].message
                });
            }
           let notesId = req.params;
            const notesData = {
                title: req.body.title,
                description: req.body.description
            }
            const updateNote = await notesService.updateNotesById(notesId, notesData);
            redisClass.clearCache();
            res.send({success: true, message: "Notes Updated!", data: updateNote});
        } catch (error) {
            console.log(error);
            res.status(500).send({success: false, message: "Some error occurred while updating notes"});
        }
    }

  //   /**
  //    * @description function written to delete note by ID
  //    * @param {*} req 
  //    * @param {*} res 
  //    */
  //   // finding note and updating it with the request body
  //     deleteNotesById = (req, res) => {
  //       try {
  //         console.log(req.params)
  //         notesService.deleteNoteById(req.params)
  //       .then((note) => {
  //         if (!note) {
  //           return res.status(404).send({
  //             success: false,
  //             message: "Note not found with id " + req.params,
  //           });
  //         }
  //         res.send({
  //           success: true,
  //           message: "Note deleted successfully!",
  //           data: note,
  //         });
  //       })
  //       .catch((err) => {
  //         logger.error("Error while deleting the note", err);
  //         res.status(500).json({
  //           success: false,
  //           message: err,
  //         });
  //       });
  //   } catch (error) {
  //     logger.error("Error while deleting the note", error);
  //     res.status(500).json({
  //       success: false,
  //       message: error,
  //     });
  //   }
  // };

//   /**
//      * @description function written to delete note by ID
//      * @param {*} req 
//      * @param {*} res 
//      * @returns response
//      */
//    async deleteNotesById(req, res) {
//     try {
//         let notesId = req.params;
//         const notesData = {
//             _id: notesId,
//             isDeleted: req.body.isDeleted
//         }
//         const deleteNote = await notesService.deleteNoteById(notesId);
//         redisClass.clearCache();
//         res.send({success: true, message: "Note Deleted!"});
//     } catch (error) {
//         console.log(error);
//         res.status(500).send({success: false, message: "Some error occurred while updating notes"});
//     }
//   }

/**
   * @description : It is deleting an existing note in fundooNotes
   * @param {httprequest} req
   * @param {httpresponse} res
   * @method       : deleteNote from service.js
  */
 deleteNote = (req, res) => {
    try {
        notesService.deleteNote(req.params.notesId, (error, result) => {
        if (error) {
          return res.status(400).send({
            success: false,
            message: 'Unable to delete the note',
          });
        }
        return res.status(200).send({
          success: true,
          message: 'note deleted successfully',
          result,
        });
      });
    } catch (err) {
      res.status(500).send({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
     * @description function written to add label to note
     * @param {*} a valid noteId is expected
     * @param {*} a valid labelData is expected
     * @returns 
     */
   async addLabelToNote(req, res) {
    try {
        let dataValidation = addingRemovingLabelValidation.validate(req.body);
        if (dataValidation.error) {
            return res.status(400).send({
                message: dataValidation.error.details[0].message
            });
        }        
        let token = req.get('token')
       //console.log(token)
        const tokenData = verifyToken(token);
        const notesId = req.body.notesId;
        const labelData = {
            labelId: [req.body.labelId]
        }
        const userId = {
        userId: [tokenData.data._id]
        }
        const addLabelName = await notesService.addLabelToNote(notesId, labelData);
        res.send({success: true, message: "Label Added!", data: addLabelName});
    } catch (error) {
        console.log(error);
        res.status(500).send({success: false, message: "Some error occurred while adding label to notes"});
    }
}

// /**
//  * @description function written to delete label from note
//  * @param {*} a valid noteId is expected
//  * @param {*} a valid labelData is expected
//  * @returns 
//  */
//  async deleteLabelFromNote(req, res) {
//     try {
//         let dataValidation = addingRemovingLabelValidation.validate(req.body);
//         if (dataValidation.error) {
//             return res.status(400).send({
//                 message: dataValidation.error.details[0].message
//             });
//         }
//         let token = req.get('token')
//        //console.log(token)
//         const tokenData = verifyToken(token);
//         const notesId = req.body.notesId;
//         const labelData = {
//             labelId: [req.body.labelId]
//         }
//         const userId = {
//             userId: [tokenData.data._id]
//         }

//         const addLabelName = await notesService.deleteLabelFromNote(notesId, labelData);
//         res.send({success: true, message: "Label Deleted!", data: addLabelName});
//     } catch (error) {
//         console.log(error);
//         res.status(500).send({success: false, message: "Some error occurred while deleting label from notes"});
//     }
//  }

/**
   * @description : It is deleting an label from an existing note in fundooNotes
   * @param {httprequest} req
   * @param {httpresponse} res
   * @method       : removeLabelFromNote from service.js
  */
 removeLabelFromNote = (req, res) => {
    try {
        let token = req.get('token')
        //console.log(token)
        const tokenData = verifyToken(token);
      const data = {
        labelId: req.body.labelId,
        notesId: req.body.noteId,
        userId:tokenData.data._id,
      };
      let dataValidation = addingRemovingLabelValidation.validate(req.body);
        if (dataValidation.error) {
            return res.status(400).send({
                message: dataValidation.error.details[0].message
            });
        }
      notesService.removeLabelFromNote(data).then(() => {
        res.status(200).send({
          success: true,
          message: 'label removed from note successfully',
        });
      }).catch((err) => {
        res.status(400).send({
          success: false,
          message: 'label was unable to remove from note',
          err,
        });
      });
    } catch (err) {
      res.status(500).send({
        success: false,
        message: 'Internal server error',
      });
    }
  }
}

//exporting th whole class to utilize or call function created in this class
module.exports = new NotesController();