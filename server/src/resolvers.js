import { PubSub } from 'apollo-server';
import { users, generateId } from './db';
const pubsub = new PubSub();

const EVENT = {
    USER_CRAETED: 'userCreated',
    USER_UPDATED: 'userUpdated',
    USER_DELETED: 'userDeleted',
};

const resolvers = {    
  Query: {
    user: (parent, { id }, context, info) => users.find(user => user.id == id),
    users: (parent, args, context, info) => users,
    hello: () => 'world!',
  },
  Mutation: {
    createUser: (parent, { name, email, age }, context, info) => {
      const newUser = { id: generateId(), name, email, age};
      users.push(newUser);
            
      pubsub.publish(EVENT.USER_CRAETED, {[EVENT.USER_CRAETED]: newUser});
      return newUser;
    },
    updateUser: (parent, { id, name, email, age }, context, info) => {
      const updatedUser = users.find(user => user.id == id);
      updatedUser.name = name;
      updatedUser.email = email;
      updatedUser.age = age;

      pubsub.publish(EVENT.USER_UPDATED, {[EVENT.USER_UPDATED]: updatedUser});
      return updatedUser;
    },
    deleteUser: (parent, { id }, context, info) => {
      const userIndex = users.findIndex(user => user.id == id);

    if (userIndex === -1) throw new Error('User not found');
      const [deletedUser] = users.splice(userIndex, 1);
      pubsub.publish(EVENT.USER_DELETED, {[EVENT.USER_DELETED]: deletedUser});
      return deletedUser;
    }
  },
  Subscription: {
    [EVENT.USER_CRAETED]: {
      subscribe: () => pubsub.asyncIterator([EVENT.USER_CRAETED])
    },
    [EVENT.USER_UPDATED]: {
      subscribe: () => pubsub.asyncIterator([EVENT.USER_UPDATED])
    },
    [EVENT.USER_DELETED]: {
      subscribe: () => pubsub.asyncIterator([EVENT.USER_DELETED])
    },
  },
};

export default resolvers;