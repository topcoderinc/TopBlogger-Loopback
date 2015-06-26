module.exports = function(Comment) {

  Comment.observe('before save', function filterProperties(ctx, next) {
    // add a date before saving
    if (ctx.instance.postedDate === undefined) {
      ctx.instance.postedDate = new Date();
    }
    next();
  });

};
