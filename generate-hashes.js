const bcrypt = require('bcryptjs');

Promise.all([
  bcrypt.hash('admin123', 10),
  bcrypt.hash('teacher123', 10),
  bcrypt.hash('student123', 10)
]).then(([admin, teacher, student]) => {
  console.log('Admin:', admin);
  console.log('Teacher:', teacher);
  console.log('Student:', student);
});
