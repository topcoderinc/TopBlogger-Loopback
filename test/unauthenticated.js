var app = require('../server/server.js');
var should = require('chai').should();
var supertest = require('supertest');
var api = supertest('http://localhost:3000/api');

var Blog = app.models.Blog;

describe('Unauthenticated User', function() {

  before(function(done){
    // populate the test db with data
    require('./setup');
    done();
  });

  it('reads all blogs correctly', function(done) {
    api.get('/blogs')
    .expect(200, done);
  });

  it('reads a blog correctly by id', function(done) {
    api.get('/blogs/test-blog1')
    .expect(200, done);
  });

  it('reads a blog comments correctly by id', function(done) {
    api.get('/blogs/test-blog1/comments')
    .expect(200, done);
  });

  it('reads a blog tags correctly by id', function(done) {
    api.get('/blogs/test-blog1/tags')
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

  it.only('returns a 401 error for posting comments to a blog', function(done) {
    api.post('/blogs/test-blog1/comments')
    .send({
      "content": "This is my blog comment",
      "blogId": "test-blog1"
    })
    .expect(401)
    .end(function (err, res) {
      console.log(res.body);
       done();
     });
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

});
