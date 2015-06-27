var app = require('../server/server.js');
var Promise = require("bluebird");
var Blog = app.models.Blog;
var User = app.models.User;
var Comment = app.models.Comment;
var Tag = app.models.Tag;

var createUsers = function() {
  return new Promise(function(resolve, reject) {
    User.create([
      {
        id: 'test-user1',
        username: 'test-user1',
        email: 'test-user1@appirio.com',
        password: 'password',
      },
      {
        id: 'test-user2',
        username: 'test-user2',
        email: 'test-user2@appirio.com',
        password: 'password',
      }
    ], function(err, records) {
      if (err) reject(err);
      if (!err) resolve(records);
    });
  });
};

var createBlogs = function(users) {
  return new Promise(function(resolve, reject) {
    Blog.create([
      {
        id: 'test-blog1',
        title: 'Test Blog One',
        content: 'This is my first test blog.',
        tags: ['Java', 'JavaScript'],
        authorId: 'test-user1'
      },
      {
        id: 'test-blog2',
        title: 'Test Blog Two',
        content: 'This is my second test blog.',
        tags: ['Java', 'JavaScript', 'Ruby'],
        authorId: 'test-user2'
      },
      {
        id: 'test-blog3',
        title: 'Test Blog Three',
        content: 'This is my third test blog.',
        tags: ['Ruby', 'JavaScript'],
        authorId: 'test-user2'
      },
      {
        id: 'test-blog-delete-me',
        title: 'Test Blog Four',
        content: 'This is my fourth test blog.',
        authorId: 'test-user1'
      }
    ], function(err, records) {
      if (err) reject(err);
      if (!err) resolve(records);
    });
  });
};

var createComments = function(blogs) {
  return new Promise(function(resolve, reject) {
    Comment.create([
      {
        "content": "This is my blog comment",
        "id": "test-comment1",
        "authorId": "test-user1",
        "blogId": "test-blog1"
      },
      {
        "content": "This is my blog comment",
        "id": "test-comment2",
        "authorId": "test-user2",
        "blogId": "test-blog2"
      }
    ], function(err, records) {
      if (err) reject(err);
      if (!err) resolve(records);
    });
  });
};

before(function(done) {
  createUsers()
    .then(function(users) {
      createBlogs(users);
    })
    .then(function(blogs) {
      createComments(blogs);
    })
    .finally(function() {
      done();
    })
    .catch(function(e) {
      console.log(e);
    });
})

after(function(done) {
   Blog.destroyAll();
   User.destroyAll();
   Comment.destroyAll();
   done();
})
