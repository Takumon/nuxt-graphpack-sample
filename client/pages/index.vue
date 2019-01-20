<template>
  <table>
    <tr>
      <th>ID</th> 
      <th>名前</th> 
      <th>メール</th> 
      <th>年齢</th>
      <th>-</th>
    </tr>

    <tr v-for="user in users" :key="user.id">
      <template v-if="user.editable">
        <td>{{user.id}}</td>
        <td><input type="text" v-model="user.name"></td>
        <td><input type="email" v-model="user.email"></td>
        <td><input type="number" v-model="user.age"></td>
        <td>
          <button @click="updateUser(user)">編集完了</button>
          <button @click="deleteUser(user.id)">削除</button>
        </td>
      </template>
      <template v-else>
        <td>{{user.id}}</td>
        <td>{{user.name}}</td>
        <td>{{user.email}}</td>
        <td>{{user.age}}</td>
        <td>
          <button @click="chengeEditMode(user)">編集</button>
        </td>
      </template>
    </tr>

    <tr>
      <td></td>
      <td><input type="text" v-model="newUser.name" placeholder="名前"></td>
      <td><input type="email" v-model="newUser.email" placeholder="メール"></td>
      <td><input type="number" v-model="newUser.age" placeholder="年齢"></td>
      <td>
        <button @click="createUser(newUser)">登録</button>
      </td>
    </tr>
  </table>
</template>

<script>
import getUsersGql from '~/apollo/queries/getUsers.gql'
import createUserGql from '~/apollo/mutations/createUser.gql'
import updateUserGql from '~/apollo/mutations/updateUser.gql'
import deleteUserGql from '~/apollo/mutations/deleteUser.gql'
import userCreatedGql from '~/apollo/subscriptions/userCreated.gql'
import userUpdatedGql from '~/apollo/subscriptions/userUpdated.gql'
import userDeletedGql from '~/apollo/subscriptions/userDeleted.gql'

export default {
  data() {
    return {
      users: [],
      newUser: {
        name: null,
        email: null,
        age: null,
      }
    }
  },
  apollo: {
    users: {
      query: getUsersGql,
      // サーバ側でイベントが発行された時の処理を定義する
      subscribeToMore: [
        {
          document: userCreatedGql,
          updateQuery: (prev, { subscriptionData }) => {
            if (!subscriptionData.data) {
              return prev;
            }

            const newUser = subscriptionData.data.userCreated;
            return prev.users.push(newUser);
          }
        },
        {
          document: userUpdatedGql,
          updateQuery: (prev, { subscriptionData }) => {
            if (!subscriptionData.data) {
              return prev;
            }

            const updatedUser = subscriptionData.data.userUpdated;
            const targetUser = prev.users.find(user => user.id == updatedUser.id);
            targetUser.name = updatedUser.name;
            targetUser.email = updatedUser.email;
            targetUser.age = updatedUser.age;

            return prev.users;
          }
        },
        {
          document: userDeletedGql,
          updateQuery: (prev, { subscriptionData }) => {
            console.log('fdasfadfadfad')
            if (!subscriptionData.data) {
              return prev;
            }

            const deletedUser = subscriptionData.data.userDeleted;
            const userIndex = prev.users.findIndex(user => user.id == deletedUser.id);

            if (userIndex === -1) throw new Error('User not found');

            prev.users.splice(userIndex, 1);

            return prev.users;
          }
        }
      ]
    }
  },
  methods: {
    async createUser({name, email, age}) {

      const { data, error } = await this.$apollo.mutate({
        mutation: createUserGql,
        variables: {
          name,
          email,
          age,
        },
        // refetchQueriesは削除します
        // refetchQueriesの代わりにSubscriptionでユーザー情報を更新するためです
      })

      if (error) {
        console.log(error);
        return;
      }

      this.$apollo.queries.users.refresh()

      // 入力フォーム初期化
      this.newUser.name = null;
      this.newUser.email = null;
      this.newUser.age = null;
    },
    async updateUser(user) {

      const { data, error } = await this.$apollo.mutate({
        mutation: updateUserGql,
        variables: {
          id: user.id,
          name: user.name,
          email: user.email,
          age: user.age,
        },
        // refetchQueriesは削除します
        // refetchQueriesの代わりにSubscriptionでユーザー情報を更新するためです
      });

      if (error) {
        console.log(error);
        return;
      }

      // 編集を終了
      this.chengeEditMode(user);
    },
    async deleteUser(id) {

      const { data, error } = await this.$apollo.mutate({
        mutation: deleteUserGql,
        variables: {
          id
        },
        // refetchQueriesは削除します
        // refetchQueriesの代わりにSubscriptionでユーザー情報を更新するためです
      })

      if (error) {
        console.log(error);
        return;
      }
    },
    chengeEditMode(user) {
      const i = this.users.findIndex(u => u.id == user.id)
      if (i === -1 ) {
        throw new Error('該当するユーザは存在しません');
      }

      this.$set(this.users, i, {
        ...user,
        editable: !user.editable
      });
    }
  }
}
</script>
