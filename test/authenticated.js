var app = require('../server/server.js');
var should = require('chai').should();
var assert = require('chai').assert;
var supertest = require('supertest');
var api = supertest('http://localhost:3000/api');

var User = app.models.User;

describe('Authenticated User', function() {

  var accessToken;
  var username = 'test-user1';
  var password = 'password'

  before(function(done){
    // populate the test db with data
    require('./setup');
    // log the user in
    User.login({username: username, password: password}, function(err, results) {
      if (err) { console.log(err); }
      accessToken = results.id;
      done();
    });
  });

  it('reads all blogs currectly', function(done) {
    api.get('/blogs?access_token='+accessToken)
    .expect(200)
    .end(function (err, res) {
       done();
     });
  });

  it('reads a blog comments correctly by id', function(done) {
    api.get('/blogs/test-blog1/comments')
    .expect(200, done);
  });

  it('successfully posts a new blog', function(done) {
    api.post('/blogs?access_token='+accessToken)
    .send({
      "title": "My Blog",
      "content": "My Content",
      "authorId": username
    })
    .expect(200, done);
  });

  it('successfully deletes a blog where current user is the owner', function(done) {
    api.delete('/blogs/test-blog-delete-me?access_token='+accessToken)
    .expect(204, done);
  });

  it('returns a 401 when deleting a blog where current user is NOT the owner', function(done) {
    api.delete('/blogs/test-blog3?access_token='+accessToken)
    .expect(401, done);
  });

  it('successfully creates a comment for a blog', function(done) {
    api.post('/blogs/test-blog1/comments?access_token='+accessToken)
    .send({
      "content": "This is my blog comment",
      "blogId": "test-blog1",
      "authorId": username
    })
    .expect(200, done)
  });

  it('successfully updates a blog post where the current user is the author', function(done) {
    api.put('/blogs/test-blog1?access_token='+accessToken)
    .set('Content-Type', 'application/json')
    .send({ "numOfUpVotes": "4" })
    .expect(200, done)
  });

  it('returns a 401 when updating a blog where the current user is NOT the author', function(done) {
    api.put('/blogs/test-blog2?access_token='+accessToken)
    .set('Content-Type', 'application/json')
    .send({ "numOfUpVotes": "4" })
    .expect(401, done)
  });

  it('returns a 403 error when an owner attempts to upvote their own blog', function(done) {
    api.post('/blogs/test-blog1/upvote?access_token='+accessToken)
    .expect(403, done)
  });

  it('successfully upvotes a blog not owned by the user', function(done) {
    api.post('/blogs/test-blog2/upvote?access_token='+accessToken)
    .expect(200)
    .expect(function (res) {
      assert.equal(res.body.numOfUpVotes, 1);
      assert.equal(res.body.upvotes.length, 1);
    })
    .end(done);
  });

  it('returns a 403 error when an owner attempts to downvote their own blog', function(done) {
    api.post('/blogs/test-blog1/downvote?access_token='+accessToken)
    .expect(403, done)
  });

  it('successfully downvotes a blog not owned by the user', function(done) {
    api.post('/blogs/test-blog2/downvote?access_token='+accessToken)
    .expect(200)
    .expect(function (res) {
      assert.equal(res.body.numOfDownVotes, 1);
      assert.equal(res.body.downvotes.length, 1);
    })
    .end(done);
  });

  it('successfully publish a blog the user owns', function(done) {
    api.put('/blogs/test-blog1/publish?access_token='+accessToken)
    .expect(200)
    .expect(function (res) {
      assert.equal(res.body.isPublished, true);
      assert.notEqual(res.body.publishedDate, null);
    })
    .end(done);
  });

  it('returns a 403 error when an owner attempts to like their own comment', function(done) {
    api.post('/comments/test-comment1/like?access_token='+accessToken)
    .expect(403, done)
  });

  it('successfully likes a comment not owned by the user', function(done) {
    api.post('/comments/test-comment2/like?access_token='+accessToken)
    .expect(200)
    .expect(function (res) {
      assert.equal(res.body.numOfLikes, 1);
      assert.equal(res.body.likes.length, 1);
    })
    .end(done);
  });

  it('returns a 403 error when an owner attempts to dislike their own comment', function(done) {
    api.post('/comments/test-comment1/dislike?access_token='+accessToken)
    .expect(403, done)
  });

  it('successfully dislikes a comment not owned by the user', function(done) {
    api.post('/comments/test-comment2/dislike?access_token='+accessToken)
    .expect(200)
    .expect(function (res) {
      assert.equal(res.body.numOfDislikes, 1);
      assert.equal(res.body.dislikes.length, 1);
    })
    .end(done);
  });

});
