var loopback = require('loopback');
var slugify = require('slugify');

module.exports = function(Blog) {

  // PUBLISH
  Blog.publish = function(id, cb) {
    Blog.findById(id, function(err, record){
      record.updateAttributes({isPublished: true, publishedDate: new Date()}, function(err, instance) {
        if (err) cb(err);
        if (!err) cb(null, instance);
      })
    })
  };

  Blog.remoteMethod(
    'publish',
    {
      http: {path: '/:id/publish', verb: 'put'},
      accepts: {arg: 'id', type: 'string', required: true, http: { source: 'path' }},
      returns: {root: true, type: 'object'},
      description: 'Marks a blog as published.'
    }
  );
  // PUBLISH

  // UPVOTE
  Blog.upvote = function(id, cb) {
    // get the current context
    var ctx = loopback.getCurrentContext();
    Blog.findById(id, function(err, record){
      // get the calling user from the context & push to array
      record.upvotes.push(ctx.active.accessToken.userId);
      record.updateAttributes({numOfUpVotes: record.upvotes.length, upvotes: record.upvotes}, function(err, instance) {
        if (err) cb(err);
        if (!err) cb(null, instance);
      })
    })
  };

  Blog.remoteMethod(
    'upvote',
    {
      http: {path: '/:id/upvote', verb: 'post'},
      accepts: {arg: 'id', type: 'string', required: true, http: { source: 'path' }},
      returns: {root: true, type: 'object'},
      description: 'Marks a blog as upvoted.'
    }
  );

  Blog.beforeRemote('upvote', function(ctx, user, next) {
    Blog.findById(ctx.req.params.id, function(err, record){
      // do not let them upvote their own record
      if (record.authorId === ctx.req.accessToken.userId) {
        var err = new Error("User cannot upvote their own blog post.");
        err.status = 403;
        next(err);
      } else if (record.upvotes.indexOf(ctx.req.accessToken.userId) != -1) {
        var err = new Error("User has already upvoted the blog.");
        err.status = 403;
        next(err);
      } else {
        next();
      }
    })
  });
  // UPVOTE

  // DOWNVOTE -- essentially the same code as upvote
  Blog.downvote = function(id, cb) {
    // get the current context
    var ctx = loopback.getCurrentContext();
    Blog.findById(id, function(err, record){
      // get the calling user from the context & push to array
      record.downvotes.push(ctx.active.accessToken.userId);
      record.updateAttributes({numOfDownVotes: record.downvotes.length, downvote: record.downvotes}, function(err, instance) {
        if (err) cb(err);
        if (!err) cb(null, instance);
      })
    })
  };

  Blog.remoteMethod(
    'downvote',
    {
      http: {path: '/:id/downvote', verb: 'post'},
      accepts: {arg: 'id', type: 'string', required: true, http: { source: 'path' }},
      returns: {root: true, type: 'object'},
      description: 'Marks a blog as downvoted.'
    }
  );

  Blog.beforeRemote('downvote', function(ctx, user, next) {
    Blog.findById(ctx.req.params.id, function(err, record){
      // do not let them downvote their own record
      if (record.authorId === ctx.req.accessToken.userId) {
        var err = new Error("User cannot downvote their own blog post.");
        err.status = 403;
        next(err);
      } else if (record.downvotes.indexOf(ctx.req.accessToken.userId) != -1) {
        var err = new Error("User has already downvoted the blog.");
        err.status = 403;
        next(err);
      } else {
        next();
      }
    })
  });
  // DOWNVOTE


  Blog.observe('before save', function filterProperties(ctx, next) {
    // TODO ensure the slug is unique per user
    if (ctx.instance) {
      if (ctx.instance.slug === undefined) {
        ctx.instance.slug = slugify(ctx.instance.title).toLowerCase();
      }
      // add a date before saving
      if (ctx.instance.createdDate === undefined) {
        ctx.instance.createdDate = new Date();
      }
      if (ctx.instance.upvotes === undefined) ctx.instance.upvotes = [];
      if (ctx.instance.downvotes === undefined) ctx.instance.downvotes = [];
      if (ctx.instance.tags === undefined) ctx.instance.tags = [];
    }
    next();
  });

};
