var loopback = require('loopback');

module.exports = function(Comment) {

  Comment.disableRemoteMethod('deleteById', true);

  // Like
  Comment.like = function(id, cb) {
    // get the current context
    var ctx = loopback.getCurrentContext();
    Comment.findById(id, function(err, record){
      // get the calling username from the context & push to array
      record.likes.push(ctx.active.accessToken.userId);
      record.updateAttributes({numOfLikes: record.likes.length, likes: record.likes}, function(err, instance) {
        if (err) cb(err);
        if (!err) cb(null, instance);
      })
    })
  };

  Comment.remoteMethod(
    'like',
    {
      http: {path: '/:id/like', verb: 'post'},
      accepts: {arg: 'id', type: 'string', required: true, http: { source: 'path' }},
      returns: {root: true, type: 'object'},
      description: 'Marks a comment as liked.'
    }
  );

  Comment.beforeRemote('like', function(ctx, user, next) {
    Comment.findById(ctx.req.params.id, function(err, record){
      // do not let them like their own record
      if (record.authorId === ctx.req.accessToken.userId) {
        var err = new Error("User cannot like their own comment.");
        err.status = 403;
        next(err);
      } else if (record.likes.indexOf(ctx.req.accessToken.userId) != -1) {
        var err = new Error("User has already liked the comment.");
        err.status = 403;
        next(err);
      } else {
        next();
      }
    })
  });
  // LIKE

  // DISLIKE
  Comment.dislike = function(id, cb) {
    // get the current context
    var ctx = loopback.getCurrentContext();
    Comment.findById(id, function(err, record){
      // get the calling user from the context & push to array
      record.dislikes.push(ctx.active.accessToken.userId);
      record.updateAttributes({numOfDislikes: record.dislikes.length, likes: record.dislikes}, function(err, instance) {
        if (err) cb(err);
        if (!err) cb(null, instance);
      })
    })
  };

  Comment.remoteMethod(
    'dislike',
    {
      http: {path: '/:id/dislike', verb: 'post'},
      accepts: {arg: 'id', type: 'string', required: true, http: { source: 'path' }},
      returns: {root: true, type: 'object'},
      description: 'Marks a comment as disliked.'
    }
  );

  Comment.beforeRemote('dislike', function(ctx, user, next) {
    Comment.findById(ctx.req.params.id, function(err, record){
      // do not let them dislike their own record
      if (record.authorId === ctx.req.accessToken.userId) {
        var err = new Error("User cannot dislike their own comment.");
        err.status = 403;
        next(err);
      } else if (record.dislikes.indexOf(ctx.req.accessToken.userId) != -1) {
        var err = new Error("User has already disliked the comment.");
        err.status = 403;
        next(err);
      } else {
        next();
      }
    })
  });
  // DISLIKE

  Comment.observe('before save', function filterProperties(ctx, next) {
    if (ctx.instance) {
      // add a date before saving
      if (ctx.instance.postedDate === undefined) {
        ctx.instance.postedDate = new Date();
      }
      if (ctx.instance.likes === undefined) ctx.instance.likes = [];
      if (ctx.instance.dislikes === undefined) ctx.instance.dislikes = [];
    }
    next();
  });

};
