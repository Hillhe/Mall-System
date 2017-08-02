const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Goods = require('../models/goods');
const User = require('../models/user');

// connect database
mongoose.connect('mongodb://139.196.185.57:27017/mall-system',{useMongoClient:true});

mongoose.connection.on('connected', ()=>{
  console.log('MongoDB Connected Success.')
});

mongoose.connection.on('error', ()=>{
  console.log('MongoDB Connected Failed.')
});

mongoose.connection.on('disconnected', ()=>{
  console.log('MongoDB Connected Disconnected.')
});


// pagination, sort, filter
router.get('/list', (req, res, next) => {
  const page = parseInt(req.param('page'));// get FE data
  const pageSize = parseInt(req.param('pageSize')); 
  const skip = (page - 1) * pageSize;
  const sort = req.param('sort');

  const priceLevel = req.param('priceLevel');
  var priceGt = '', priceLte = '';
  let params = {};

  if (priceLevel !== 'all') {
    switch (priceLevel) {
      case '0':
        priceGt = 0;
        priceLte = 100;
        break;
      case '1':
        priceGt = 100;
        priceLte = 500;
        break;
      case '2':
        priceGt = 500;
        priceLte = 1000;
        break; 
      case '3':
        priceGt = 1000;
        priceLte = 2000;
        break; 
    }
    params = {
      salePrice: {
        $gt: priceGt,
        $lte: priceLte
      }
    }
  }

  const goodsModel = Goods.find(params).skip(skip).limit(pageSize);
  goodsModel.sort({'salePrice':sort});
  goodsModel.exec({}, (err, doc) => {
    if (err) {
      res.json({
        status: '1',
        msg: err.message
      });
    } else {
      res.json({
        status: '0',
        msg: '',
        result: {
          count: doc.length,
          list: doc
        }
      })
    }
  })
});


// add to Cart
router.post('/addCart', (req, res, next) => {
  const userId = '100000077'; // fake logged in
  const productId = req.body.productId; // post use req.body

// Promise version
//   const promise = new Promise((resolve, reject) => {
//     User.findOne({ userId }, (err, userDoc) => {
//       if (err) {
//         reject(err);
//       } else {
//         resolve(userDoc);
//       }
//     })
//   });

//   promise.then(userDoc => {
//     let exists = false;

//     userDoc.cartList.forEach(item => { // in case duplicate item
//       if (item.productId == productId) {
//         exists = true;
//         item.productNum++;
//       }
//     });

//     if (exists) {
//       return Promise.resolve(userDoc);
//     } else {
//       return new Promise((resolve, reject) => {
//         Goods.findOne({ productId }, (err, doc) => {
//           if (err) {
//             reject(err);
//           } else {
//             doc.productNum = 1; // goods model should contain these properties
//             doc.checked = 1;
//             userDoc.cartList.push(doc);
//             resolve(userDoc);
//           }
//         });
//       });
//     }
//   }, Promise.reject).then(userDoc => {

//     return new Promise((resolve, reject) => {
//       userDoc.save((err, newUserDoc) => {
//         if (err) {
//           reject(err);
//         } else {
//           res.json({
//             status: '0',
//             msg: '',
//             result: 'suc'
//           });

//           resolve(newUserDoc);
//         }
//       });
//     });
//   }).catch(err => {
//     res.json({
//       status: '1',
//       msg: err.message
//     });
//   });



// Async version
  const getUserDoc = userId => 
    new Promise ((resolve, reject) => {
      User.findOne({ userId }, (err, userDoc) => {
        if (err) {
          reject(err);
        } else {
          resolve(userDoc);
        }
      })
    })

  const amendUserDoc = (userDoc, productId) => {
    let exists = false;

    userDoc.cartList.forEach(item => {
      if (item.productId == productId) {
        exists = true;
        item.productNum++; 
      }
    });

    if (exists) {
      return Promise.resolve(userDoc);
    } else {
      return new Promise ((resolve, reject) => {
        Goods.findOne({ productId }, (err, doc) => {
          if (err) {
            reject(err);
          } else {
            doc.productNum = 1; 
            doc.checked = 1;
            userDoc.cartList.push(doc);
            resolve(userDoc);
          }
        });
      })
    }
  }

  const saveUserDoc = userDoc => 
    new Promise((resolve, reject) => {
      userDoc.save((err, doc) => {
        if (err) {
          reject(err);
        } else {
          resolve(doc);
        }
      });
    })

  async function addCart(userId, productId) {
    let userDoc = await getUserDoc(userId);
    userDoc = await amendUserDoc(userDoc, productId);
    await saveUserDoc(userDoc);
  };

  addCart(userId, productId).then(() => {
    res.json({
      status: '0',
      msg: '',
      result: 'suc'
    });
  }).catch(err => {
    res.json({
      status: '1',
      msg: err.message
    });
  });

});

module.exports = router;