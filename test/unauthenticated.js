var app = require('../server/server.js');
var should = require('chai').should();
var assert = require('chai').assert;
var supertest = require('supertest');
var api = supertest('http://localhost:3000/api');

var Blog = app.models.Blog;

describe('Unauthenticated User', function() {

  before(function(done){
    // populate the test db with data
    require('./setup');
    done();
  });

  it('returns all blogs correctly by descending date', function(done) {
    api.get('/blogs?filter[order]=createdDate DESC')
    .expect(200, done);
  });

  it('returns a blog correctly by id with comments', function(done) {
    api.get('/blogs/test-blog1?filter[include]=comments')
    .expect(200)
    .expect(function (res) {
      assert.equal(res.body.comments.length, 2);
    })
    .end(done);
  });

  it('returns all blogs correctly by author', function(done) {
    api.get('/blogs?filter[where][authorId]=test-user1')
    .expect(200, done);
  });

  it('returns all blogs correctly by keyword search', function(done) {
    api.get('/blogs?filter[where][title][like]=Two')
    .expect(200)
    .expect(function (res) {
      assert.equal(res.body.length, 1);
    })
    .end(done);
  });

  it('returns all blogs correctly by tag', function(done) {
    api.get('/blogs?filter[where][tags]=Java')
    .expect(200)
    .expect(function (res) {
      assert.equal(res.body.length, 2);
    })
    .end(done);
  });

  it('reads a blog comments correctly by id', function(done) {
    api.get('/blogs/test-blog1/comments')
    .expect(200, done);
  });

  it('reads a blog author correctly by id', function(done) {
    api.get('/blogs/test-blog1/author')
    .expect(200, done);
  });

  it('returns a 401 error for posting new blog', function(done) {
    api.post('/blogs')
    .send({
      "title": "My Blog",
      "content": "My Content"
    })
    .expect(401, done);
  });

  it('returns a 401 error for posting comments to a blog', function(done) {
    api.post('/blogs/test-blog1/comments')
    .send({
      "content": "This is my blog comment",
      "blogId": "test-blog1"
    })
    .expect(401, done);
  });

  it('returns a 401 error when trying to edit a blog', function(done) {
    api.put('/blogs/test-blog1')
    .send({
      "content": "This is my blog comment"
    })
    .expect(401, done);
  });

  it('returns a 401 when trying to upvote a blog', function(done) {
    api.post('/blogs/test-blog1/upvote')
    .expect(401)
    .end(done);
  });

  it('returns a 401 when trying to downvote a blog', function(done) {
    api.post('/blogs/test-blog1/downvote')
    .expect(401)
    .end(done);
  });

  it('returns a 401 when trying to publish a blog', function(done) {
    api.put('/blogs/test-blog1/publish')
    .expect(401, done);
  });

  it('returns a 401 error when trying to like a comment', function(done) {
    api.post('/comments/test-comment1/like')
    .expect(401, done)
  });

  it('returns a 401 error when trying to dislike a comment', function(done) {
    api.post('/comments/test-comment1/dislike')
    .expect(401, done)
  });

});
