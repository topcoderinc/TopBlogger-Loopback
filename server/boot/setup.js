/**
* This boot script ensures that an admin user always exists
**/

module.exports = function(app) {
  var User = app.models.User;
  var Role = app.models.Role;
  var RoleMapping = app.models.RoleMapping;

  User.create([
    {
      id: 'jeffdonthemic',
      username: 'jeffdonthemic',
      email: 'jeff@jeffdouglas.com',
      password: 'password'
    }
  ], function(err, users) {

    if (!err) {
      //create the admin role
      Role.create({
        name: 'admin'
      }, function(err, role) {
        if (err) throw err;
        //make jeffdonthemic an admin
        role.principals.create({
          principalType: RoleMapping.USER,
          principalId: users[0].id
        }, function(err, principal) {
          if (err) throw err;
        });
      });

    }

  });
};
