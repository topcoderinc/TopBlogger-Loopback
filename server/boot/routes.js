module.exports = function(app) {

  var Blog = app.models.Blog;

  app.get('/:user/:slug', function(req, res) {
    Blog.findOne({ where: {authorId: req.params.user, slug:req.params.slug}, include: 'comments'}, function(err, record){
      if (err) res.send(err);
      if (!err && record) {
        res.send(record);
      } else {
        res.send(404);
      }
    });
  });
}
