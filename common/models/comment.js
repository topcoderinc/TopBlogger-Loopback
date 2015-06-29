var loopback = require('loopback');

module.exports = function(Comment) {

  // remove the DELETE functionality from API
  Comment.disableRemoteMethod('deleteById', true);

  // Register a 'like' remote method: /blogs/some-id/like
  Comment.remoteMethod(
    'like',
    {
      http: {path: '/:id/like', verb: 'post'},
      accepts: {arg: 'id', type: 'string', required: true, http: { source: 'path' }},
      returns: {root: true, type: 'object'},
      description: 'Marks a comment as liked.'
    }
  );

  // Model hook called before running function
  Comment.beforeRemote('like', function(ctx, user, next) {
    Comment.findById(ctx.req.params.id, function(err, record){
      // do not let the user like their own record
      if (record.authorId === ctx.req.accessToken.userId) {
        var err = new Error("User cannot like their own comment.");
        err.status = 403;
        next(err);
      // do no let the user like a comment more than once
      } else if (record.likes.indexOf(ctx.req.accessToken.userId) != -1) {
        var err = new Error("User has already liked the comment.");
        err.status = 403;
        next(err);
      } else {
        next();
      }
    })
  });

  // the actual function called by the route to do the work
  Comment.like = function(id, cb) {
    // get the current context
    var ctx = loopback.getCurrentContext();
    Comment.findById(id, function(err, record){
      // get the calling user who 'liked' it from the context
      record.likes.push(ctx.active.accessToken.userId);
      record.updateAttributes({numOfLikes: record.likes.length, likes: record.likes}, function(err, instance) {
        if (err) cb(err);
        if (!err) cb(null, instance);
      })
    })
  };
  // LIKE

  // Register a 'dislike' remote method: /blogs/some-id/dislike
  Comment.remoteMethod(
    'dislike',
    {
      http: {path: '/:id/dislike', verb: 'post'},
      accepts: {arg: 'id', type: 'string', required: true, http: { source: 'path' }},
      returns: {root: true, type: 'object'},
      description: 'Marks a comment as disliked.'
    }
  );

  // Model hook called before running function
  Comment.beforeRemote('dislike', function(ctx, user, next) {
    Comment.findById(ctx.req.params.id, function(err, record){
      // do not let the user dislike their own record
      if (record.authorId === ctx.req.accessToken.userId) {
        var err = new Error("User cannot dislike their own comment.");
        err.status = 403;
        next(err);
      // do no let the user dislike a comment more than once
      } else if (record.dislikes.indexOf(ctx.req.accessToken.userId) != -1) {
        var err = new Error("User has already disliked the comment.");
        err.status = 403;
        next(err);
      } else {
        next();
      }
    })
  });

  // the actual function called by the route to do the work
  Comment.dislike = function(id, cb) {
    // get the current context
    var ctx = loopback.getCurrentContext();
    Comment.findById(id, function(err, record){
      // get the calling user who 'disliked' it from the context
      record.dislikes.push(ctx.active.accessToken.userId);
      record.updateAttributes({numOfDislikes: record.dislikes.length, likes: record.dislikes}, function(err, instance) {
        if (err) cb(err);
        if (!err) cb(null, instance);
      })
    })
  };
  // DISLIKE

  // Call an operation hook that runs before each record is saved
  Comment.observe('before save', function filterProperties(ctx, next) {
    // If there is a record in the context
    if (ctx.instance) {
      // Ensure a valid postedDate
      if (ctx.instance.postedDate === undefined) {
        ctx.instance.postedDate = new Date();
      }
      // Ensure the lines and dislikes are an empty array
      if (ctx.instance.likes === undefined) ctx.instance.likes = [];
      if (ctx.instance.dislikes === undefined) ctx.instance.dislikes = [];
    }
    next();
  });

};
