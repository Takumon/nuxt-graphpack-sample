<template>
<v-content>
  <v-dialog v-model="dialog" max-width="500px">
    <v-btn slot="activator" color="primary" dark class="mb-2">新規登録</v-btn>
    <v-card>
        <v-card-title>
        <span class="headline">{{ formTitle }}</span>
        </v-card-title>
        <v-card-text>
        <v-container grid-list-md>
          <v-layout wrap>
            <v-flex xs12 sm6 md4>
              <v-text-field v-model="editedItem.name" label="名前"></v-text-field>
            </v-flex>
            <v-flex xs12 sm6 md4>
              <v-text-field v-model="editedItem.email" label="メール"></v-text-field>
            </v-flex>
            <v-flex xs12 sm6 md4>
              <v-text-field v-model="editedItem.age" label="年齢"></v-text-field>
            </v-flex>
          </v-layout>
        </v-container>
        </v-card-text>
        <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue darken-1" flat @click.native="close">Cancel</v-btn>
        <v-btn color="blue darken-1" flat @click.native="save">Save</v-btn>
        </v-card-actions>
    </v-card>
  </v-dialog>


  <v-data-table
    :headers="headers"
    :items="users"
    class="elevation-1"
  >
    <template slot="items" slot-scope="props">
      <td>{{ props.item.id }}</td>
      <td>{{ props.item.name }}</td>
      <td>{{ props.item.email }}</td>
      <td>{{ props.item.age }}</td>
      <td class="justify-center layout px-0">
        <v-btn icon class="mx-0" @click="editItem(props.item)">
          <v-icon color="teal">edit</v-icon>
        </v-btn>
        <v-btn icon class="mx-0" @click="deleteItem(props.item)">
          <v-icon color="pink">delete</v-icon>
        </v-btn>
      </td>
    </template>
  </v-data-table>
</v-content>
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
      dialog: false,
      headers: [
        { text: 'ID'      , value: 'id' },
        { text: '名前'    , value: 'name' },
        { text: 'メール'  , value: 'mail' },
        { text: '年齢'    , value: 'age' },
        { text: '更新 / 削除', align: 'center'},
      ],
      editedIndex: -1,
      users: [],
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
  computed: {
    formTitle() {
        return this.editedIndex === -1 ? 'ユーザー新規登録' : 'ユーザー更新'
    }
  },
  watch: {
    dialog(val) {
        val || this.close()
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
      })

      if (error) {
        console.log(error);
      }

      this.close()
    },
    async updateItem({id, name, email, age}) {

      const { data, error } = await this.$apollo.mutate({
        mutation: updateUserGql,
        variables: {
          id,
          name,
          email,
          age,
        },
      });

      if (error) {
        console.log(error);
      }

      this.close()
    },
    async deleteItem(item) {
      const index = this.users.indexOf(item)
      if (!confirm(`ユーザー(${item.name})を削除しますか?`)) {
        return
      } 
      
      const { data, error } = await this.$apollo.mutate({
        mutation: deleteUserGql,
        variables: {
          id: item.id
        },
      })

      if (error) {
        console.log(error);
      }

      this.close()
    },
    editItem(item) {
      this.editedIndex = this.users.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.dialog = true
    },
    close() {
      this.dialog = false
      setTimeout(() => {
        this.editedItem = Object.assign({}, this.defaultEditedItem)
        this.editedIndex = -1
      }, 300)
    },
    async save() {
      if (this.editedIndex > -1) {
        this.updateItem(this.editedItem)
      } else {
        this.createItem(this.editedItem)
      }
    }
  }
}
</script>
