/**
* This boot script defines custom Express routes not tied to models
**/

module.exports = function(app) {

  var Blog = app.models.Blog;

  /**
  * Defines a routes so that blogs are accessible by user
  * and slug: /jeffdonthemic/hello-world instead of id.
  **/
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
