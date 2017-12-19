var  express = require("express");
var  browserify  = require('browserify-middleware');
var  babelify = require("babelify");
var  browserSync = require('browser-sync');
var  app = express();
var bodyparser = require('body-parser');
var  port = process.env.PORT || 8080;
var mongoose = require('mongoose');
mongoose.connect('mongodb://reactor:mongo5263@ds161026.mlab.com:61026/reactsearchapp/sites');

var siteSchema = new mongoose.Schema({
  title: String,
  link: String,
  desc: String
});

var searchDb = mongoose.model('sites', siteSchema);

var routes = function (app) {
    app.use(bodyparser.json());

    app.get('/search/:title',
    function (req, res) {
      searchDb.find({title: { $regex: '^' + req.params.title + '*', $options: 'i' } },
      function (err, data) {
        if(err) return console.log('find error:', err);
        if(!data.length)
          return res.status(500)
            .send({
              'msg': 'No results'
            })
        res.json(data);
      });
    });
};

browserify.settings({
  transform: [babelify.configure({
  })],
  presets: ["es2015", "react"],  
  extensions: ['.js', '.jsx'],
  grep: /\.jsx?$/
});

app.get('/bundle.js', browserify(__dirname+'/source/app.jsx'));

// allowed file types
app.get(['*.png','*.jpg','*.css','*.map'], function (req, res) {
  res.sendFile(__dirname+"/public/"+req.path);
});
// all other requests will be routed to index.html
app.get('*', function (req, res) {
  res.sendFile(__dirname+"/public/index.html");
});

var router = express.Router();
routes(router);
app.use('/v1', router);
app.listen(port,function(){
  browserSync({
    proxy: 'localhost:' + port,
    files: ['source/**/*.{jsx,js}','public/**/*.{css}'],
    options: {
      ignored: 'node_modules'
    }
  });
});