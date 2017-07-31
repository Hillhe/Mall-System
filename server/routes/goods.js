const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Goods = require('../models/goods');

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



router.get('/', (req, res, next) => {
  Goods.find({}, (err, doc) => {
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

module.exports = router;