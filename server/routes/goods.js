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
router.get('/', (req, res, next) => {
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

// add to cart
router.post('/addCart', (req, res, next) => {
  const userId = '100000077'; // fake logged in
  const productId = req.body.productId; // post use req.body

  // User.findOne({
  //   userId: userId
  // }, (err, userDoc) => {
  //   if (err) {
  //     res.json({
  //       status: '1',
  //       msg: err.message
  //     });
  //   } else {
  //     if (userDoc) {
  //       userDoc.cartList.forEach(item => {
  //         if (item.productId == productId) { // in case duplicate item
  //           console.log('duplicate')
  //           item.productNum++;
  //           userDoc.save((err2, doc2) => {
  //             res.json({
  //               status: '0',
  //               msg: '',
  //               result: 'suc'
  //             })
  //           });
  //           return;
  //         }
  //       });



  //       Goods.findOne({productId}, (err1, doc1) => {
  //         if (err1) {
  //           res.json({
  //             status: '1',
  //             msg: err1.message
  //           });
  //         } else {
  //           if (doc1) {
  //             doc1.productNum = 1;
  //             doc1.checked = 1;
  //             console.log(doc1);
  //             userDoc.cartList.push(doc1);
  //             userDoc.save((err2, doc2) => {
  //               res.json({
  //                 status: '0',
  //                 msg: '',
  //                 result: 'suc'
  //               })
  //             })
  //           }
  //         }  
  //       })
  //     }
  //   }
  // });
  const promise = new Promise((resolve, reject) => {
    User.findOne({userId}, (err, userDoc) => {
      if (err) {
        reject(err);
      } else {
        resolve(userDoc);
      }
    })
  });

  promise.then(userDoc => {

    let single = true;

    userDoc.cartList.forEach(item => { // in case duplicate item
      if (item.productId == productId) {
        single = false;
        item.productNum++;
        userDoc.save((err, doc) => {
          res.json({
            status: '0',
            msg: '',
            result: 'suc'
          })
        });
      } 
    })

    if (single) {
      Goods.findOne({productId}, (err, doc) => {
        if (err) {
          return err;
        } else {
          return doc;

          // doc.productNum = 1;
          // doc.checked = 1;

          // userDoc.cartList.push(doc);
          // userDoc.save((err2, doc2) => {
          //   res.json({
          //     status: '0',
          //     msg: '',
          //     result: 'suc'
          //   })
          // })
        }
      });
    }
   
  }).then(doc => {
    console.log('doc2' + doc);

    doc.productNum = 1;
    doc.checked = 1;

    userDoc.cartList.push(doc);
    userDoc.save((err2, doc2) => {
      res.json({
        status: '0',
        msg: '',
        result: 'suc'
      })
    })
  }).catch(err => {
    res.json({
      status: '1',
      msg: err.message
    });
  });

});

module.exports = router;