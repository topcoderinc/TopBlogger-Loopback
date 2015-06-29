var loopback = require('loopback');
var slugify = require('slugify');

module.exports = function(Blog) {

  // Register a 'publish' remote method: /blogs/some-id/publish
  Blog.remoteMethod(
    'publish',
    {
      http: {path: '/:id/publish', verb: 'put'},
      accepts: {arg: 'id', type: 'string', required: true, http: { source: 'path' }},
      returns: {root: true, type: 'object'},
      description: 'Marks a blog as published.'
    }
  );

  // the actual function called by the route to do the work
  Blog.publish = function(id, cb) {
    Blog.findById(id, function(err, record){
      record.updateAttributes({isPublished: true, publishedDate: new Date()}, function(err, instance) {
        if (err) cb(err);
        if (!err) cb(null, instance);
      })
    })
  };
  // PUBLISH

  // Register an 'upvote' remote method: /blogs/some-id/upvote
  Blog.remoteMethod(
    'upvote',
    {
      http: {path: '/:id/upvote', verb: 'post'},
      accepts: {arg: 'id', type: 'string', required: true, http: { source: 'path' }},
      returns: {root: true, type: 'object'},
      description: 'Marks a blog as upvoted.'
    }
  );

  // Model hook called before running function
  Blog.beforeRemote('upvote', function(ctx, user, next) {
    Blog.findById(ctx.req.params.id, function(err, record){
      // do not let the user upvote their own record
      if (record.authorId === ctx.req.accessToken.userId) {
        var err = new Error("User cannot upvote their own blog post.");
        err.status = 403;
        next(err);
      // do no let the user upvote a comment more than once
      } else if (record.upvotes.indexOf(ctx.req.accessToken.userId) != -1) {
        var err = new Error("User has already upvoted the blog.");
        err.status = 403;
        next(err);
      } else {
        next();
      }
    })
  });

  // the actual function called by the route to do the work
  Blog.upvote = function(id, cb) {
    // get the current context
    var ctx = loopback.getCurrentContext();
    Blog.findById(id, function(err, record){
      // get the calling user who 'upvoted' it from the context
      record.upvotes.push(ctx.active.accessToken.userId);
      record.updateAttributes({numOfUpVotes: record.upvotes.length, upvotes: record.upvotes}, function(err, instance) {
        if (err) cb(err);
        if (!err) cb(null, instance);
      })
    })
  };
  // UPVOTE

  // Register a 'downvote' remote method: /blogs/some-id/downvote
  // Note: essentially the same code as upvote
  Blog.remoteMethod(
    'downvote',
    {
      http: {path: '/:id/downvote', verb: 'post'},
      accepts: {arg: 'id', type: 'string', required: true, http: { source: 'path' }},
      returns: {root: true, type: 'object'},
      description: 'Marks a blog as downvoted.'
    }
  );

  // Model hook called before running function
  Blog.beforeRemote('downvote', function(ctx, user, next) {
    Blog.findById(ctx.req.params.id, function(err, record){
      // do not let the user downvote their own record
      if (record.authorId === ctx.req.accessToken.userId) {
        var err = new Error("User cannot downvote their own blog post.");
        err.status = 403;
        next(err);
      // do no let the user downvote a comment more than once
      } else if (record.downvotes.indexOf(ctx.req.accessToken.userId) != -1) {
        var err = new Error("User has already downvoted the blog.");
        err.status = 403;
        next(err);
      } else {
        next();
      }
    })
  });

  // the actual function called by the route to do the work
  Blog.downvote = function(id, cb) {
    // get the current context
    var ctx = loopback.getCurrentContext();
    Blog.findById(id, function(err, record){
      // get the calling user who 'downvoted' it from the context
      record.downvotes.push(ctx.active.accessToken.userId);
      record.updateAttributes({numOfDownVotes: record.downvotes.length, downvote: record.downvotes}, function(err, instance) {
        if (err) cb(err);
        if (!err) cb(null, instance);
      })
    })
  };
  // DOWNVOTE

  // Call an operation hook that runs before each record is saved
  Blog.observe('before save', function filterProperties(ctx, next) {
    // TODO ensure the slug is unique per user
    // If there is a record in the context
    if (ctx.instance) {
      // slugify the title
      if (ctx.instance.slug === undefined) {
        ctx.instance.slug = slugify(ctx.instance.title).toLowerCase();
      }
      // Ensure a valid createdDate
      if (ctx.instance.createdDate === undefined) {
        ctx.instance.createdDate = new Date();
      }
      // Ensure the lines, dislikes and tags are an empty array
      if (ctx.instance.upvotes === undefined) ctx.instance.upvotes = [];
      if (ctx.instance.downvotes === undefined) ctx.instance.downvotes = [];
      if (ctx.instance.tags === undefined) ctx.instance.tags = [];
    }
    next();
  });

};
