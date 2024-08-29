const trimStr = require('./utils');
const users = [];

const findUser = user => {
  const userName = trimStr(user.name);
  const userRoom = trimStr(user.room);
  return users.find(
    u => trimStr(u.name) === userName && trimStr(u.room) === userRoom
  );
};

const addUser = user => {
  const isExist = findUser(user);
  !isExist && users.push(user);

  const currentUser = isExist || user;
  return { isExist: !!isExist, user: currentUser };
};

const deleteUser = user => {
  const userIndex = users.findIndex(
    u => user.name === u.name && user.room === u.room
  );
  users.splice(userIndex, 1);
};

const getRoomUsers = room => users.filter(u => u.room === room);

module.exports = { addUser, findUser, getRoomUsers, deleteUser };
