/**
 * @description   : It is use to taking the request from the client and gives the response and
 *                  validating whether the input is correct or not.
 * @file          : user.js
 * @author        : Rekha Patil
*/
require('dotenv').config();
const { exist } = require('joi');
logger = require('../logger/user');
const services = require('../service/user');
const { authSchema, userLoginDetails, generatingToken } = require('../utility/validation');

/**
 * @description    : This class has two methods to create and login of user
 * @methods        : create, login and forgotPassword
*/

class Controller {
  /**
   * @description   : creates an note in fundooNote
   * @param         : httpRequest and httpResponse
   * @method        : validate it compares the authSchema properties and the data coming
   *                  from the object and using services file method
  */
  create = (req, res) => {
    try {
      const userDetails = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: req.body.password,
      };
      const validationResult = authSchema.validate(userDetails);
      if (validationResult.error) {
        res.status(400).send({
          success: false,
          message: 'Pass the proper format of all the fields',
          data: validationResult,
        });
        return;
      }
      services.create(userDetails, (error, data) => {
        if (error) {
          logger.error("Error while creating the user", error);
          return res.status(409).send({
            success: false,
            message: 'User already exist',
          });
        } else {
          logger.info("User created successfully🥳",data);
          res.status(201).send({
          success: true,
          message: 'created successfully',
        });
      }
      });
    } catch (err) {
      logger.error("Internal server error while registering new user", error);
      res.status(500).send({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * @description   : login an user in fundooNote
   * @param         : httpRequest and httpResponse
   * @method        : services file method for login having an object and callback
  */
   login = (req, res) => {
    try {
      const loginCredentials = {
        email: req.body.email,
        password: req.body.password,
      };
      services.login(loginCredentials, (error, data) => {
        if (error) {
          return res.status(400).send({
            success: false,
            message: 'login failed',
            error,
          });
        }
        return res.status(200).send({
          success: true,
          message: 'logged in successfully',
          token: generatingToken(data),
          data,
        });
      });
    } catch (err) {
      return res.status(500).send({
        success: false,
        message: 'Internal server error',
      });
    }
  }


  // login = (req, res) => {
  //   const info = {
  //       email: req.body.email,
  //       password : req.body.password
  //   }
  //   services.login(info, (error, token) => {
  //       if(error){
  //           return res.status(400).send({success: false, message: error, token: error})
  //       }
  //       else{
  //           return res.status(200).send({success: true, message: "Successfully Logged In", token: token})
  //       }
  //   })
  // }

    


  /**
   * @description     : used when a user forgot his/her password
   * @param {httprequest} : req
   * @param {httpresponse} : res
   * @method          : forgotPasssword
   * @file            : user.js
  */
   forgotPassword = (req, res) => {
    try {
      const userCredential = {
        email: req.body.email,
      };
      services.forgotPassword(userCredential, (error, result) => {
        if (error) {
           //logger.error("Error while trying to find user email-id",error);
          return res.status(400).send({
            success: false,
            message: 'failed to send email',
            error,
          });
        }
         //logger.info("email found and sent link successfully😊",result);
        return res.status(200).send({
          success: true,
          message: 'User email id exist and Email sent successfully',
          result,
        });
      });
    } catch (err) {
      return res.status(500).send({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * @description     : used when a user forgot his/her password
   * @param {httprequest} : req
   * @param {httpresponse} : res
   * @method          : resetPassword
   * @package         : jwt
   * @file            : user.js
  */
//    resetPassword = (req, res) => {
//     try {
//       const userCredential = {
//         password: req.body.password,
//         token: req.header.token,
//       };
//       services.resetPassword(userCredential, (error, result) => {
//         if (error) {
//           logger.error("Error while resetting the password", error);
//           res.status(400).send({
//             success: false,
//             message: 'failed reset the password',
//             error,
//           });
//         } else {
//           logger.info("Password reset successfully", result)
//           res.status(200).send({
//           success: true,
//           message: 'password changed successfully',
//           result:  result,
//         });
//       }
//      });
//     } catch (err) {
//       logger.error("Error while resetting the password", err);
//       return res.status(401).send({
//         success: false,
//         message: 'Token expired or invalid token',
//       });
//     }
//   }

/**
    * @description this function handles reset password api where user can update his password into database
    * @param {*} req 
    * @param {*} res 
    * @returns 
    */
 async passwordReset(req, res) {
  try {
      const userPassword = {
          password: req.body.password,
          confirmPassword: req.body.confirmPassword
      }
      const userToken = req.headers.token;
      console.log(userToken);
      if(!userToken) {
          return res.status(401).send({message: "Please get token!"});
      }
      else if(userPassword.password == userPassword.confirmPassword) {
          const resetPassword = await services.resetPassword(userPassword, userToken);
          return res.send({success: true, message: "Password is changed successfully!"});
      }else {
          return res.status(500).send({message: "Please enter same password in both password and confirmPassword fields!"});
      }
  } catch (error) {
      res.status(500).send({message: error})
  }
}

 }
    
//exporting the class
module.exports = new Controller();