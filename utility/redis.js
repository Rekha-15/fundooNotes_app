/*********************************************************************
 * Execution    : 1. Default node with npm   cmd> node server.js
 *                2. If nodemon installed    cmd> npm start
 *
 * Purpose      : To send data to user using redis DB
 *
 * @description
 *
 * @file        : middleware/redis.js
 * @overview    : helps to provide data to user
 * @module      : this is necessary to access the data in the database.
 * @author      : Rekha R Patil [rekhapatil.1509@gmail.com]
 *********************************************************************/

 const redis = require('redis');
const logger = require('../logger/user');
 const client = redis.createClient(process.env.REDIS_PORT);
 
 class RedisClass {
     /**
      * @description function written to provide data to user in minimal time using caching
      * @param {*} a req valid request is expected
      * @param {*} res depends on the request of user
      * @param {*} if there is no data function calls for next function
      */
     checkCache(req, res, next) {
         const  getNotes  = req.params;
         client.get("notes", (error, data) => {
             if(error) {
                 logger.error("Some error occured while retriving data", error)
             }
             if(data !== null) {
                 data = JSON.parse(data);
                 //console.log(data)
                 res.send({success: true, message: "Notes Retrieved!", data: data});
             }else {
                 next();
             }
         });
     }

     /**
      * 
      * @param {*} req 
      * @param {*} res 
      * @param {*} next 
      */

      checkCacheId(req, res, next) {
        client.get("notesId", (error, data) => {
            if(error) {
                logger.error("Some error occured while retriving data", error)
            }
            if(data !== null) {
                data = JSON.parse(data);
               // console.log(data)
                res.send({success: true, message: "Notes Retrieved!", data: data});
            }else {
                next();
            }
        });
    }
 
     /**
      * @description function written to provide data to user in minimal time using caching
      * @param {*} a req valid request is expected
      * @param {*} res depends on the request of user
      * @param {*} if there is no data function calls for next function
      */
      checkLabelCache(req, res, next) {
         client.get("labelId", (error, data) => {
             if(error) {
                logger.error("Some error occured while retriving data", error)
            }
             if(data !== null) {
                 data = JSON.parse(data);
                 res.send({success: true, message: "Labels Retrieved!", data: data});
             }else {
                 next();
             }
         });
     }
 
     /**
      * @description setting data to key into redis
      * @param notesId
      * @param data
      */
     setDataInCache(key, time, value) {
         client.SETEX(key, time, value);
    }

    cacheAvailabilityCheck(key) {

        const ans = client.exists(key);
        console.log(ans);
    }

    /**
     * @description clearing cache
     */
    clearCache() {
        client.flushall();
        console.log('Cache is cleared!')
    }
}
 
 module.exports = new RedisClass();