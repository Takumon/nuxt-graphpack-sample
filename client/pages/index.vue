<template>
  <div>
    <button @click="isShowEditArea = true">新規登録</button>

    <table>
      <tr>
        <th>ID</th> 
        <th>名前</th> 
        <th>メール</th> 
        <th>年齢</th>
        <th>-</th>
      </tr>

      <tr v-for="item in users" :key="item.id">
        <td>{{item.id}}</td>
        <td>{{item.name}}</td>
        <td>{{item.email}}</td>
        <td>{{item.age}}</td>
        <td>
          <button @click="editItem(item)">編集</button>
          <button @click="deleteItem(item)">削除</button>
        </td>
      </tr>
    </table>

    <div v-if="isShowEditArea">
      <h2>{{ formTitle }}</h2>
      <div>
        <input type="text" v-model="editedItem.name" placeholder="名前">
      </div>
      <div>
        <input type="email" v-model="editedItem.email" placeholder="メール">
      </div>
      <div>
        <input type="number" v-model="editedItem.age" placeholder="年齢">
      </div>
      <div>
        <button @click="close">キャンセル</button>
        <button @click="save">保存</button>
      </div>
    </div>

  </div>
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
      },
      isShowEditArea: false,
      editedIndex: -1,
      editedItem: {
        id: null,
        name: null,
        email: null,
        age: null,
      },
      defaultEditedItem: {
        id: null,
        name: null,
        email: null,
        age: null,
      }
    }
  },
  computed: {
    formTitle() {
        return this.editedIndex === -1 ? 'ユーザー新規登録' : 'ユーザー更新'
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
    async createItem({name, email, age}) {

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
      }

      this.close();
    },
    async updateItem({ id, name, email, age }) {

      const { data, error } = await this.$apollo.mutate({
        mutation: updateUserGql,
        variables: {
          id,
          name,
          email,
          age,
        },
        // refetchQueriesは削除します
        // refetchQueriesの代わりにSubscriptionでユーザー情報を更新するためです
      });

      if (error) {
        console.log(error);
      }

      this.close();
    },
    async deleteItem(item) {
      const index = this.users.indexOf(item)
      if (!confirm(`ユーザー(${item.name})を削除しますか?`)) {
        return
      }

      const { data, error } = await this.$apollo.mutate({
        mutation: deleteUserGql,
        variables: {
          id: item.id,
        },
        // refetchQueriesは削除します
        // refetchQueriesの代わりにSubscriptionでユーザー情報を更新するためです
      })

      if (error) {
        console.log(error);
      }
    },
    editItem(item) {
      this.editedIndex = this.users.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.isShowEditArea = true
    },
    close() {
      this.isShowEditArea = false
      setTimeout(() => {
        this.editedItem = Object.assign({}, this.defaultEditedItem)
        this.editedIndex = -1
      }, 300)
    },
    save() {
      if (this.editedIndex > -1) {
        this.updateItem(this.editedItem)
      } else {
        this.createItem(this.editedItem)
      }
    }
  }
}
</script>
